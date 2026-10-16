"""Comprobaciones de enlace con Foto Fachada; no red, consumo ni cambios remotos.

Los hechos del proveedor deben obtenerse por servidor. Este módulo no verifica
firmas ni convierte un JSON del navegador en evidencia autenticada.
"""
from motor import timestamp, blocked

PRODUCT_PLANS = frozenset(('FREE', 'PRO', 'BUSINESS', 'ENTERPRISE'))


def integration_status(state, now):
    """Consulta local de preparación. No consulta al proveedor ni genera eventos."""
    items = []
    for oid, op in state['opportunities'].items():
        if op['route'] != 'ESCAPARATES':
            continue
        if op['paid']:
            pending = 'compra_protegida'
        elif op['closed']:
            pending = 'cerrada'
        elif blocked(state, op):
            pending = 'contacto_excluido'
        elif not op.get('demo'):
            pending = 'generacion_y_publicacion_pendientes'
        elif not op.get('first_delivery_at'):
            pending = 'entrega_sin_confirmar_plazo_no_iniciado'
        elif not op.get('expires_at'):
            pending = 'plazo_inconsistente_revisar'
        elif now < timestamp(op['expires_at']):
            pending = 'plazo_en_curso'
        elif (op.get('demo') or {}).get('state') == 'free_confirmado':
            pending = 'caducidad_registrada_localmente'
        else:
            pending = 'vencida_pendiente_verificacion_proveedor'
        items.append({'opportunity_id': oid, 'pending': pending,
                      'expires_at': op.get('expires_at')})
    return {'mode': state['mode'], 'revision': state['revision'], 'items': items,
            'provider_verified': False, 'external_actions_enabled': False,
            'remote_requests': 0}


def product_plan(value):
    if value not in PRODUCT_PLANS:
        raise ValueError('Plan sin correspondencia verificada; Premium no equivale automáticamente a Business')
    return value


def expiry_preflight(state, opportunity_id, remote, now):
    """Informe preparatorio. Incluso sin bloqueos no habilita ejecución.

    remote es proyección interna del proveedor, no el resumen de cuenta bruto.
    Necesita revisión de demo y contrato/pago dentro de una transición atómica.
    """
    op=state['opportunities'][opportunity_id]
    reasons=[]
    demo=op.get('demo') or {}
    effect=state['effects'].get(opportunity_id+':demo_a_free',{})
    if op['route']!='ESCAPARATES' or not demo: reasons.append('no_demo')
    if not op.get('expires_at') or now < timestamp(op['expires_at']): reasons.append('not_due')
    if op.get('paid'): reasons.append('local_purchase_protected')
    if demo.get('state')!='caducidad_pendiente' or effect.get('status')!='pendiente_integracion':
        reasons.append('no_pending_expiry')
    if not isinstance(remote,dict): remote={}
    if remote.get('verified_by_server') is not True: reasons.append('unverified_provider')
    try:
        age=(now-timestamp(remote['observed_at'])).total_seconds()
        if not 0<=age<=60: reasons.append('stale_provider_read')
    except (KeyError,ValueError,TypeError): reasons.append('stale_provider_read')
    if not demo.get('demo_id') or remote.get('demo_id')!=demo.get('demo_id'): reasons.append('demo_mismatch')
    if remote.get('commercial_demo') is not True: reasons.append('not_commercial_demo')
    if remote.get('paid') is not False or remote.get('contracted') is not False:
        reasons.append('purchase_or_contract_not_cleared')
    if remote.get('operation_scope')!='demo': reasons.append('account_change_forbidden')
    if remote.get('conditional_expiry_supported') is not True: reasons.append('atomic_expiry_unverified')
    for key in ('revision','backup_ref','verification_ref','free_rights_ref'):
        if not isinstance(remote.get(key),str) or not remote[key].strip(): reasons.append('missing_'+key)
    if remote.get('current_plan') not in ('PRO','BUSINESS'): reasons.append('unsupported_demo_plan')
    if remote.get('target_plan')!='FREE': reasons.append('unsupported_free_mapping')
    # No endpoint de downgrade recuperado: nunca emitir una solicitud ejecutable.
    return {'opportunity_id':opportunity_id,'demo_id':demo.get('demo_id'),
            'blocking_reasons':reasons,'ready_for_adapter_review':not reasons,
            'apply_allowed':False,'account_plan_change_allowed':False,
            'remote_requests':0,'notification_allowed':False}
