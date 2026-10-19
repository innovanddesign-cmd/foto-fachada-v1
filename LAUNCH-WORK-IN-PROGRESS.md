# Integración de reglas aprobadas — 19/10/2026

Estado: rama de desarrollo; NO preparada para despliegue de lanzamiento.

## Integrado y comprobable localmente

- Migración 20261019182324_approved_credit_enforcement.sql: BASIC 100, PRO 200 y BUSINESS 400 créditos al mes. Acumulación de los nuevos créditos incluidos limitada a 200/400/800. No se generan asignaciones nuevas dentro del periodo de gracia.
- El saldo anterior se conserva íntegro como saldo histórico; no se presume qué parte fue comprada. Las nuevas asignaciones y sus consumos/devoluciones se contabilizan por separado. No se convierten créditos a tokens del proveedor.
- Servidor de generación de texto/imagen/logo: sesión comprobada, tarifa consultada, confirmación explícita, validación actual de derechos y precio exacto; texto 5 e imagen/logo 20. FREE y planes caducados no pueden regenerar desde una pestaña vieja.
- Las reservas y devoluciones son únicas por operación. Una operación exitosa no puede reembolsarse después. Si el resultado o reembolso no se puede confirmar, el mensaje indica revisión y conserva la referencia, sin afirmar que se devolvió dinero.
- Recargas bloqueadas en servidor y en el selector. Las recargas históricas no se eliminan. Contratación asistida PRO/BUSINESS ya no escribe 1.000 créditos mensuales.
- Oferta de lanzamiento: cotización autenticada y asignación atómica de 100 plazas al verificar contratos anuales PRO/BUSINESS. No se consumen por solicitudes ni pagos simulados. Renovación contigua del mismo plan conserva el precio y rechaza cobrar la tarifa normal. Consulta de producción de solo lectura: 0 contratos actuales; preflight impide ignorar históricos que aparezcan antes de migrar.
- Salud del servidor exige las columnas nuevas de créditos para detectar un despliegue incompleto.
- Eliminadas recomendaciones ficticias del optimizador.

## Preparado, todavía sin flujo completo

- Reglas de análisis de métricas 20/40, selección de hasta tres campañas y 90 días, lista explícita de campos agregados, ausencia de datos, muestra pequeña y validación del informe.
- Reglas de notificaciones, preferencias, agrupación y alertas de cuota. Transporte Resend implementado y probado con proveedor simulado; sin credenciales ni envíos reales.
- Migración 20261019183617_trials_purchases_basic.sql integrada y probada localmente: prueba de campaña de siete días desde la primera publicación, sin reinicio al republicar; compra asistida de 40 € + IVA con verificación de pago por operador; derechos permanentes y publicaciones simultáneas, incluso en FREE. El borrado exige confirmación y conserva la evidencia financiera.
- BASIC integrado en contratación asistida, activación, créditos y representación pública: mismas funciones de FREE, sin marca INNOVA, 100 créditos/mes y acumulación máxima de 200; 6 €/mes o 60 €/año + IVA. Prueba BASIC de 48 horas con 40 créditos aislados y no repetibles, disponible después de la prueba de campaña.
- El panel permite preparar la prueba, solicitar la compra y continuar hacia PRO, BASIC o FREE. Los permisos se calculan en servidor; las campañas compradas permanecen al bajar de plan. Los avisos temporales se registran en cola, pero todavía no se envían.
- Limpieza de archivos: cola duradera creada al eliminar campañas; trabajador acotado por propietario y campaña con paginación, carpetas y reintentos. Pendiente configurar el ejecutor periódico y probar Storage real. No se reutilizan identificadores borrados.
- Publicación programada: migración, API y ejecutor unitario local comprobados. Versión confirmada, zona y fecha, cancelación, permisos/capacidad al ejecutar, límite de reintentos, margen de 15 minutos y aviso pendiente. Falta interfaz, preparación de imágenes y validar el ejecutor periódico/envío reales; transporte y avisos preparados, activación deshabilitada.
- Contactos: formulario público condicionado a derechos, 500 PRO/1.500 BUSINESS por cuenta y 100 por campaña comprada; control de capacidad, avisos 80/100, idempotencia y límite técnico de peticiones. Panel privado con exportación CSV paginada y borrado individual o por campaña. Campos: nombre, un medio de contacto y mensaje; sin adjuntos ni suscripción publicitaria. Activación deshabilitada hasta validar el recorrido y la información del negocio.
- Conservación: consultas hasta 12 meses y acceso limitado tras pérdida del servicio, sin reiniciar plazos ya vencidos. Marcas de borrado para reaplicar tras restauración. Campañas publicadas que pierden visibilidad se archivan; se preservan la web FREE y compras permanentes. El borrado automático exige avisos acreditados con margen de 30/7 días, no basta que estén en cola. Falta ejecutar y comprobar tareas periódicas y copias reales.
- Correos de consultas: preferencias inmediato/diario/desactivado y zona del negocio; agrupación, deduplicación y preparación de cola. Transporte y comprobación de entrega implementados con proveedor simulado; no hay envíos reales. Avisos esenciales separados de la desactivación de consultas.

## Bloqueos de despliegue pendientes de desarrollo

1. Validar todas las migraciones juntas con datos representativos y comprobar los recorridos con autenticación real tras la recuperación de Supabase. La generación inicial ya utiliza derechos de prueba, compra o cuota de suscripción; las operaciones agrupadas sin tarifa siguen bloqueadas.
2. Activar y verificar la limpieza de archivos con el ejecutor periódico. La prueba única y las plazas se controlan por cuenta propietaria; no existe deduplicación entre distintas cuentas de un mismo negocio.
3. Comprobar oferta/renovación en el recorrido real de contratación asistida, incluido el cambio de disponibilidad durante un pago por transferencia. No se ha habilitado cobro automático real.
4. Activación y validación integral de contactos/conservación, cierre de cuenta con separación de justificantes, restauración y rotación de copias; interfaz/imágenes/ejecutor de programación, métricas de sesiones e informes reales.
5. Transporte, cola y reintentos probados localmente; pendientes dominio y envío/entrega reales, consumo compartido y configuración del ejecutor/monitorización. Revalidar derechos al enviar para no pedir pagos a quien ya ha contratado. Empezar gratis según decisión de Javi.
6. Pruebas de navegador y del recorrido comercial completo, comprobación de recuperación del QR y actualización final de documentos.

## Supabase

Javi ha decidido esperar al restablecimiento de cuota. No se ha ampliado el plan, modificado la base de producción, desplegado esta rama ni hecho llamadas de IA de pago. La API estaba bloqueada por exceed_egress_quota; no hay fecha de recuperación verificada.

## Criterio de aceptación antes de desplegar

Ejecutar todas las pruebas, probar la migración con una copia autorizada de datos, verificar saldos y reservas pendientes, completar los bloqueos anteriores, revisar seguridad y comprobar el flujo real con una cuenta de pruebas. No confundir las pruebas locales con disponibilidad del producto en producción.

Validación de esta entrega: 30 suites locales, TypeScript y compilación Next.js. Página local de consultas inspeccionada sin sesión; recorrido autenticado pendiente. Detalle de activación, límites y comprobaciones en LAUNCH-OPERATIONS.md.

Correo y tareas automáticas: ver EMAIL-WORKER-OPERATIONS.md para límites, configuración, pruebas y dependencias de activación. Ningún cambio se ha activado en producción.
