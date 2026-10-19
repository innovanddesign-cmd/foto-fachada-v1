# Preparación operativa — 19/10/2026

Rama en borrador. Ninguna instrucción de este documento se ha ejecutado en producción.

## Oferta y renovación

La cotización autenticada usa `private.innova_plan_quote`. Una solicitud no reserva plaza: solo un contrato pagado y verificado consume una de las 100 plazas anuales de lanzamiento PRO/BUSINESS. Las plazas no se reciclan. La base de datos serializa esa asignación y rechaza la plaza 101; BASIC, campañas puntuales y pruebas de pago no consumen plazas.

Las renovaciones del mismo plan anual conservan el precio y admiten pago anticipado para el periodo contiguo. Un periodo con hueco no se considera renovación continua. El plazo de regularización del pago es el mes aprobado; no permite añadir tiempo gratuito ni desplazar el inicio del periodo. Cambiar a BASIC o mensual termina la concesión de ese plan; un cambio PRO/BUSINESS requiere verificar sus condiciones antes de cobrar, sin trasladar automáticamente la oferta.

Un pedido antiguo con importe desactualizado no puede recibir instrucciones de pago ni cerrarse con un contrato de importe diferente. Antes de dar instrucciones hay que consultar el precio vigente. La confirmación final del contrato vuelve a comprobar el cupo; no existe cobro automático ni reserva temporal de plaza. Si el cupo cambia durante la transferencia asistida, se debe resolver el caso con el cliente antes de activar o pedir una diferencia: el sistema no acepta ni cobra esa diferencia automáticamente.

Consulta SQL de solo lectura del 19/10: `innova-core` tiene 0 contratos en `private.innova_contracts`, incluidos 0 de lanzamiento. La migración vuelve a comprobar el histórico y se detiene si aparecen contratos promocionales antes de aplicarla, para evitar omitir derechos previos. El contador representa cuentas propietarias: la deduplicación de negocios con varias cuentas sigue pendiente.

## Limpieza de archivos

Eliminar una campaña crea dos tareas duraderas, una por cada bucket. El borrado de la campaña no se deshace si falla Storage. Cada tarea utiliza una concesión temporal de cinco minutos; un fallo se reintenta tras 15 minutos. Las operaciones de Storage son idempotentes, están acotadas al prefijo exacto del propietario/campaña y admiten carpetas y más de 100 archivos. No se reutilizan identificadores de campañas borradas. Las tareas completadas conservan una marca de borrado que deberá respetarse al restaurar copias.

`POST /api/operator/maintenance`, cuerpo `{"action":"storage_cleanup"}`, procesa una tarea. Requiere sesión de operador, mismo origen y `INNOVA_MAINTENANCE_ENABLED=true`. La clave de servicio solo se usa en servidor. No se ha configurado todavía el ejecutor periódico ni habilitado este endpoint. No borrar filas de `storage.objects` mediante SQL: la limpieza pasa por la API de Storage.

## Publicación programada

Base de datos y API preparadas. `POST /api/publication-schedule` requiere sesión, mismo origen, `confirmed:true`, campaña propia, versión pública, dirección, fecha con offset explícito y zona IANA. Guarda una copia puntual y sustituye la programación anterior. Consultar y cancelar no exige que siga activo el plan. Programar requiere PRO/BUSINESS; una compra puntual no lo concede.

`POST /api/operator/maintenance`, cuerpo `{"action":"scheduled_publication"}`, ejecuta como máximo una publicación vencida. Revalida el plan y capacidad, sin sustituir campañas. Publicar manualmente cancela la programación. El borrado la elimina. La ejecución escribe el resultado y un aviso pendiente una sola vez. Una incidencia técnica admite la ejecución inicial más tres reintentos, separados por cinco minutos y dentro de un máximo de 15 minutos desde la fecha prevista. Permisos, capacidad, dirección o datos inválidos requieren revisión. Una tarea atrasada más de 15 minutos falla; no publica horas después.

Antes de activar `INNOVA_SCHEDULING_ENABLED`: completar botón y vista previa, conversión de hora local y cambios de horario, preparación de imágenes duraderas correspondientes a la versión confirmada, ejecutor periódico y envío de avisos. La API sanea el contenido y excluye URLs firmadas, pero todavía no prepara por sí sola los archivos de un borrador. No anunciar la función como disponible aún.

## Verificación y despliegue

26 suites locales con migraciones SQL y rutas reales sobre una base de pruebas; TypeScript y compilación Next.js. No equivalen a una prueba de concurrencia distribuida ni al recorrido autenticado en producción. Revisar las migraciones sobre una copia autorizada, permisos del rol de ejecución, asesores de seguridad, precios configurados de la pasarela sandbox y restauración de copias. Aplicar los cambios en orden; no activar trabajadores ni anunciar nuevas funciones antes de comprobar cada recorrido. Supabase continúa en su plan actual.

Asesores de seguridad consultados en producción, solo lectura, el 19/10: 35 avisos informativos de RLS sin políticas, cuatro avisos sobre acceso público/autenticado a las dos funciones de página y QR, y protección contra contraseñas filtradas desactivada. Esta consulta describe la base desplegada, no valida las nuevas migraciones locales. El acceso público a página/QR es intencionado; revisar su alcance y saneamiento, no revocarlo indiscriminadamente. Referencias: [RLS sin políticas](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy), [función pública](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), [función autenticada](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable), [contraseñas filtradas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). No se ha cambiado la configuración de Auth.
