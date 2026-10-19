# Integración de reglas aprobadas — 19/10/2026

Estado: rama de desarrollo; NO preparada para despliegue de lanzamiento.

## Integrado y comprobable localmente

- Migración 20261019182324_approved_credit_enforcement.sql: BASIC 100, PRO 200 y BUSINESS 400 créditos al mes. Acumulación de los nuevos créditos incluidos limitada a 200/400/800. No se generan asignaciones nuevas dentro del periodo de gracia.
- El saldo anterior se conserva íntegro como saldo histórico; no se presume qué parte fue comprada. Las nuevas asignaciones y sus consumos/devoluciones se contabilizan por separado. No se convierten créditos a tokens del proveedor.
- Servidor de generación de texto/imagen/logo: sesión comprobada, tarifa consultada, confirmación explícita, validación actual de derechos y precio exacto; texto 5 e imagen/logo 20. FREE y planes caducados no pueden regenerar desde una pestaña vieja.
- Las reservas y devoluciones son únicas por operación. Una operación exitosa no puede reembolsarse después. Si el resultado o reembolso no se puede confirmar, el mensaje indica revisión y conserva la referencia, sin afirmar que se devolvió dinero.
- Recargas bloqueadas en servidor y en el selector. Las recargas históricas no se eliminan. Contratación asistida PRO/BUSINESS ya no escribe 1.000 créditos mensuales.
- Cuota comercial visible de lanzamiento corregida a 100 clientes. La asignación segura de ese cupo y la conservación automática del precio aún requieren integración.
- Salud del servidor exige las columnas nuevas de créditos para detectar un despliegue incompleto.
- Eliminadas recomendaciones ficticias del optimizador.

## Preparado, todavía sin flujo completo

- Reglas de análisis de métricas 20/40, selección de hasta tres campañas y 90 días, lista explícita de campos agregados, ausencia de datos, muestra pequeña y validación del informe.
- Reglas de notificaciones, preferencias, agrupación y alertas de cuota. No se ha conectado Resend ni enviado correo.
- Migración 20261019183617_trials_purchases_basic.sql integrada y probada localmente: prueba de campaña de siete días desde la primera publicación, sin reinicio al republicar; compra asistida de 40 € + IVA con verificación de pago por operador; derechos permanentes y publicaciones simultáneas, incluso en FREE. El borrado exige confirmación y conserva la evidencia financiera.
- BASIC integrado en contratación asistida, activación, créditos y representación pública: mismas funciones de FREE, sin marca INNOVA, 100 créditos/mes y acumulación máxima de 200; 6 €/mes o 60 €/año + IVA. Prueba BASIC de 48 horas con 40 créditos aislados y no repetibles, disponible después de la prueba de campaña.
- El panel permite preparar la prueba, solicitar la compra y continuar hacia PRO, BASIC o FREE. Los permisos se calculan en servidor; las campañas compradas permanecen al bajar de plan. Los avisos temporales se registran en cola, pero todavía no se envían.

## Bloqueos de despliegue pendientes de desarrollo

1. Validar las dos migraciones juntas con datos representativos y comprobar los recorridos con autenticación real tras la recuperación de Supabase. La generación inicial ya utiliza derechos de prueba, compra o cuota de suscripción; las operaciones agrupadas sin tarifa siguen bloqueadas.
2. Completar la limpieza reintentable de archivos tras borrar una campaña: actualmente el cliente intenta limpiarlos después del borrado autorizado. La prueba única se controla por cuenta propietaria; no existe deduplicación entre distintas cuentas de un mismo negocio.
3. Asignación segura del cupo de lanzamiento de 100 negocios y precio conservado por renovación continua. Las compras de campaña y BASIC funcionan por contratación asistida; no se ha habilitado cobro automático real.
4. Contactos, conservación, publicación programada, métricas de sesiones e informes reales.
5. Envío de correo, verificación del dominio y procesamiento/reintentos de la cola. Revalidar derechos al enviar para no pedir pagos a quien ya ha contratado. Empezar gratis según decisión de Javi.
6. Pruebas de navegador y del recorrido comercial completo, comprobación de recuperación del QR y actualización final de documentos.

## Supabase

Javi ha decidido esperar al restablecimiento de cuota. No se ha ampliado el plan, modificado la base de producción, desplegado esta rama ni hecho llamadas de IA de pago. La API estaba bloqueada por exceed_egress_quota; no hay fecha de recuperación verificada.

## Criterio de aceptación antes de desplegar

Ejecutar todas las pruebas, probar la migración con una copia autorizada de datos, verificar saldos y reservas pendientes, completar los bloqueos anteriores, revisar seguridad y comprobar el flujo real con una cuenta de pruebas. No confundir las pruebas locales con disponibilidad del producto en producción.
