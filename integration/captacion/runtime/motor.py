"""Motor puro de captación: calcula estados/intenciones; no envía ni modifica Core.

Los snapshots son ensayos exportables, no un CRM ni registros de ventas reales.
El adaptador futuro debe aplicar versión esperada + outbox en una transacción.
"""
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from hashlib import sha256
import json
import re
from urllib.parse import urlsplit

ROUTES = ("INNOVA", "ESCAPARATES", "GOOGLE")
CHANNELS = ("email", "whatsapp", "telefono")


class RuleError(ValueError):
    pass


def timestamp(value):
    try:
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except (ValueError, AttributeError) as exc:
        raise RuleError("Fecha ISO inválida") from exc
    if dt.tzinfo is None:
        raise RuleError("La fecha necesita zona horaria")
    return dt.astimezone(timezone.utc)


def iso(dt):
    return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def required(data, *keys):
    for key in keys:
        if not isinstance(data.get(key), str) or not data[key].strip():
            raise RuleError("Falta " + key)


def https_url(value, allow_http=False):
    p = urlsplit(value)
    if p.scheme not in (("https", "http") if allow_http else ("https",)) or not p.hostname or p.username or p.password:
        raise RuleError("Se necesita URL HTTPS sin credenciales")
    return value


def contact_key(channel, value):
    if channel not in CHANNELS:
        raise RuleError("Canal no reconocido")
    value = value.strip().casefold()
    if channel == "email":
        if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", value):
            raise RuleError("Email inválido")
        return "email:" + value
    # Ambos canales telefónicos comparten exclusión/coordinación. Sin inferir país.
    number = re.sub(r"[\s().-]", "", value)
    if number.startswith("00"):
        number = "+" + number[2:]
    if not re.fullmatch(r"\+[1-9][0-9]{6,14}", number):
        raise RuleError("Teléfono sin formato internacional +país")
    return "tel:" + number


def new_state():
    return {"schema_version": 1, "mode": "ensayo_sin_conectores", "revision": 0,
            "businesses": {}, "opportunities": {}, "suppressed": [],
            "events": {}, "effects": {}, "history": []}


def evidence_digest(evidence):
    return sha256(json.dumps(evidence, sort_keys=True, ensure_ascii=False,
                             separators=(',', ':'), allow_nan=False).encode()).hexdigest()


def add_opportunity(state, *, business_id, name, route, evidence, contact=None):
    """business_id debe ser el ID canónico al integrar. No fusionar por email."""
    if route not in ROUTES or not business_id.strip() or not name.strip():
        raise RuleError("Empresa o ruta inválida")
    evidence = deepcopy(evidence)
    for item in evidence:
        required(item, "source", "observed_at", "finding")
        https_url(item["source"], allow_http=True)
        timestamp(item["observed_at"])
        if not isinstance(item.get("verified", False), bool):
            raise RuleError("verified debe ser booleano")
    key = None
    if contact:
        required(contact, "channel", "value")
        key = contact_key(contact["channel"], contact["value"])
    oid = business_id + ":" + route
    if oid in state["opportunities"]:
        raise RuleError("Oportunidad duplicada; actualizar la existente")
    nxt = deepcopy(state)
    business = nxt["businesses"].setdefault(business_id, {"name": name, "blocked": False})
    if business["name"] != name:
        raise RuleError("ID existente con nombre distinto: resolver identidad en Core")
    nxt["opportunities"][oid] = {
        "id": oid, "business_id": business_id, "route": route, "evidence": evidence,
        "contact": deepcopy(contact), "contact_key": key,
        "status": "preparado", "approved": False, "channel_authorization": None,
        "demo": None, "first_delivery_at": None, "expires_at": None,
        "delivery_id": None, "paid": False, "payment_ref": None,
        "closed": False, "version": 1,
        "dispatch": None,
    }
    nxt["revision"] += 1
    return nxt, oid


def blocked(state, opp):
    return (state["businesses"][opp["business_id"]]["blocked"] or
            opp["contact_key"] in state["suppressed"])


def _same_contact(a, b):
    return (a["business_id"] == b["business_id"] or
            bool(a["contact_key"] and a["contact_key"] == b["contact_key"]))


def _contact_checks(state, opp, at):
    if blocked(state, opp):
        raise RuleError("Contacto excluido en todos los flujos")
    auth = opp["channel_authorization"]
    if not auth or timestamp(auth["valid_until"]) <= at:
        raise RuleError("Falta habilitación vigente y documentada del canal")
    if timestamp(auth["authorized_at"]) > at:
        raise RuleError("La entrega precede a la autorización del canal")
    if not opp["approved"]:
        raise RuleError("Propuesta sin revisión")
    if timestamp(opp["approved_at"]) > at:
        raise RuleError("La entrega precede a la revisión de la propuesta")
    for other in state["opportunities"].values():
        dispatch = other.get("dispatch")
        occupied = bool(dispatch and dispatch["status"] in ("reserved", "sending", "uncertain"))
        if other["id"] != opp["id"] and _same_contact(opp, other) and (
            occupied or (other["first_delivery_at"] and not other["closed"])
        ):
            raise RuleError("Ya existe otra conversación comercial activa")


def _effect(state, opp, kind, payload):
    eid = opp["id"] + ":" + kind
    if eid not in state["effects"]:
        state["effects"][eid] = {
            "id": eid, "opportunity_id": opp["id"], "kind": kind,
            "status": "pendiente_integracion", "expected_opportunity_version": opp["version"],
            "payload": payload, "executed": False,
        }


def _cancel_messages(state, predicate):
    for effect in state["effects"].values():
        op = state["opportunities"][effect["opportunity_id"]]
        if effect["kind"] == "aviso_free" and predicate(op):
            effect["status"] = "cancelado"


def apply_event(state, event):
    """Idempotencia por ID + contenido. Error => estado original intacto."""
    required(event, "id", "type", "at")
    at = timestamp(event["at"])
    digest = sha256(json.dumps(event, sort_keys=True, ensure_ascii=False).encode()).hexdigest()
    if event["id"] in state["events"]:
        if state["events"][event["id"]] != digest:
            raise RuleError("ID de evento reutilizado con otro contenido")
        return deepcopy(state)
    nxt = deepcopy(state)
    kind = event["type"]
    data = event.get("data", {})
    oid = event.get("opportunity_id")
    opp = nxt["opportunities"].get(oid)
    if not opp:
        raise RuleError("Oportunidad inexistente")
    expected = event.get("expected_version")
    if expected is not None and expected != opp["version"]:
        raise RuleError("Versión obsoleta: volver a leer antes de aplicar")
    opp["version"] += 1

    if kind == "evidence_reviewed":
        required(data, "reviewer", "reference", "evidence_hash")
        if not opp['evidence'] or evidence_digest(opp['evidence']) != data['evidence_hash']:
            raise RuleError('Los hallazgos han cambiado o faltan; releer antes de revisar')
        if opp['closed'] or opp['paid'] or opp['first_delivery_at'] or opp.get('dispatch'):
            raise RuleError('La revisión de hallazgos requiere una oportunidad sin envío iniciado')
        if any(timestamp(x['observed_at']) > at for x in opp['evidence']):
            raise RuleError('No se puede verificar una observación futura')
        for item in opp['evidence']:
            item['verified'] = True
        opp['evidence_review'] = {'reviewer': data['reviewer'], 'reference': data['reference'],
                                  'reviewed_at': iso(at), 'source_hash': data['evidence_hash']}
        opp['approved'] = False
        opp.pop('approved_content_hash', None)

    elif kind == "proposal_approved":
        required(data, "reviewer", "offer_ref")
        if not opp["evidence"] or not all(x.get("verified") is True for x in opp["evidence"]):
            raise RuleError("No hay evidencia verificada suficiente")
        if any(timestamp(x["observed_at"]) > at for x in opp["evidence"]):
            raise RuleError("No se puede aprobar evidencia futura")
        opp["approved"] = True
        opp["approved_at"] = iso(at)
        opp["offer_ref"] = data["offer_ref"]
        opp["reviewer"] = data["reviewer"]
        if data.get("content_hash"):
            if not re.fullmatch(r"[0-9a-f]{64}", data["content_hash"]):
                raise RuleError("Huella del mensaje inválida")
            opp["approved_content_hash"] = data["content_hash"]

    elif kind == "dispatch_reserved":
        required(data, "dispatch_id", "content_hash", "campaign_approval_ref")
        _contact_checks(nxt, opp, at)
        if opp["closed"] or opp["paid"] or opp["first_delivery_at"]:
            raise RuleError("Captación ya cerrada, contratada o entregada")
        if data["content_hash"] != opp.get("approved_content_hash"):
            raise RuleError("El mensaje no coincide con el contenido revisado")
        if opp["route"] == "ESCAPARATES" and (not opp["demo"] or timestamp(opp["demo"]["ready_at"]) > at):
            raise RuleError("Demo no preparada antes de reservar el envío")
        previous = opp.get("dispatch")
        if previous and previous["status"] not in ("failed", "cancelled"):
            raise RuleError("Ya existe un envío reservado o de resultado pendiente")
        if previous and previous["id"] == data["dispatch_id"]:
            raise RuleError("No reutilizar la identidad de un envío terminado")
        opp["dispatch"] = {"id": data["dispatch_id"], "status": "reserved", "reserved_at": iso(at),
                           "content_hash": data["content_hash"], "campaign_approval_ref": data["campaign_approval_ref"],
                           "contact_key": opp["contact_key"], "cancel_requested": False}

    elif kind == "dispatch_started":
        required(data, "dispatch_id", "provider_request_ref", "content_hash")
        pending = opp.get("dispatch")
        if not pending or pending["id"] != data["dispatch_id"] or pending["status"] != "reserved":
            raise RuleError("No existe reserva disponible; no reintentar un envío incierto")
        _contact_checks(nxt, opp, at)
        if (at < timestamp(pending["reserved_at"]) or data["content_hash"] != pending["content_hash"]
                or data["content_hash"] != opp.get("approved_content_hash")):
            raise RuleError("Fecha o contenido no coinciden con la reserva")
        if opp["closed"] or opp["paid"]:
            raise RuleError("Oportunidad cerrada o protegida por compra")
        pending.update(status="sending", started_at=iso(at), provider_request_ref=data["provider_request_ref"])

    elif kind in ("dispatch_uncertain", "dispatch_failed", "dispatch_cancelled"):
        required(data, "dispatch_id", "reference", "reason")
        pending = opp.get("dispatch")
        if not pending or pending["id"] != data["dispatch_id"]:
            raise RuleError("Referencia de envío desconocida")
        expected_statuses = ("reserved",) if kind == "dispatch_cancelled" else ("sending", "uncertain")
        if pending["status"] not in expected_statuses:
            raise RuleError("Transición de envío inválida")
        if at < timestamp(pending.get("started_at", pending["reserved_at"])):
            raise RuleError("Resultado anterior al intento de envío")
        if kind == "dispatch_failed" and data.get("definitive") is not True:
            raise RuleError("Un resultado incierto no autoriza otro envío")
        pending.update(status={"dispatch_uncertain":"uncertain", "dispatch_failed":"failed", "dispatch_cancelled":"cancelled"}[kind],
                       result_ref=data["reference"], reason=data["reason"], result_at=iso(at))

    elif kind == "channel_authorized":
        required(data, "reference", "authorized_by", "valid_until")
        if not opp["contact"] or timestamp(data["valid_until"]) <= at or blocked(nxt, opp):
            raise RuleError("Canal sin contacto, excluido o autorización caducada")
        # Registrar evidencia no equivale a obtener permiso ni a enviar mensajes.
        opp["channel_authorization"] = {**deepcopy(data), "authorized_at": iso(at)}

    elif kind == "demo_ready":
        if opp["route"] != "ESCAPARATES" or opp["first_delivery_at"]:
            raise RuleError("Demo fuera de ruta o ya entregada")
        required(data, "demo_id", "url", "generator_version", "plan_ref", "free_plan_ref", "rights_ref", "qa_ref")
        https_url(data["url"])
        if not all(data.get(x) is True for x in ("noindex", "marked_as_demo", "consumer_capture_disabled")):
            raise RuleError("Faltan controles de demo comprobados")
        opp["demo"] = {**deepcopy(data), "state": "preparada", "ready_at": iso(at)}

    elif kind == "delivery_failed":
        required(data, "provider_ref", "reason")
        opp["last_delivery_error"] = deepcopy(data)
        # Nunca arranca ni reinicia el plazo de prueba.

    elif kind == "delivery_confirmed":
        required(data, "provider_ref")
        if opp["first_delivery_at"]:
            if opp["delivery_id"] != data["provider_ref"]:
                raise RuleError("Primera entrega ya registrada; no reiniciar plazo")
        else:
            pending = opp.get("dispatch")
            in_flight = pending and pending["status"] in ("sending", "uncertain")
            if in_flight:
                # Un recibo real tardío se conserva aunque se retire el permiso después del envío.
                if data.get("dispatch_id") != pending["id"] or at < timestamp(pending["started_at"]):
                    raise RuleError("Recibo no corresponde al intento o precede al envío")
                pending.update(status="delivered", delivered_at=iso(at), delivery_ref=data["provider_ref"])
            else:
                if pending:
                    raise RuleError("No existe un intento susceptible de entrega")
                # Compatibilidad de ensayos anteriores; un conector real exige reserva previa.
                _contact_checks(nxt, opp, at)
                if opp["closed"] or opp["paid"]:
                    raise RuleError("Oportunidad cerrada o contratada")
            if opp["route"] == "ESCAPARATES" and not opp["demo"]:
                raise RuleError("No existe demo verificada")
            if opp["demo"] and timestamp(opp["demo"]["ready_at"]) > at:
                raise RuleError("La entrega precede a la verificación de la demo")
            opp["first_delivery_at"] = iso(at)
            opp["delivery_id"] = data["provider_ref"]
            if not blocked(nxt, opp) and not opp["paid"]:
                opp["status"] = "propuesta_entregada"
            if opp["route"] == "ESCAPARATES" and not opp["paid"]:
                opp["expires_at"] = iso(at + timedelta(hours=48))
                opp["demo"]["state"] = "prueba_activa"

    elif kind == "paid_confirmed":
        required(data, "payment_ref", "plan_ref", "verification_ref")
        if opp["paid"] and (opp["payment_ref"] != data["payment_ref"] or opp["paid_plan_ref"] != data["plan_ref"]):
            raise RuleError("Compra ya registrada; un cambio de plan requiere su propio proceso")
        opp["paid"] = True
        opp["payment_ref"] = data["payment_ref"]
        opp.setdefault("payment_verified_at", iso(at))
        opp.setdefault("payment_verification_ref", data["verification_ref"])
        opp["paid_plan_ref"] = data["plan_ref"]
        opp["status"] = "pago_verificado"
        opp["closed"] = True
        pending = opp.get("dispatch")
        if pending:
            if pending["status"] == "reserved":
                pending["status"] = "cancelled"
            elif pending["status"] in ("sending", "uncertain"):
                pending["cancel_requested"] = True
        if opp["demo"]:
            # El adaptador de compra publica el plan; este motor no lo afirma aplicado.
            opp["demo"]["state"] = "protegida_por_compra"
        for effect in nxt["effects"].values():
            if effect["opportunity_id"] == oid:
                effect["status"] = "cancelado_por_compra"

    elif kind == "opt_out":
        required(data, "reference")
        nxt["businesses"][opp["business_id"]]["blocked"] = True
        nxt["businesses"][opp["business_id"]]["opt_out_ref"] = data["reference"]
        if opp["contact_key"] and opp["contact_key"] not in nxt["suppressed"]:
            nxt["suppressed"].append(opp["contact_key"])
        for other in nxt["opportunities"].values():
            if blocked(nxt, other):
                if other["id"] != oid:
                    other["version"] += 1
                other["channel_authorization"] = None
                other["status"] = "no_contactar"
                other["opt_out_ref"] = data["reference"]
                pending = other.get("dispatch")
                if pending:
                    if pending["status"] == "reserved":
                        pending["status"] = "cancelled"
                    elif pending["status"] in ("sending", "uncertain"):
                        pending["cancel_requested"] = True
        _cancel_messages(nxt, lambda x: blocked(nxt, x))

    elif kind == "close_opportunity":
        required(data, "reason")
        opp["closed"] = True
        opp["close_reason"] = data["reason"]

    elif kind == "trial_expiry_due":
        if opp["route"] != "ESCAPARATES" or not opp["expires_at"]:
            raise RuleError("No existe prueba con vencimiento")
        if at < timestamp(opp["expires_at"]):
            raise RuleError("Todavía no han transcurrido 48 horas")
        if not opp["paid"] and opp["demo"]["state"] == "prueba_activa":
            opp["demo"]["state"] = "caducidad_pendiente"
            _effect(nxt, opp, "demo_a_free", {
                "demo_id": opp["demo"]["demo_id"], "target_plan_ref": opp["demo"]["free_plan_ref"],
                "preserve_content": True, "recheck_paid_before_apply": True,
            })

    elif kind == "expiry_applied":
        required(data, "provider_ref", "backup_ref")
        effect = nxt["effects"].get(oid + ":demo_a_free")
        if opp["paid"] or not effect or effect["status"] == "cancelado_por_compra":
            raise RuleError("Compra protegida o caducidad no solicitada")
        if at < timestamp(opp["expires_at"]):
            raise RuleError("La confirmación de caducidad precede al vencimiento")
        if opp["demo"]["state"] == "free_confirmado":
            if opp["expiry_provider_ref"] != data["provider_ref"]:
                raise RuleError("Caducidad ya confirmada con otra referencia")
        else:
            opp["demo"]["state"] = "free_confirmado"
            opp["expiry_provider_ref"] = data["provider_ref"]
            opp["expiry_backup_ref"] = data["backup_ref"]
            opp["expiry_applied_at"] = iso(at)
            effect["status"] = "confirmado_en_ensayo"
            # Sigue sin afirmar una ejecución real: todos los eventos de este módulo son de ensayo.
            if not blocked(nxt, opp):
                _effect(nxt, opp, "aviso_free", {"demo_id": opp["demo"]["demo_id"], "requires_channel_recheck": True})

    else:
        raise RuleError("Tipo de evento no reconocido")
    nxt["events"][event["id"]] = digest
    nxt["revision"] += 1
    nxt["history"].append({"event_id": event["id"], "type": kind, "at": iso(at), "opportunity_id": oid, "data": deepcopy(data)})
    return nxt


def draft(state, oid):
    """Borrador para revisión; nunca autorizaciones inferidas ni precios inventados."""
    op = state["opportunities"][oid]
    if blocked(state, op) or op["first_delivery_at"] or op["closed"] or op["paid"]:
        return ""
    findings = [x["finding"] for x in op["evidence"] if x.get("verified") is True]
    if not findings:
        return ""
    business = state["businesses"][op["business_id"]]["name"]
    intro = f"Hola, equipo de {business}. Soy Javier, de INNOVA AND DESIGN. "
    findings_text = "En la revisión de vuestra información pública observamos: " + "; ".join(findings) + ". "
    if op["route"] == "ESCAPARATES":
        if not op["demo"]:
            return ""
        body = (f"Hemos preparado esta demo de propuesta: {op['demo']['url']}. "
                "El acceso de prueba dura 48 horas desde la entrega de esta invitación; "
                "después queda la versión gratuita descrita en la propuesta. "
                "No implica una contratación ni un cargo automático. ¿Queréis revisarla?")
    elif op["route"] == "GOOGLE":
        body = "Podemos preparar una propuesta de gestión de vuestra ficha de Google con esas mejoras. ¿Queréis revisarla?"
    else:
        body = "Podemos proponeros una solución concreta del catálogo de INNOVA para esa necesidad. ¿Queréis que la revisemos juntos?"
    return intro + findings_text + body + " Si preferís que no volvamos a contactar, indicádnoslo."
