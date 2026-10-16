"""Server-only demo bridge. Batch configuration is private; no sending or billing."""
import json
from hashlib import sha256
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from uuid import UUID
from datetime import datetime
from core_service import ApiError, Response, CaptacionService, WRITE_ROLES, ALLOWED_ORIGINS, _object
from core_repository import RevisionConflict, RepositoryError
from motor import blocked, iso


def demo_client(secret):
    def call(action, body):
        headers = {'apikey': secret, 'Content-Type': 'application/json'}
        if secret.startswith('eyJ'): headers['Authorization'] = 'Bearer ' + secret
        req = Request('https://skgpjovfkcpyenipjlxh.supabase.co/rest/v1/rpc/innova_commercial_demo_v1',
                      data=json.dumps({'p_action': action, 'p_body': body}).encode(), headers=headers)
        try:
            with urlopen(req, timeout=8) as response: raw = response.read(2097153)
        except HTTPError as exc:
            status = exc.code
            exc.close()
            raise ApiError(409 if status in (400, 403, 409) else 503,
                           'Demo no confirmada; comprueba la autorización del lote') from None
        if len(raw) > 2097152: raise ApiError(503, 'Respuesta demasiado grande')
        value = json.loads(raw)
        if not isinstance(value, dict): raise ApiError(404, 'Demo no disponible')
        return value
    return call


class DemoService:
    def __init__(self, repository, authenticate, rpc, batch, clock=None):
        self.base = CaptacionService(repository, authenticate, clock=clock)
        self.repo, self.rpc, self.batch = repository, rpc, batch

    def handle(self, method, headers, body):
        try:
            now = self.base.clock()
            session = self.base._session(headers, now)
            if method != 'POST': raise ApiError(405, 'Método no permitido')
            if headers.get('Origin') not in ALLOWED_ORIGINS or session.role not in WRITE_ROLES:
                raise ApiError(403, 'Se requiere un responsable con sesión del ERP')
            if headers.get('Content-Type') != 'application/json': raise ApiError(415, 'Se requiere JSON')
            if len(body) > 4096: raise ApiError(413, 'Solicitud demasiado grande')
            try: data = json.loads(body, object_pairs_hook=_object)
            except (ValueError, UnicodeError): raise ApiError(400, 'JSON no válido')
            if not isinstance(data, dict): raise ApiError(400, 'Objeto requerido')
            if data == {'action': 'list'}:
                state = self.repo.load(session.organization_id)
                return Response(200, {'enabled': self.batch.get('enabled') is True,
                    'public_ready': self.batch.get('public_ready') is True,
                    'revision': state['revision'], 'sending_enabled': False,
                    'items': [{'opportunity_id': x['opportunity_id'], 'name': x['name'], 'plan': x['plan'],
                               'version': state['opportunities'].get(x['opportunity_id'], {}).get('version'),
                               'demo': state['opportunities'].get(x['opportunity_id'], {}).get('demo')}
                              for x in self.batch.get('items', []) if x['organization_id'] == session.organization_id]})
            if set(data) != {'action','opportunity_id','expected_revision','expected_version'}:
                raise ApiError(400, 'Campos no válidos; la campaña y la cuenta se resuelven en servidor')
            if data['action'] not in ('prepare', 'sync'): raise ApiError(403, 'Acción no disponible')
            if self.batch.get('enabled') is not True: raise ApiError(503, 'Lote no habilitado')
            entry = next((x for x in self.batch.get('items', []) if
                x['organization_id'] == session.organization_id and x['opportunity_id'] == data['opportunity_id']), None)
            if not entry: raise ApiError(403, 'Oportunidad fuera del lote autorizado')
            state = self.repo.load(session.organization_id)
            op = state['opportunities'].get(entry['opportunity_id'])
            if not op or op['route'] != 'ESCAPARATES': raise ApiError(404, 'Oportunidad no disponible')
            if any(type(data[k]) is not int for k in ('expected_revision','expected_version')) or (
                data['expected_revision'] != state['revision'] or data['expected_version'] != op['version']):
                raise ApiError(409, 'Hay cambios; recarga el lote')
            if op['closed'] or blocked(state, op): raise ApiError(409, 'Oportunidad cerrada o excluida')
            if data['action'] == 'prepare':
                if self.batch.get('public_ready') is not True: raise ApiError(503, 'Alojamiento público pendiente de verificar')
                if op['first_delivery_at'] or op['paid']: raise ApiError(409, 'Demo entregada o contratada')
                created = self.rpc('create', {'reference': entry['reference'], 'campaignId': entry['campaign_id'], 'plan': entry['plan']})
                demo = self.rpc('publish', {'id': created['id']})
                if demo.get('reference') != entry['reference'] or demo.get('effectiveState') != 'published':
                    raise ApiError(503, 'Publicación no confirmada')
                if (op.get('demo') or {}).get('demo_id') == demo['id']:
                    return Response(200, {'revision': state['revision'], 'demo': op['demo'], 'sending_enabled': False})
                event_id = 'demo-ready:' + sha256(entry['reference'].encode()).hexdigest()
                def event(current):
                    latest = current['opportunities'][entry['opportunity_id']]
                    if latest['closed'] or blocked(current, latest) or latest['paid'] or latest['first_delivery_at']:
                        raise ApiError(409, 'La oportunidad ha cambiado')
                    previous = next((h for h in current['history'] if h['event_id'] == event_id), None)
                    if previous:
                        raise ApiError(409, 'Demo ya preparada; recarga el lote')
                    return {'id': event_id, 'type': 'demo_ready', 'at': iso(now),
                        'opportunity_id': entry['opportunity_id'], 'expected_version': op['version'], 'data': {
                            'demo_id': demo['id'], 'url': self.batch['public_base'] + '/demos/' + str(UUID(demo['id'])),
                            'generator_version': 'commercial-demo-v1', 'plan_ref': entry['plan'],
                            'free_plan_ref': 'demo_expired_content_retained', 'rights_ref': entry['rights_ref'],
                            'qa_ref': entry['qa_ref'], 'noindex': True, 'marked_as_demo': True,
                            'consumer_capture_disabled': True, 'review_actor': session.actor_id}}
                saved = self.repo.apply_derived(session.organization_id,event,expected_revision=state['revision'])
                return Response(200, {'revision': saved['revision'], 'demo': saved['opportunities'][op['id']]['demo'], 'sending_enabled': False})
            if not op.get('demo'): raise ApiError(409, 'Prepara primero la demo')
            demo_id = op['demo']['demo_id']
            remote = self.rpc('read', {'id': demo_id})
            if remote.get('reference') != entry['reference']: raise ApiError(409, 'Demo no corresponde al lote')
            # Delivery comes exclusively from the existing server-side, reserved dispatch receipt.
            if op.get('first_delivery_at'):
                dispatch = op.get('dispatch') or {}
                if dispatch.get('status') != 'delivered' or dispatch.get('delivery_ref') != op.get('delivery_id'):
                    raise ApiError(409, 'Falta recibo confirmado del intento de envío')
                try:
                    delivered = datetime.fromisoformat(dispatch['delivered_at'].replace('Z', '+00:00'))
                    first = datetime.fromisoformat(op['first_delivery_at'].replace('Z', '+00:00'))
                    if delivered.tzinfo is None or first.tzinfo is None or delivered != first or delivered > now:
                        raise ValueError()
                except (KeyError, TypeError, AttributeError, ValueError):
                    raise ApiError(409, 'Fecha de entrega no confirmada por el recibo de Core') from None
                remote = self.rpc('delivery', {'id': demo_id, 'eventId': 'captacion:' + sha256(
                    (session.organization_id + ':' + op['delivery_id']).encode()).hexdigest(),
                    'deliveredAt': iso(delivered),
                    'evidenceRef': 'core:' + session.organization_id + ':' + dispatch['id'] + ':' + op['delivery_id']})
            # Never infer a customer account from email or accept a browser-supplied identity.
            if entry.get('customer_owner_id'):
                remote = self.rpc('link', {'id': demo_id, 'customerOwnerId': str(UUID(entry['customer_owner_id']))})
            if op['paid'] and not remote.get('purchaseProtected'):
                raise ApiError(409, 'Compra pendiente de vincular y verificar; no se ejecuta caducidad')
            # Expiry is enforced atomically by the product, never by downgrading the account.
            if not op['paid']: remote = self.rpc('expire', {'id': demo_id})
            return Response(200, {'provider_verified': True, 'sending_enabled': False, 'demo': {
                k: remote.get(k) for k in ('id','plan','version','effectiveState','delivered_at','expires_at','purchaseProtected')}})
        except ApiError as exc: return Response(exc.status, {'error': str(exc)})
        except RevisionConflict: return Response(409, {'error':'Hay cambios; recarga el lote'})
        except Exception: return Response(503, {'error':'Operación no confirmada; puedes reintentar sin duplicar la demo'})
