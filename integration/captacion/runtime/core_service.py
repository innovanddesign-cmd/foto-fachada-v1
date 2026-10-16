"""Capa de aplicación de captación. Sin listener, login propio ni conexiones.

El adaptador debe aportar authenticate(headers) desde una sesión verificada en
servidor. No convertir cabeceras de identidad/rol del navegador en VerifiedSession.
No sustituye core_session.php ni acredita una integración desplegada con el ERP.
"""
from copy import deepcopy
from dataclasses import dataclass
from datetime import datetime, timezone
from hashlib import sha256
import json
import re
from uuid import UUID

from core_repository import RepositoryError, RevisionConflict
from motor import RuleError, iso, evidence_digest


MAX_BODY = 16_384
ALLOWED_ORIGINS = frozenset(("https://innovandesign.com", "https://www.innovandesign.com"))
WRITE_ROLES = frozenset(("admin", "director"))
COMMANDS = {
    "review_evidence": ("evidence_reviewed", frozenset(("reference", "evidence_hash"))),
    "review_proposal": ("proposal_approved", frozenset(("offer_ref", "content_hash"))),
    "exclude_contact": ("opt_out", frozenset(("reference",))),
    "close_opportunity": ("close_opportunity", frozenset(("reason",))),
}


@dataclass(frozen=True)
class VerifiedSession:
    """Resultado interno del verificador existente, nunca JSON del navegador."""
    organization_id: str
    actor_id: str
    role: str
    active: bool
    expires_at: datetime


@dataclass(frozen=True)
class Response:
    status: int
    body: dict

    @property
    def headers(self):
        return {"Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store"}


class ApiError(ValueError):
    def __init__(self, status, message):
        super().__init__(message)
        self.status = status


def _object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("Claves repetidas")
        result[key] = value
    return result


def _reject_constant(value):
    raise ValueError("Número no finito")


def _command(raw):
    if not isinstance(raw, bytes) or len(raw) > MAX_BODY:
        raise ApiError(413, "Solicitud demasiado grande")
    try:
        body = json.loads(raw.decode("utf-8"), object_pairs_hook=_object,
                          parse_constant=_reject_constant)
    except (ValueError, UnicodeError, RecursionError):
        raise ApiError(400, "JSON no válido") from None
    fields = {"command_id", "command", "opportunity_id", "expected_revision", "expected_version", "data"}
    if not isinstance(body, dict) or set(body) != fields:
        raise ApiError(400, "Campos de comando no válidos")
    try:
        if str(UUID(body["command_id"])) != body["command_id"]:
            raise ValueError()
    except (ValueError, TypeError, AttributeError):
        raise ApiError(400, "Identificador de comando no válido") from None
    if not isinstance(body["command"], str) or body["command"] not in COMMANDS:
        raise ApiError(403, "Acción no disponible para el operador")
    if (not isinstance(body["opportunity_id"], str) or
            not 1 <= len(body["opportunity_id"]) <= 300 or
            body["opportunity_id"] != body["opportunity_id"].strip()):
        raise ApiError(400, "Oportunidad no válida")
    for key in ("expected_revision", "expected_version"):
        if type(body[key]) is not int or not 1 <= body[key] <= 2**53 - 1:
            raise ApiError(400, "Revisión y versión requeridas")
    expected = COMMANDS[body["command"]][1]
    data = body["data"]
    if not isinstance(data, dict) or set(data) != expected:
        raise ApiError(400, "Datos de comando no válidos")
    for value in data.values():
        if not isinstance(value, str) or not value.strip() or len(value) > 2000:
            raise ApiError(400, "Texto de comando no válido")
    if body["command"] == "review_proposal" and not re.fullmatch(r"[0-9a-f]{64}", data["content_hash"]):
        raise ApiError(400, "Huella del contenido requerida")
    if body['command'] == 'review_evidence' and not re.fullmatch(r'[0-9a-f]{64}', data['evidence_hash']):
        raise ApiError(400, 'Huella de los hallazgos requerida')
    return body


def _summary(state):
    # No devolver contactos, referencias de pago, historial o snapshot editable.
    return {"mode": state["mode"], "revision": state["revision"],
            "opportunities": [{"id": op["id"], "route": op["route"],
                "business_name": state["businesses"][op["business_id"]]["name"],
                "status": op["status"], "version": op["version"],
                "approved": op["approved"], "closed": op["closed"], "paid": op["paid"],
                "expires_at": op["expires_at"]} for op in state["opportunities"].values()],
            "external_actions_enabled": False}


class CaptacionService:
    """Contrato HTTP ensayable. authenticate se invoca en CADA petición.

    writes_enabled=False por defecto. Habilitarlo en un ensayo no concede permiso
    para escribir en Core real. No hay endpoint de snapshot, envío, pago o webhooks.
    """
    def __init__(self, repository, authenticate, *, writes_enabled=False, clock=None):
        self.repository = repository
        self.authenticate = authenticate
        self.writes_enabled = writes_enabled is True
        self.clock = clock or (lambda: datetime.now(timezone.utc))

    def _session(self, headers, now):
        try:
            session = self.authenticate(headers)
        except Exception:
            raise ApiError(503, "No se pudieron verificar los permisos") from None
        if not isinstance(session, VerifiedSession):
            raise ApiError(401, "Sesión verificada requerida")
        if (session.active is not True or not isinstance(session.role, str) or not session.role or
                not isinstance(session.actor_id, str) or not session.actor_id.strip() or
                len(session.actor_id) > 256):
            raise ApiError(403, "Acceso no autorizado")
        try:
            if str(UUID(session.organization_id)) != session.organization_id:
                raise ValueError()
            if session.expires_at.tzinfo is None or session.expires_at <= now:
                raise ValueError()
        except (ValueError, TypeError, AttributeError):
            raise ApiError(401, "Sesión no válida o caducada") from None
        return session

    def handle(self, method, path, headers=None, body=b""):
        try:
            headers = {k.lower(): v for k, v in (headers or {}).items()}
            now = self.clock()
            if not isinstance(now, datetime) or now.tzinfo is None:
                raise ApiError(503, "Reloj del servidor no disponible")
            origin = headers.get("origin", "")
            if origin and origin not in ALLOWED_ORIGINS:
                raise ApiError(403, "Origen no autorizado")
            session = self._session(headers, now)
            if path == '/captacion/proposals' and method == 'POST':
                if origin not in ALLOWED_ORIGINS or session.role not in WRITE_ROLES:
                    raise ApiError(403, 'Revision de operador requerida')
                if headers.get('content-type','').split(';',1)[0].strip().lower()!='application/json':
                    raise ApiError(415, 'Se requiere application/json')
                if not isinstance(body,bytes) or len(body)>MAX_BODY:raise ApiError(413,'Solicitud demasiado grande')
                try:
                    data=json.loads(body.decode('utf-8'),object_pairs_hook=_object,parse_constant=_reject_constant)
                except (ValueError,UnicodeError,RecursionError):raise ApiError(400,'JSON no valido') from None
                fields={'opportunity_id','expected_revision','expected_version','template_id','values','offer_ref'}
                if not isinstance(data,dict) or set(data)!=fields or not isinstance(data['values'],dict):
                    raise ApiError(400,'Campos de propuesta no validos')
                for key in ('opportunity_id','template_id','offer_ref'):
                    if not isinstance(data[key],str) or not 1<=len(data[key])<=300:raise ApiError(400,'Referencia invalida')
                if any(not isinstance(v,str) or len(v)>2000 for v in data['values'].values()):
                    raise ApiError(400,'Variables de propuesta invalidas')
                state=self.repository.load(session.organization_id)
                op=state['opportunities'].get(data['opportunity_id'])
                if op is None:raise ApiError(404,'Oportunidad no disponible')
                if (type(data['expected_revision']) is not int or type(data['expected_version']) is not int
                    or data['expected_revision']!=state['revision'] or data['expected_version']!=op['version']):
                    raise ApiError(409,'Hay cambios; recarga antes de preparar')
                from propuestas import prepare_proposal
                proposal=prepare_proposal(state,op['id'],data['template_id'],data['values'],data['offer_ref'])
                return Response(200,{'revision':state['revision'],'version':op['version'],'proposal':proposal,
                                     'external_actions_enabled':False})
            if path == '/captacion/evidence' and method == 'GET':
                state = self.repository.load(session.organization_id)
                return Response(200, {'mode': state['mode'], 'revision': state['revision'],
                    'external_actions_enabled': False, 'items': [
                        {'opportunity_id': op['id'], 'version': op['version'],
                         'evidence_hash': evidence_digest(op['evidence']),
                         'evidence': [{key: item.get(key) for key in
                             ('source', 'observed_at', 'finding', 'verified')} for item in op['evidence']]}
                        for op in state['opportunities'].values()]})
            if path == "/captacion/escaparates" and method == "GET":
                from escaparates_bridge import integration_status
                return Response(200, integration_status(
                    self.repository.load(session.organization_id), now))
            if path == "/captacion" and method == "GET":
                return Response(200, _summary(self.repository.load(session.organization_id)))
            if path != "/captacion/commands":
                raise ApiError(404, "Ruta no disponible")
            if method != "POST":
                raise ApiError(405, "Método no permitido")
            if origin not in ALLOWED_ORIGINS:
                raise ApiError(403, "Origen requerido")
            if session.role not in WRITE_ROLES:
                raise ApiError(403, "Tu cuenta no tiene permiso de escritura")
            if not self.writes_enabled:
                raise ApiError(503, "Escritura de captación no habilitada")
            if headers.get("content-type", "").split(";", 1)[0].strip().lower() != "application/json":
                raise ApiError(415, "Se requiere application/json")
            command = _command(body)
            digest = sha256(json.dumps(command, sort_keys=True, ensure_ascii=False,
                                       separators=(",", ":")).encode()).hexdigest()
            eid = "operator:" + command["command_id"]

            def build_event(state):
                if eid in state["events"]:
                    item = next((h for h in state["history"] if h["event_id"] == eid), None)
                    audit = item.get("data", {}).get("_operator", {}) if item else {}
                    if audit.get("command_sha256") != digest or audit.get("actor_id") != session.actor_id:
                        raise ApiError(409, "Identificador de comando ya utilizado")
                    return {"id": eid, "type": item["type"], "at": item["at"],
                            "opportunity_id": item["opportunity_id"],
                            "expected_version": command["expected_version"], "data": deepcopy(item["data"])}
                if command["opportunity_id"] not in state["opportunities"]:
                    raise ApiError(404, "Oportunidad no disponible")
                if state["opportunities"][command["opportunity_id"]]["version"] != command["expected_version"]:
                    raise ApiError(409, "Hay cambios; recarga antes de aplicar")
                data = deepcopy(command["data"])
                if command["command"] in ("review_proposal", "review_evidence"):
                    data["reviewer"] = session.actor_id
                data["_operator"] = {"actor_id": session.actor_id, "role": session.role,
                                     "command_sha256": digest}
                return {"id": eid, "type": COMMANDS[command["command"]][0], "at": iso(now),
                        "opportunity_id": command["opportunity_id"],
                        "expected_version": command["expected_version"], "data": data}

            state = self.repository.apply_derived(session.organization_id, build_event,
                        expected_revision=command["expected_revision"])
            return Response(200, {**_summary(state), "command_id": command["command_id"]})
        except ApiError as exc:
            return Response(exc.status, {"error": str(exc)})
        except RevisionConflict:
            return Response(409, {"error": "Hay cambios; recarga antes de aplicar"})
        except RuleError:
            return Response(422, {"error": "La acción no cumple las condiciones del flujo"})
        except RepositoryError:
            return Response(503, {"error": "Estado no disponible; no se ha confirmado el guardado"})
        except Exception:
            # No devolver excepciones DB, credenciales, trazas ni payloads internos.
            return Response(503, {"error": "Servicio no disponible; no se ha confirmado el guardado"})
