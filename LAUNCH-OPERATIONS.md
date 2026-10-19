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

28 suites locales con migraciones SQL y rutas reales sobre una base de pruebas; TypeScript y compilación Next.js. No equivalen a una prueba de concurrencia distribuida ni al recorrido autenticado en producción. Revisar las migraciones sobre una copia autorizada, permisos del rol de ejecución, asesores de seguridad, precios configurados de la pasarela sandbox y restauración de copias. Aplicar los cambios en orden; no activar trabajadores ni anunciar nuevas funciones antes de comprobar cada recorrido. Supabase continúa en su plan actual.

## Contactos, conservación y preparación de correos

`INNOVA_CONTACTS_ENABLED=false` conserva el formulario inactivo. Antes de habilitarlo: comprobar información de privacidad y responsable del negocio, recorrido completo, abuso y capacidad, exportación, borrado y trabajos periódicos. Hay límite técnico de 20 intentos nuevos por minuto y campaña, sin almacenar IP; no equivale a una protección completa contra spam distribuido. El formulario informa de errores y capacidad agotada sin fingir un guardado; los botones de contacto existentes siguen como alternativa.

La prueba de campaña utiliza la capacidad PRO mientras está vigente. La compra convierte las consultas existentes de esa campaña a su capacidad independiente: si supera 100, no se borran por exceso, pero se bloquean nuevas entradas hasta liberar espacio. La contratación sin interrupción conserva el servicio de las consultas existentes hasta su máximo original de 12 meses; una vuelta después de perder el servicio no reinicia los plazos anteriores. Comprar después de esa pérdida tampoco reinicia esas caducidades.

`/contacts` ofrece lectura, exportación CSV y borrado privado; la variante `?campaign=<uuid>` permite exportar/borrar las consultas de una campaña antes de eliminarla. La base de datos impide eliminar una campaña mientras conserve consultas. El CSV neutraliza fórmulas y no se genera una descarga parcial si falla una página. Se descartan respuestas pendientes cuando cambia la sesión.

`POST /api/operator/maintenance` con `{"action":"retention"}` procesa un lote: purga consultas vencidas, detecta campañas antes publicadas que han perdido visibilidad y prepara avisos de archivo. El plazo de archivo comienza al detectar esa pérdida; no se retrocede una fecha histórica desconocida. Borradores, web FREE vigente y campañas compradas no se caducan automáticamente. No se borra una campaña archivada sin constancia de los dos avisos y los periodos completos desde su envío. Mientras no exista entrega de correo verificada, las marcas `sent_at` permanecen vacías.

Antes de restaurar una copia, conservar fuera de esa restauración el registro reciente `private.innova_contact_deletions` y las marcas de campañas borradas de `private.innova_storage_cleanup`; reimportarlos antes de permitir accesos. Las lecturas de contactos ocultan filas marcadas y la purga reaplica esos borrados. La rotación efectiva máxima de 30 días de las copias, el registro externo y la prueba real de restauración siguen pendientes. No se ha implementado todavía el cierre completo de cuenta con separación de documentos sujetos a conservación legal.

`/api/email-preferences` guarda el modo inmediato, diario a las 09:00 locales o desactivado para consultas. `prepare_contact_emails` crea trabajos sin datos personales del mensaje; agrupa, deduplica y mantiene esenciales aparte. Este preparador no envía, no comprueba por sí solo entrega y no habilita gasto. El transporte futuro debe verificar destinatario y dominio, revalidar cada aviso (incluidos los que queden sin fuente), aplicar el límite gratis de 100/día y 3.000/mes, controlar reintentos/entrega y avisar al 80/90 %. La preparación no acredita envío ni consume cuota del proveedor. Un cambio de preferencia reprograma o cancela trabajos pendientes; no recupera avisos previamente descartados.

Asesores de seguridad consultados en producción, solo lectura, el 19/10: 35 avisos informativos de RLS sin políticas, cuatro avisos sobre acceso público/autenticado a las dos funciones de página y QR, y protección contra contraseñas filtradas desactivada. Esta consulta describe la base desplegada, no valida las nuevas migraciones locales. El acceso público a página/QR es intencionado; revisar su alcance y saneamiento, no revocarlo indiscriminadamente. Referencias: [RLS sin políticas](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy), [función pública](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), [función autenticada](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable), [contraseñas filtradas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). No se ha cambiado la configuración de Auth.
