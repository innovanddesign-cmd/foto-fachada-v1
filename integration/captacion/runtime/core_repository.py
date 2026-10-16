"""Persistencia DB-API propuesta para Core; no abre conexiones ni concede permisos.

El único dialécto de servicio es PostgreSQL. ``sqlite_test`` existe exclusivamente
para pruebas temporales. La conexión debe ser exclusiva, estar fuera de una
transacción y pertenecer a un servidor autenticado con organización ya resuelta.
"""
from contextlib import contextmanager
from copy import deepcopy
from hashlib import sha256
import json
import sqlite3
from uuid import UUID, uuid4

from motor import new_state, apply_event


CONTRACT = "innova.captacion.repository.v1"
PREFIX = "captacion:v1:"
RUNTIME = "commercial_runtime"
KINDS = {
    "businesses": "commercial_prospect",
    "opportunities": "commercial_opportunity",
    "suppressed": "commercial_contact_policy",
    "events": "commercial_event",
    "effects": "commercial_action",
}
TYPES = tuple(KINDS.values()) + (RUNTIME,)
MAX_ENTITIES = 10_000
MAX_STATE_BYTES = 8 * 1024 * 1024
MAX_ENTITY_BYTES = 2 * 1024 * 1024
MAX_STORAGE_BYTES = 16 * 1024 * 1024


class RepositoryError(ValueError):
    pass


class RevisionConflict(RepositoryError):
    pass


def _json(value):
    try:
        return json.dumps(value, sort_keys=True, ensure_ascii=False,
                          separators=(",", ":"), allow_nan=False)
    except (ValueError, TypeError) as exc:
        raise RepositoryError("El estado debe contener solo datos JSON finitos") from exc


def _digest(value):
    return sha256(_json(value).encode("utf-8")).hexdigest()


def _external(slot, key):
    return PREFIX + slot + ":" + sha256(key.encode("utf-8")).hexdigest()


def _validate(state):
    if not isinstance(state, dict) or type(state.get("revision")) is not int or state["revision"] < 0:
        raise RepositoryError("Revisión de estado inválida")
    if state.get("schema_version") != 1 or state.get("mode") != "ensayo_sin_conectores":
        raise RepositoryError("Solo se admite el contrato de ensayo versión 1")
    for slot in ("businesses", "opportunities", "events", "effects"):
        if not isinstance(state.get(slot), dict) or any(not isinstance(k, str) for k in state[slot]):
            raise RepositoryError("Colección inválida: " + slot)
    if not isinstance(state.get("suppressed"), list) or any(not isinstance(k, str) for k in state["suppressed"]):
        raise RepositoryError("Exclusiones inválidas")
    if len(state["suppressed"]) != len(set(state["suppressed"])):
        raise RepositoryError("Exclusiones duplicadas")
    if not isinstance(state.get("history"), list):
        raise RepositoryError("Historial inválido")
    for entry in state["history"]:
        if not isinstance(entry, dict) or entry.get("event_id") not in state["events"]:
            raise RepositoryError("Historial sin evento correspondiente")
    encoded = _json(state)
    if len(encoded.encode("utf-8")) > MAX_STATE_BYTES:
        raise RepositoryError("Estado supera el límite de 8 MiB; requiere particionado revisado")
    if json.loads(encoded) != state:
        raise RepositoryError("El estado no admite reconstrucción JSON sin pérdida")


def _records(state):
    """Descomposición reversible. No reutiliza/importa el manifiesto informativo."""
    _validate(state)
    records = {}
    histories = {}
    for position, item in enumerate(state["history"]):
        histories.setdefault(item["event_id"], []).append({"position": position, "value": item})
    for slot, kind in KINDS.items():
        items = enumerate(state[slot]) if slot == "suppressed" else state[slot].items()
        for key, value in items:
            if slot == "suppressed":
                body = {"slot": slot, "key": value, "value": value, "position": key}
                key = value
            else:
                body = {"slot": slot, "key": key, "value": value}
            if slot == "events":
                body["history"] = histories.get(key, [])
            records[(kind, _external(slot, key))] = {"repository_contract": CONTRACT, **body}
    metadata = {k: v for k, v in state.items() if k not in KINDS and k != "history"}
    records[(RUNTIME, PREFIX + "runtime")] = {
        "repository_contract": CONTRACT, "slot": "runtime", "metadata": metadata,
        "state_sha256": _digest(state), "entity_count": len(records) + 1,
        "history_count": len(state["history"]), "suppressed_count": len(state["suppressed"]),
    }
    if len(records) > MAX_ENTITIES:
        raise RepositoryError("Más de 10000 entidades comerciales; requiere particionado revisado")
    storage_size = 0
    for body in records.values():
        size = len(_json(body).encode("utf-8"))
        storage_size += size
        if size > MAX_ENTITY_BYTES:
            raise RepositoryError("Una entidad supera el límite de 2 MiB")
    if storage_size > MAX_STORAGE_BYTES:
        raise RepositoryError("Las entidades superan el límite agregado de 16 MiB")
    return records


def _reconstruct(records):
    if not records:
        return new_state()
    runtime = records.get((RUNTIME, PREFIX + "runtime"))
    if not runtime or runtime.get("entity_count") != len(records):
        raise RepositoryError("Estado incompleto: metadatos o entidades faltantes")
    state = deepcopy(runtime["metadata"])
    state.update({k: [] if k == "suppressed" else {} for k in KINDS})
    state["history"] = []
    history, suppressed = {}, {}
    for (kind, external_id), body in records.items():
        if body.get("repository_contract") != CONTRACT:
            raise RepositoryError("Colisión con una entidad ajena al contrato; no se modifica")
        slot = body.get("slot")
        if kind == RUNTIME:
            if external_id != PREFIX + "runtime" or slot != "runtime":
                raise RepositoryError("Metadatos inesperados")
            continue
        key = body.get("key")
        if slot not in KINDS or KINDS[slot] != kind or not isinstance(key, str) or external_id != _external(slot, key):
            raise RepositoryError("Identidad contractual incoherente")
        if slot == "suppressed":
            pos = body.get("position")
            if type(pos) is not int or pos in suppressed or body["value"] != key:
                raise RepositoryError("Orden de exclusiones inválido")
            suppressed[pos] = key
        else:
            state[slot][key] = deepcopy(body["value"])
        if slot == "events":
            for item in body.get("history", []):
                pos = item["position"]
                if type(pos) is not int or pos in history or item["value"].get("event_id") != key:
                    raise RepositoryError("Orden de historial inválido")
                history[pos] = deepcopy(item["value"])
    if set(history) != set(range(runtime["history_count"])) or set(suppressed) != set(range(runtime["suppressed_count"])):
        raise RepositoryError("Secuencia incompleta")
    state["history"] = [history[i] for i in range(len(history))]
    state["suppressed"] = [suppressed[i] for i in range(len(suppressed))]
    _validate(state)
    if _digest(state) != runtime["state_sha256"]:
        raise RepositoryError("Hash de estado incoherente; no sobrescribir")
    return state


class CoreRepository:
    """No es API pública: organización y permiso deben validarse antes de invocarlo."""

    def __init__(self, connection, *, dialect="postgres"):
        if dialect not in ("postgres", "sqlite_test"):
            raise RepositoryError("Dialecto no permitido")
        if dialect == "sqlite_test" and not isinstance(connection, sqlite3.Connection):
            raise RepositoryError("El harness requiere una conexión SQLite de prueba")
        self.connection = connection
        self.dialect = dialect
        self.table = "innova.core_entities" if dialect == "postgres" else "core_entities"
        self.param = "%s" if dialect == "postgres" else "?"

    @contextmanager
    def _transaction(self, organization_id):
        organization_id = str(UUID(organization_id))
        if getattr(self.connection, "in_transaction", False):
            raise RepositoryError("Se necesita una conexión exclusiva sin transacción abierta")
        if hasattr(self.connection, "get_transaction_status") and self.connection.get_transaction_status() != 0:
            raise RepositoryError("Conexión PostgreSQL con transacción ya abierta")
        info = getattr(self.connection, "info", None)
        if info is not None and getattr(info, "transaction_status", 0) != 0:
            raise RepositoryError("Conexión PostgreSQL con transacción ya abierta")
        cur = self.connection.cursor()
        try:
            cur.execute("BEGIN IMMEDIATE" if self.dialect == "sqlite_test" else "BEGIN")
            if self.dialect == "postgres":
                lock = int.from_bytes(sha256((CONTRACT + organization_id).encode()).digest()[:8], "big", signed=True)
                cur.execute("SELECT pg_advisory_xact_lock(%s)", (lock,))
            yield cur, organization_id
            self.connection.commit()
        except BaseException:
            self.connection.rollback()
            raise
        finally:
            cur.close()

    def _read(self, cur, org):
        p = self.param
        clause = ", ".join([p] * len(TYPES))
        scope = (f"WHERE organization_id = {p} AND entity_type IN ({clause}) "
                 f"AND external_id LIKE {p}")
        args = (org, *TYPES, PREFIX + "%")
        size_expr = "octet_length(payload::text)" if self.dialect == "postgres" else "length(CAST(payload AS BLOB))"
        # Comprobar tamaños en servidor antes de que un driver pueda bufferizar
        # payloads completos. El lock por organización ya está adquirido.
        cur.execute(f"SELECT COUNT(*), COALESCE(SUM({size_expr}), 0), COALESCE(MAX({size_expr}), 0) "
                    f"FROM {self.table} {scope}", args)
        count, total_size, largest = cur.fetchone()
        if count > MAX_ENTITIES or total_size > MAX_STORAGE_BYTES or largest > MAX_ENTITY_BYTES:
            raise RepositoryError("Entidades persistidas fuera de los límites de tamaño o cantidad")
        sql = (f"SELECT entity_type, external_id, payload FROM {self.table} "
               f"{scope} LIMIT {MAX_ENTITIES + 1}")
        if self.dialect == "postgres":
            sql += " FOR UPDATE"
        cur.execute(sql, args)
        records = {}
        storage_size = 0
        # Lectura incremental: nunca acumular 10000 cargas de hasta 2 MiB.
        while True:
            row = cur.fetchone()
            if row is None:
                break
            kind, external_id, payload = row
            if len(records) >= MAX_ENTITIES:
                raise RepositoryError("Número de entidades fuera del límite")
            if isinstance(payload, str):
                if len(payload.encode("utf-8")) > MAX_ENTITY_BYTES:
                    raise RepositoryError("Entidad persistida fuera del límite")
                payload = json.loads(payload)
            if not isinstance(payload, dict) or payload.get("repository_contract") != CONTRACT:
                raise RepositoryError("Colisión con entidad ajena al contrato; lectura bloqueada")
            size = len(_json(payload).encode("utf-8"))
            storage_size += size
            if size > MAX_ENTITY_BYTES:
                raise RepositoryError("Entidad persistida fuera del límite")
            if storage_size > MAX_STORAGE_BYTES:
                raise RepositoryError("Estado persistido fuera del límite agregado de 16 MiB")
            records[(kind, external_id)] = payload
        return _reconstruct(records), records

    @staticmethod
    def _expected(expected_revision, current):
        if type(expected_revision) is not int or expected_revision != current["revision"]:
            raise RevisionConflict("Revisión obsoleta; releer antes de aplicar")

    def _write(self, cur, org, state, previous, old_records):
        records = _records(state)
        if state == previous:
            return
        if state["revision"] <= previous["revision"]:
            raise RevisionConflict("Un cambio necesita una revisión mayor")
        if not set(old_records).issubset(records):
            raise RepositoryError("El contrato no permite eliminar entidades ni historial")
        if any(state["events"].get(k) != v for k, v in previous["events"].items()):
            raise RepositoryError("Los identificadores y resúmenes de eventos son inmutables")
        if state["history"][:len(previous["history"])] != previous["history"]:
            raise RepositoryError("El historial solo admite anexos")
        if not set(previous["suppressed"]).issubset(state["suppressed"]):
            raise RepositoryError("Eliminar exclusiones requiere un proceso independiente")
        p = self.param
        for (kind, external_id), payload in records.items():
            if old_records.get((kind, external_id)) == payload:
                continue
            serialized = _json(payload)
            cast = p + "::jsonb" if self.dialect == "postgres" else p
            if (kind, external_id) in old_records:
                cur.execute(f"UPDATE {self.table} SET payload = {cast}, updated_at = CURRENT_TIMESTAMP "
                            f"WHERE organization_id = {p} AND entity_type = {p} AND external_id = {p}",
                            (serialized, org, kind, external_id))
                if cur.rowcount != 1:
                    raise RepositoryError("La entidad cambió durante la transacción")
            else:
                cur.execute(f"INSERT INTO {self.table} "
                            "(id, organization_id, entity_type, external_id, title, status, payload) "
                            f"VALUES ({p}, {p}, {p}, {p}, {p}, {p}, {cast})",
                            (str(uuid4()), org, kind, external_id, "Captación · " + kind,
                             "repository_simulation", serialized))

    def load(self, organization_id):
        with self._transaction(organization_id) as (cur, org):
            state, _ = self._read(cur, org)
            return state

    def save(self, organization_id, state, *, expected_revision):
        """Importación interna de snapshot revisado; no es un endpoint de cliente."""
        _validate(state)
        with self._transaction(organization_id) as (cur, org):
            previous, records = self._read(cur, org)
            self._expected(expected_revision, previous)
            self._write(cur, org, state, previous, records)
            return deepcopy(state)

    def apply(self, organization_id, event, *, expected_revision):
        """Evento y estado/efectos juntos; replay exacto acepta la revisión antigua."""
        return self.apply_derived(organization_id, lambda state: deepcopy(event),
                                  expected_revision=expected_revision)

    def import_reviewed(self, organization_id, batch, decisions, *, catalog_reader,
                        reviewer, review_reference, now, expected_revision):
        """Importación interna bajo transacción; sin endpoint ni conectores.

        catalog_reader es código de servidor, recibe el mismo cursor y organización.
        Debe leer y bloquear el catálogo canónico con ese cursor y coordinación de
        sus escritores. No aceptar proyecciones/funciones del navegador. La adaptación
        del catálogo de Core y su concurrencia PostgreSQL requieren verificación.
        """
        from identity import stage_import
        with self._transaction(organization_id) as (cur, org):
            previous, records = self._read(cur, org)
            self._expected(expected_revision, previous)
            catalog = catalog_reader(cur, org)
            result = stage_import(previous, batch, catalog, decisions,
                organization_id=org, reviewer=reviewer,
                review_reference=review_reference, now=now)
            state = result['simulation']
            self._write(cur, org, state, previous, records)
            return deepcopy(state)

    def apply_derived(self, organization_id, event_builder, *, expected_revision):
        """Constructor INTERNO bajo bloqueo; nunca aceptar funciones del cliente.

        Permite fijar hora/identidad una vez y recuperar el evento original en un
        reintento concurrente. El constructor recibe una copia y no puede guardar
        un snapshot arbitrario. Autenticación y autorización siguen en el servidor.
        """
        with self._transaction(organization_id) as (cur, org):
            previous, records = self._read(cur, org)
            event = event_builder(deepcopy(previous))
            # El motor comprueba contenido del ID antes de versión de oportunidad.
            state = apply_event(previous, event)
            if state == previous:
                return state
            self._expected(expected_revision, previous)
            self._write(cur, org, state, previous, records)
            return state
