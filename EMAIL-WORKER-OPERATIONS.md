# Correos y tareas automáticas — preparación del 19/10/2026

Código preparado en la rama de lanzamiento. No se han aplicado migraciones, configurado una tarea periódica, conectado credenciales, enviado correos reales ni activado producción.

## Comportamiento implementado

- Formulario/consultas: inmediato, agrupación con una separación mínima de 15 minutos o resumen a las 09:00 locales. La desactivación de consultas conserva los avisos esenciales. Se revalida el contacto y su plazo antes de cada intento.
- Pruebas: avisos de últimas 24 horas y fin de campaña; inicio/fin de BASIC. Se comprueba el estado actual de la prueba, compras y contratación antes del envío. No se ofrece una tarifa de lanzamiento fija sin consultar disponibilidad en el panel.
- Publicaciones programadas: resultado de la revisión vigente; se descartan avisos de una programación sustituida o eliminada.
- Conservación: correo de advertencia con el margen de 30/7 días, identificación de campaña y acceso al panel. Preparar o aceptar un correo no acredita entrega. El borrado sigue exigiendo ambos márgenes completos desde la constancia de entrega.
- Destino: correo actual confirmado por Auth; no se acepta un destinatario del navegador ni se incluyen mensajes, nombres o direcciones de los contactos en el cuerpo. El sobre conserva el correo de la cuenta dentro de tablas privadas; la purga de ese sobre y el cierre de cuenta continúan pendientes.
- Reintentos: concesión de cinco minutos, mismo contenido y clave de idempotencia. Después de 23 horas con resultado incierto, revisión manual; nunca reiniciar automáticamente el envío una vez agotada la ventana del proveedor.
- Cuota: reserva atómica antes del intento, incluso si falla o el resultado es incierto. Se bloquea el siguiente correo con 100 reservas en 24 horas o 3.000 en 31 días. Son ventanas móviles conservadoras, no una lectura del contador real del proveedor. Las reservas no se liberan al fallar. Estado y señales de 80/90/100 en el resultado del trabajador y `email_status` del operador. No se ha configurado una alerta externa del hosting ni un cambio automático a plan de pago.

## Ejecutor preparado

`POST /api/internal/maintenance` requiere un secreto independiente de al menos 32 caracteres y `INNOVA_MAINTENANCE_ENABLED=true`. No acepta credenciales en la URL. Un bloqueo persistente evita dos ejecuciones simultáneas y limita su frecuencia. Cada tarea conserva su propio resultado; un error de retención no impide procesar una tarea independiente.

Por ejecución: una publicación vencida si su función está habilitada; un lote de conservación; preparación de avisos de pruebas y publicaciones; preparación de hasta 500 fuentes de correo; una comprobación de entrega; un intento de correo; estado de cuota; una limpieza de Storage si dispone de configuración. La publicación y limpieza siguen acotadas y pendientes de dimensionar con carga real. Un bloqueo vencido permite recuperar el trabajador tras una interrupción. La exclusión global y los arrendamientos se han probado localmente; falta concurrencia distribuida real.

`scripts/run-maintenance.mjs` es el cliente preparado para un programador del hosting con frecuencia de un minuto. Lee origen y secreto del entorno; no se ha instalado ni arrancado. Emite resultado y señales de cuota sin destinatarios ni secretos. Los errores de pasos requieren atención en el resultado, sin publicar el error interno.

## Secuencia de validación antes de activar

1. Aplicar las migraciones en orden sobre una copia autorizada compatible, comprobar roles, RLS y asesores. Mantener desactivadas las funciones nuevas durante la migración de infraestructura.
2. Configurar origen HTTPS, remitente y clave del proveedor solo en servidor. Verificar realmente el dominio y la cuenta del proveedor antes de poner `INNOVA_EMAIL_DOMAIN_VERIFIED=true`; la variable es una barrera de configuración y no realiza esa verificación por sí sola.
3. Comprobar todo el consumo compartido de la cuenta del proveedor. Esta rama solo cuenta sus propias reservas; si otros productos o claves comparten cuota, se necesita un presupuesto común o un aislamiento real antes de habilitarla. No basta crear otra clave en la misma cuenta.
4. Probar con destinatario controlado: envío, aceptación, entrega, rechazo, límite, reintento, cambio de correo/preferencia, compra antes del envío y avisos de conservación. El sondeo autenticado `GET /emails/:id` registra `delivered`; una respuesta de aceptación de envío deja el aviso sin acreditar.
5. Probar Storage real, fallo parcial y recuperación; programación de publicaciones, permisos/capacidad y retrasos; retención y restauración. Preparar monitorización del hosting para fallos y señales de cuota.
6. Solo tras aprobar todos esos resultados, configurar el programador y activar cada función. Inicio con el plan gratuito aprobado; no se ha cambiado el plan ni realizado gasto. La decisión de pasar al plan de pago cuando se agote la cuota se conserva, pero el mecanismo de contratación no está conectado.

## Evidencia y límites

30 suites locales, TypeScript y compilación Next.js. SQL real sobre PGlite y rutas/transportes reales con proveedor simulado. Se prueban entrega distinta de aceptación, exclusión, reintentos, cuotas, cambios de derechos y permisos privados. Todavía faltan envío/entrega reales, recorridos autenticados, configuración del hosting y pruebas en la infraestructura definitiva. La rama continúa sin estar lista para activar el lanzamiento completo.

Referencias oficiales consultadas: [envío](https://resend.com/docs/api-reference/emails/send-email), [idempotencia de 24 horas](https://resend.com/docs/dashboard/emails/idempotency-keys), [estado de entrega](https://resend.com/docs/api-reference/emails/retrieve-email), [seguridad RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
