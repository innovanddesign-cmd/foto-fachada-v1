"""Transporte RPC transaccional para alojamiento sin conexión PostgreSQL directa.

Reutiliza contrato y reconstrucción; no importa lotes ni resuelve identidades.
La RPC solo es accesible al backend. Autenticación de operador en core_service.
"""
from copy import deepcopy
import json
from uuid import UUID
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from core_repository import _records, _reconstruct, RepositoryError, RevisionConflict


class CoreRestRepository:
    def __init__(self, exchange):
        self.exchange=exchange

    def load(self, organization_id):
        org=str(UUID(organization_id))
        rows=self.exchange(org,None,None)
        records={(row['kind'],row['external_id']):row['payload'] for row in rows}
        if len(records)!=len(rows): raise RepositoryError('Identidades duplicadas')
        return _reconstruct(records)

    def apply_derived(self, organization_id, event_builder, *, expected_revision):
        from motor import apply_event
        previous=self.load(organization_id)
        event=event_builder(deepcopy(previous))
        state=apply_event(previous,event)
        if state==previous:return state
        if type(expected_revision) is not int or expected_revision!=previous['revision']:
            raise RevisionConflict('Revisión obsoleta')
        records=_records(state)
        rows=[{'kind':kind,'external_id':external,'payload':payload}
              for (kind,external),payload in records.items()]
        result=self.exchange(str(UUID(organization_id)),expected_revision,rows)
        saved=_reconstruct({(r['kind'],r['external_id']):r['payload'] for r in result})
        if saved!=state:raise RepositoryError('Confirmación inconsistente')
        return saved


def exchange_client(secret):
    if not secret:raise RepositoryError('Core no configurado')
    def exchange(org,expected,records):
        payload=json.dumps({'p_org':org,'p_expected':expected,'p_records':records},ensure_ascii=False).encode()
        headers={'apikey':secret,'Accept-Profile':'innova','Content-Profile':'innova',
                 'Content-Type':'application/json'}
        if secret.startswith('eyJ'):headers['Authorization']='Bearer '+secret
        request=Request('https://skgpjovfkcpyenipjlxh.supabase.co/rest/v1/rpc/captacion_exchange_v1',
                        data=payload,headers=headers,method='POST')
        try:
            with urlopen(request,timeout=20) as response:
                raw=response.read(21*1024*1024+1)
        except HTTPError as error:
            status=error.code;error.close()
            if status==409:raise RevisionConflict('Revisión obsoleta') from None
            raise RepositoryError('Core no confirma la operación') from None
        if len(raw)>21*1024*1024:raise RepositoryError('Respuesta fuera de límites')
        result=json.loads(raw)
        if not isinstance(result,list):raise RepositoryError('Respuesta inválida')
        return result
    return exchange
