"""Entrada privada: solo PHP autenticado aporta sesión y clave por stdin."""
import json
import sys
from pathlib import Path
from datetime import datetime, timezone
from core_rest import CoreRestRepository, exchange_client
from core_service import CaptacionService, VerifiedSession, _object


def main():
    try:
        raw=sys.stdin.buffer.read(65537)
        if len(raw)>65536:raise ValueError('size')
        request=json.loads(raw,object_pairs_hook=_object)
        context=request['session']
        session=VerifiedSession(context['organization_id'],context['actor_id'],context['role'],
                                context['active'],datetime.fromtimestamp(context['expires_at'],timezone.utc))
        repo=CoreRestRepository(exchange_client(request['core_key']))
        service=CaptacionService(repo,lambda headers:session,writes_enabled=True)
        headers={'Origin':'https://innovandesign.com','Content-Type':'application/json'}
        if request['path']=='/captacion/demos':
            from commercial_demos import DemoService, demo_client
            batch=json.loads(Path(__file__).with_name('commercial_demo_batch.json').read_text(encoding='utf-8'))
            response=DemoService(repo,lambda headers:session,demo_client(request['core_key']),batch).handle(
                request['method'],headers,request['body'].encode('utf-8'))
        else:
            response=service.handle(request['method'],request['path'],headers,request['body'].encode('utf-8'))
        result={'status':response.status,'body':response.body}
    except Exception:
        result={'status':503,'body':{'error':'Captacion no disponible; guardado no confirmado'}}
    print(json.dumps(result,ensure_ascii=False))


if __name__=='__main__':main()
