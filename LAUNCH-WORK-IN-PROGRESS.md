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
- BASIC tiene soporte de créditos en la base de datos. Su contratación, representación pública sin marca y derechos completos aún no están integrados.

## Bloqueos de despliegue pendientes de desarrollo

1. Sustituir el antiguo permiso de generación inicial por derechos de prueba de siete días y compra de campaña. La migración bloquea el antiguo acceso inicial y las operaciones agrupadas sin tarifa aprobada. NO desplegarla sola: faltaría completar ese recorrido.
2. Campañas de 40 € permanentes, publicables simultáneamente y conservadas al bajar de plan; advertencia explícita antes del borrado.
3. BASIC completo, cupo de lanzamiento de 100 negocios y precio conservado por renovación continua.
4. Contactos, conservación, publicación programada, métricas de sesiones e informes reales.
5. Envío de correo, verificación del dominio y colas/reintentos. Empezar gratis según decisión de Javi.
6. Pruebas de navegador y del recorrido comercial completo, comprobación de recuperación del QR y actualización final de documentos.

## Supabase

Javi ha decidido esperar al restablecimiento de cuota. No se ha ampliado el plan, modificado la base de producción, desplegado esta rama ni hecho llamadas de IA de pago. La API estaba bloqueada por exceed_egress_quota; no hay fecha de recuperación verificada.

## Criterio de aceptación antes de desplegar

Ejecutar todas las pruebas, probar la migración con una copia autorizada de datos, verificar saldos y reservas pendientes, completar los bloqueos anteriores, revisar seguridad y comprobar el flujo real con una cuenta de pruebas. No confundir las pruebas locales con disponibilidad del producto en producción.
