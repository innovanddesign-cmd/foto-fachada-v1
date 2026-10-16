"""Une guiones revisables con reserva interna. Sin transporte ni permisos nuevos."""
from copy import deepcopy
from hashlib import sha256
import json
from motor import RuleError, iso
from plantillas import render


def fingerprint(value):
    return sha256(json.dumps(value, sort_keys=True, ensure_ascii=False,
                             separators=(',', ':'), allow_nan=False).encode()).hexdigest()


def prepare_proposal(state, opportunity_id, template_id, values, offer_ref):
    if not isinstance(offer_ref, str) or not offer_ref.strip():
        raise RuleError('Falta la oferta concreta')
    op = state['opportunities'][opportunity_id]
    draft = render(state, opportunity_id, template_id, values)
    contact = op.get('contact')
    if not contact or contact['channel'] != draft['channel']:
        raise RuleError('El guion no corresponde al canal del destinatario')
    envelope = {'opportunity_id': opportunity_id, 'route': op['route'],
                'template_id': template_id, 'offer_ref': offer_ref,
                'contact': deepcopy(contact), 'subject': draft['subject'], 'text': draft['text']}
    return {**draft, 'offer_ref': offer_ref, 'content_hash': fingerprint(envelope)}


def reserve_proposal(repository, organization_id, opportunity_id, template_id, values,
                     offer_ref, *, dispatch_id, campaign_approval_ref, reviewer,
                     expected_revision, now):
    """Solo servidor: reserva de ENSAYO; referencias deben venir de revisión real.

    No exponer directamente en HTTP ni aceptar actor/campaña del navegador.
    El hash aprobado debe ser el producido por prepare_proposal.
    """
    for value in (dispatch_id, campaign_approval_ref, reviewer):
        if not isinstance(value, str) or not value.strip():
            raise RuleError('Falta identidad o referencia de revisión')
    request = dict(opportunity_id=opportunity_id, template_id=template_id,
                   values=deepcopy(values), offer_ref=offer_ref, dispatch_id=dispatch_id,
                   campaign_approval_ref=campaign_approval_ref, reviewer=reviewer)
    request_hash = fingerprint(request)
    eid = 'proposal-reservation:' + dispatch_id

    def build(state):
        if eid in state['events']:
            previous = next(h for h in state['history'] if h['event_id'] == eid)
            if previous['data'].get('_proposal_request_hash') != request_hash:
                raise RuleError('Identificador de reserva reutilizado con otros datos')
            return dict(id=eid, type=previous['type'], at=previous['at'],
                        opportunity_id=previous['opportunity_id'], data=deepcopy(previous['data']))
        proposal = prepare_proposal(state, opportunity_id, template_id, values, offer_ref)
        return dict(id=eid, type='dispatch_reserved', at=iso(now), opportunity_id=opportunity_id,
                    data=dict(dispatch_id=dispatch_id, content_hash=proposal['content_hash'],
                              campaign_approval_ref=campaign_approval_ref,
                              _proposal_request_hash=request_hash))
    return repository.apply_derived(organization_id, build, expected_revision=expected_revision)
