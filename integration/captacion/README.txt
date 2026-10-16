INNOVA — Puente de demos y primer lote interno · 15/10/2026

El código de runtime/ es la copia sin secretos del motor que ya estaba publicado
en Hostinger al iniciar esta integración. Se conserva para reproducir las pruebas.
No se sustituye en el servidor. publish.py solo publica seis archivos enumerados,
verifica su versión anterior, guarda copia local y comprueba los bytes por FTPS.

ERP: /erp/demos.html → POST /erp/api/captacion.php?view=demos
La sesión y la membresía se comprueban mediante erp_common.php/core_session.php.
Solo admin/director, origen ERP y application/json. La identidad nunca procede
de un parámetro del navegador. Python recibe la clave existente por stdin.

Lista: {"action":"list"}.
Preparar/consultar: {action:"prepare"|"sync", opportunity_id,
expected_revision, expected_version}. No se aceptan campaignId, customerOwnerId,
evidenceRef ni planes enviados por el navegador. Se resuelven en el manifiesto
privado, que limita organización, oportunidad, campaña fuente y referencia.
La autorización de la misma referencia también se comprueba en PostgreSQL.

Primer lote: tres oportunidades QA sin contacto, pagos ni permisos de envío.
Las fuentes son las campañas ficticias prueba-e2e-barrio-norte, prueba-e2e-atelier
y prueba-e2e-serena, previamente creadas por el usuario para pruebas. No son
negocios captados ni oportunidades de facturación. No ejecutan IA adicional.
El manifiesto distingue enabled de public_ready; no permite preparar hasta
verificar el alojamiento público. El contenido queda pendiente de revisión humana.

prepare crea/publica una instantánea separada e idempotente y registra demo_ready
en Core con versión esperada. No aprueba una propuesta, un canal ni un envío.
Si Core falla tras la publicación, reintentar recupera la misma demo.
sync consulta el producto y solo transfiere una entrega si Core contiene un
intento reservado en estado delivered con el mismo recibo. Nunca fabrica recibos.
El plazo del producto empieza al recibir esa primera confirmación; puede ser
posterior al timestamp del proveedor conservado en Core. La vista pública del
producto determina la disponibilidad real; no se amplía el plazo por reintento.

La cuenta del comprador solo se vincula mediante una relación confirmada incluida
en el manifiesto privado. No se infiere por email. Si Core informa de compra pero
el producto no confirma contrato vigente, se detiene la caducidad y se informa
del conflicto. No se modifican planes, saldos ni suscripciones de clientes.

El motor anterior sigue conservando los nombres históricos demo_a_free y
free_confirmado. Este puente no emite free_confirmado ni avisos: la demo caduca
con su contenido conservado, sin convertir una cuenta a Free. La respuesta sync
del producto es la evidencia del estado. El envío y sus webhooks no se habilitan
con este trabajo; cualquier lote real requiere destinatarios y autorización.

Pruebas: python -B -m unittest discover -s integration/captacion -p 'test_*.py'
Incluyen aislamiento por organización, caducidad de sesión, roles, bloqueo del
alojamiento, versiones, exclusiones, reintentos, inyección de cuenta/campaña,
recibos no verificados y protección ante compra local sin confirmar en producto.

Los datos/credenciales de despliegue y copias anteriores se mantienen en .work,
excluido de Git. No copiar la exportación de FileZilla al repositorio ni al hosting.
