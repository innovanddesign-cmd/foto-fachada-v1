"""Publish only the demo bridge, with TLS verification and optimistic file guards.
Run from repo root after downloading the current baseline to .work/captacion-source.
Credentials stay in the existing FileZilla export; never log them.
"""
import base64
import ftplib
import io
import ssl
import sys
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

root=Path(__file__).resolve().parents[2]
source=root/'integration/captacion'
baseline=root/'.work/captacion-source'
backup=root/'.work/captacion-backups'/datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')
files=[('commercial_demos.py','/innova-private/captacion-v1/commercial_demos.py'),
       ('commercial_demo_batch.json','/innova-private/captacion-v1/commercial_demo_batch.json'),
       ('hostinger_stdio.py','/innova-private/captacion-v1/hostinger_stdio.py'),
       ('captacion.php','/public_html/erp/api/captacion.php'),
       ('demos.js','/public_html/erp/demos.js'),('demos.html','/public_html/erp/demos.html')]
server=ET.parse(sys.argv[1]).find('.//Server')
ftp=ftplib.FTP_TLS(context=ssl.create_default_context(),timeout=30)
ftp.connect(server.findtext('Host'),int(server.findtext('Port')))
# Hostinger presents its valid wildcard hstgr.io certificate on this FTP IP.
ftp.host='hstgr.io'
ftp.auth()
password=server.find('Pass')
ftp.login(server.findtext('User'),base64.b64decode(password.text).decode() if password.get('encoding')=='base64' else password.text)
ftp.prot_p()
def read(path):
    result=io.BytesIO()
    try:ftp.retrbinary('RETR '+path,result.write)
    except ftplib.error_perm as exc:
        if str(exc).startswith('550'):return None
        raise
    return result.getvalue()
try:
    originals={}
    for name,remote in files:
        existing=read(remote); originals[remote]=existing
        if existing is not None:
            expected=(baseline/name).read_bytes() if (baseline/name).exists() else None
            if existing not in (expected,(source/name).read_bytes()):
                raise RuntimeError('Remote file changed; review before publishing: '+name)
    backup.mkdir(parents=True)
    for name,remote in files:
        content=(source/name).read_bytes()
        if originals[remote]==content:continue
        if originals[remote] is not None:(backup/name).write_bytes(originals[remote])
        if read(remote)!=originals[remote]:raise RuntimeError('Concurrent update: '+name)
        temporary='/innova-private/captacion-v1/.staging-'+name
        ftp.storbinary('STOR '+temporary,io.BytesIO(content))
        if read(temporary)!=content:raise RuntimeError('Upload verification failed: '+name)
        ftp.rename(temporary,remote)
        if read(remote)!=content:raise RuntimeError('Publication verification failed: '+name)
        (baseline/name).write_bytes(content)
        print('Published and byte-verified:',name)
finally:ftp.close()
