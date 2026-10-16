"""Render de guiones revisables, con condiciones por estado. No tiene transporte."""
import json
from pathlib import Path
from string import Formatter
from motor import RuleError, blocked

DEFAULT_CATALOG = Path(__file__).resolve().parents[1] / "outputs" / "captacion-comercial" / "mensajes.json"
if (Path(__file__).resolve().parent / 'mensajes.json').is_file():
    DEFAULT_CATALOG = Path(__file__).resolve().parent / 'mensajes.json'
FLOW_MAP = {"INNOVA": "CAP-INNOVA", "GOOGLE": "CAP-GOOGLE", "ESCAPARATES": "CAP-ESC"}


def render(state, opportunity_id, template_id, values, catalog_path=DEFAULT_CATALOG):
    catalog = json.loads(Path(catalog_path).read_text(encoding="utf-8"))
    matches = [x for x in catalog["plantillas"] if x["id"] == template_id]
    if len(matches) != 1:
        raise RuleError("Plantilla inexistente o duplicada")
    template = matches[0]
    op = state["opportunities"][opportunity_id]
    if template["flujo"] != FLOW_MAP[op["route"]] or blocked(state, op):
        raise RuleError("Flujo incompatible o contacto excluido")
    if op["paid"]:
        raise RuleError("No enviar captación o vencimiento a una compra protegida")
    if template["evento"] == "demo_free_verificada":
        if not op["demo"] or op["demo"]["state"] != "free_confirmado":
            raise RuleError("La versión Free no está confirmada")
    elif op["closed"] or op["first_delivery_at"]:
        raise RuleError("Invitación inicial ya entregada o conversación cerrada")
    if op["route"] == "ESCAPARATES" and not op["demo"]:
        raise RuleError("No se puede afirmar una demo inexistente")
    fields = {field for content in (template["texto"], template.get("asunto") or "")
              for _, field, _, _ in Formatter().parse(content) if field is not None}
    if fields != set(template["variables_obligatorias"]):
        raise RuleError("Catálogo de variables inconsistente")
    for name in fields:
        if not isinstance(values.get(name), str) or not values[name].strip() or any(x in values[name] for x in ("{", "}")):
            raise RuleError("Variable sin resolver: " + name)
    if "hallazgo_verificado" in fields:
        findings = {x["finding"] for x in op["evidence"] if x.get("verified") is True}
        if values["hallazgo_verificado"] not in findings:
            raise RuleError("El hallazgo del mensaje no coincide con evidencia revisada")
    if "url_demo" in fields and values["url_demo"] != op["demo"]["url"]:
        raise RuleError("El enlace no corresponde a la demo revisada")
    return {"template_id": template_id, "opportunity_id": opportunity_id,
            "subject": template["asunto"].format_map(values) if template.get("asunto") else None,
            "text": template["texto"].format_map(values), "channel": template["canal"],
            "operator_notes": template.get("notas_operador", ""), "send_authorized": False,
            "status": "borrador_para_revision", "requires_channel_and_canonical_recheck": True}
