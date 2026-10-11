# Auditoría de contratación e IA — 10 octubre 2026

Despliegue publicado: dpl_55xZ5vAs59xPA1wefTR2gwFZhivr, en foto-fachada-v1.vercel.app y escaparates.innovandesign.com.

## Verificado
- 16 suites automatizadas correctas; build de producción y comprobación TypeScript correctos. Lint sin errores, con avisos existentes de imágenes/hooks. npm audit: cero vulnerabilidades conocidas en dependencias; no equivale a una garantía de seguridad absoluta.
- Pedidos reales de prueba: precio e IVA del servidor, idempotencia, rechazo/reintento, pago simulado sin activar derechos de pago. Login conserva el pedido. Recargas manuales prohibidas a Free.
- Groq Free: análisis real de fachada y propuesta inicial; prueba directa con barbería, estética e inmobiliaria. Navegador: imagen BH URBAN subida por el usuario, identidad, objetivo, diseño, edición, regeneración gratuita de texto, cartel A3 guardado, borrador remoto, publicación y retirada.
- Regeneración de texto OpenRouter :free validada por API y por interfaz con coste cero. Sin alternativa de pago.
- QR /t/prueba-innova-bh-urban respondió 307 a /v/prueba-innova-bh-urban, página pública cargada y renderizada en navegador como Free. Enlaces de contacto inspeccionados, sin enviar mensajes. Campaña etiquetada como PRUEBA y retirada después; borrador privado conservado.
- Regla Storage corregida: la subconsulta resolvía name como nombre de campaña. Ahora usa objects.name. Lectura de activo propio comprobada; escrituras a propietario ajeno o campaña inexistente rechazadas.
- Corregido fallo posterior por blob URL caducada tras login: fachada reutiliza su activo persistente y nuevas imágenes de galería se conservan como data URLs. Prueba de regresión añadida.

## Límites y pendientes reales
- La pasarela es ficticia. La contratación real sigue siendo asistida y exige verificación del pago; no hay adquirente bancario definitivo conectado.
- Generación de imágenes/logos con IA gratuita aún sin proveedor validado. El cartel usa el compositor y la foto del cliente, con texto de IA; no genera una foto nueva.
- Prueba de QR impreso, entrega física y recepción de correo de recuperación pendientes. No se envió ningún correo ni WhatsApp en esta auditoría.
- Groq Free tiene límites de velocidad. No se promete disponibilidad o generación ilimitada sin restricciones del proveedor.
- Contratación pagada completa y operaciones de operador se han probado automáticamente; no se ha registrado un cobro real ni un contrato real.
- Vista móvil: DOM sin desbordamiento a 390px; la captura con emulación de Brave fue defectuosa. Falta validación visual completa en móvil físico.

La documentación comercial/legal y el proveedor de pago definitivo siguen sujetos a las decisiones ya pendientes. No declarar lanzamiento plenamente validado a partir de estas pruebas parciales.
