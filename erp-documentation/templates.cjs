// Versioned full texts. Personal provider details are substituted only when loading into the private ERP.
const provider='{{PRESTADOR_NOMBRE}}, que opera bajo la marca INNOVANDESIGN, NIF {{NIF_PRESTADOR_VERIFICADO}}, domicilio {{PRESTADOR_DOMICILIO}}, correo conta@innovandesign.com';
const client='{{CLIENTE_NOMBRE}}, NIF {{CLIENTE_NIF}}, domicilio {{CLIENTE_DOMICILIO}}, representado por {{REPRESENTANTE_Y_CAPACIDAD}}, correo de notificaciones {{CLIENTE_EMAIL}}';
const header=(name)=>`${name}\nVersión 1.0 · 10 de octubre de 2026\nExpediente {{EXPEDIENTE}} · Fecha {{FECHA}}\n\n`;
const parties=`PRESTADOR\n${provider}.\n\nCLIENTE PROFESIONAL\n${client}.\n\n`;
const records=[];
function add(id,title,category,body){records.push({id,title,category,content:header(title)+body});}
add('contrato','01 · Contrato de servicio · Escaparates digitales','legal',parties+`1. ACUERDO Y DOCUMENTOS INTEGRANTES
El cliente contrata el servicio para su actividad empresarial o profesional y declara que su representante dispone de facultades suficientes. Este contrato y la hoja de pedido del expediente indicado establecen el alcance y el precio. Se incorporan los anexos de créditos, privacidad y, cuando proceda, tratamiento de datos y dominio que se identifiquen en la hoja de pedido. Una propuesta verbal o una demostración no amplía por sí sola lo contratado. Cualquier modificación se recogerá por escrito antes de aplicarla. Este modelo no está destinado a contratación de consumidores.

2. SERVICIO CONTRATADO
El servicio consiste en preparar, alojar y permitir la gestión de una presencia digital del negocio accesible mediante enlace y QR, con campañas, datos de contacto y funciones del plan elegido. Una campaña activa es una campaña publicada y accesible; los borradores y contenidos bloqueados no amplían el número simultáneo permitido. Free admite una activa, Pro cinco y Business diez. Cada contratación cubre el negocio y local identificados en el pedido; varias sucursales requieren una propuesta Enterprise específica.
Free ofrece contacto básico y totales de QR y clics. Pro incorpora servicios, oferta, horarios, mapa, redes y desglose por campaña y fechas. Business añade galería, navegación, animaciones, comparativas y exportación. Los clics reflejan interacciones registradas, no ventas, citas confirmadas ni personas únicas garantizadas. Las funciones opcionales de IA que aún no estén disponibles se identificarán expresamente en el pedido y no se anunciarán como entregadas.

3. CONTENIDOS Y APROBACIÓN
El cliente facilita nombre, fotografías, logo si dispone de él, servicios, oferta, teléfono, WhatsApp, dirección, horarios, correo y redes. Confirma su exactitud y los permisos de uso. Los datos sugeridos por IA o por búsqueda externa necesitan revisión del cliente. INNOVA no publicará como verificado un dato que no haya sido confirmado. El cliente aprobará el diseño y la información antes de publicar. Las regeneraciones proponen cambios; su aceptación y publicación son actos separados. El contenido aportado se conserva al regenerar el diseño, salvo modificaciones expresamente aceptadas. No se garantiza una cifra de ventas, visitas, posicionamiento o contactos.

4. PRECIO, IMPUESTOS Y PAGO
Tarifas ordinarias: Pro 20 euros al mes o 200 euros al año; Business 38 euros al mes o 380 euros al año, más IVA. La hoja de pedido fija base, impuesto, total, fechas y modalidad aplicable. Se admite transferencia, Bizum profesional o efectivo dentro del límite legal. Un recibo de efectivo no sustituye la factura. INNOVA entrega copia del contrato y la factura al correo designado. No se autoriza ningún adeudo automático ni se presume un TPV operativo por firmar este documento. Las recargas y servicios adicionales requieren importe conocido y aceptación previa.

5. OFERTA DE LANZAMIENTO
Los primeros 50 clientes anuales de pago que reciban confirmación escrita de elegibilidad pueden contratar Pro por 100 euros al año o Business por 190 euros al año, más IVA. Son precios anuales fijos de renovación mientras se mantenga la continuidad anual, no un porcentaje sobre futuras tarifas. Cambiar de Pro a Business o viceversa conserva el precio promocional correspondiente al nuevo plan si se mantiene dicha continuidad. Pasar a mensual, cancelar o dejar vencer el mes de gracia hace perder la promoción; una contratación posterior no la recupera. La reserva promocional y el número asignado figuran en el pedido. No se aplica esta oferta a Free, Enterprise ni a recargas.

6. DURACIÓN, RENOVACIÓN Y CAMBIOS
No existe permanencia adicional al mes o año pagado. Las fechas de inicio y fin constan en el pedido. La baja voluntaria puede solicitarse en cualquier momento y se hace efectiva al terminar el periodo abonado. La parte no consumida no se devuelve por una baja voluntaria anticipada, sin perjuicio de devoluciones debidas por incumplimiento o norma imperativa. La renovación exige el pago del periodo siguiente; INNOVA comunica su importe y vencimiento.
La subida de plan se calcula por la diferencia de tarifa proporcional a los días pendientes, mostrando antes el cálculo y su efecto. La bajada se aplica al finalizar el periodo de facturación. Al pasar de mensual a anual se descuenta el valor no consumido del mes y comienza un año nuevo en la fecha del cambio. Si se reduce el número de campañas activas, el cliente elige cuáles conserva dentro del nuevo límite. La promoción perdida por pasar a mensual no se restituye al volver a anual.

7. IMPAGO Y MES DE GRACIA
Si no se recibe la renovación en su vencimiento y no hay baja voluntaria, se concede un mes de gracia. Durante ese mes se mantienen las publicaciones del plan, se asignan los créditos periódicos pactados y puede utilizarse el saldo disponible; no se permite comprar recargas. Si se regulariza dentro de la gracia, el nuevo periodo se cuenta desde el vencimiento original. Al agotarse la gracia sin pago, la cuenta pasa a Free, el saldo queda congelado y se bloquean las funciones y campañas que excedan ese plan. La cancelación voluntaria no añade gratuitamente un mes al periodo pagado.

8. CRÉDITOS E INTELIGENCIA ARTIFICIAL
La generación inicial incluida no descuenta créditos. Las regeneraciones de pago muestran su coste antes de ejecutarse. El saldo, las unidades de consumo, recargas y controles de uso se detallan en el anexo de créditos del expediente. Los fallos técnicos no consumen definitivamente créditos; una propuesta válida generada puede consumirlos aunque después se descarte. La edición manual y reactivar sin ejecutar IA cuestan cero. No se enviarán a modelos datos sensibles ni materiales de terceros innecesarios. Las herramientas gratuitas dependen de la disponibilidad declarada en el pedido y no tienen una garantía de capacidad infinita.

9. PRIMERA ENTREGA Y SOPORTE
Los planes de pago incluyen dos rondas de revisión inicial y un cartel de hasta A3, papel de 90 gramos, acabado brillo o mate, también al contratar un solo mes. La entrega inicial se realiza en mano. El plazo de entrega física es de 24–48 horas laborables desde que concurran pago recibido, diseño de cartel generado y campaña activa; cuentan de lunes a viernes, excluidos festivos aplicables en Benidorm. Los retrasos por información o aprobación pendiente del cliente desplazan la fecha, que se comunicará. Transporte posterior, nuevas impresiones y trabajos fuera de alcance requieren presupuesto.
Soporte por teléfono y WhatsApp, de lunes a viernes de 09:00 a 20:00, hora peninsular española. El objetivo de primera respuesta es una hora dentro de ese horario; no equivale a resolución garantizada. Javi atiende la entrega técnica y Andrey coordina su sustitución. Los avisos contractuales se remiten a conta@innovandesign.com y al correo del cliente indicado arriba.

10. DOMINIO Y DERECHOS
Business incluye un dominio .com o .es disponible, con renovación durante la continuidad del plan. El anexo identifica titular, registrador, fechas y condiciones de salida. Si cancela Business mensual, el cliente conserva el dominio hasta el vencimiento del registro ya pagado sin cargo añadido por ese periodo. No se incluye correo corporativo ni transferencia a un tercero salvo indicación expresa. El cliente mantiene los derechos sobre sus materiales; autoriza a INNOVA a usarlos para prestar el servicio. Los componentes y licencias de terceros conservan sus condiciones. INNOVA no adquiere permiso para publicidad o casos de éxito mediante esta cláusula.

11. CONTENIDO TRAS LA BAJA
Las campañas bloqueadas se conservan para recuperación durante tres años desde el paso a Free por fin del servicio de pago, salvo supresión solicitada que proceda legalmente. El cliente puede pedir copia de los contenidos propios antes de la eliminación. Transcurrido ese plazo podrán eliminarse los contenidos recuperables previa comunicación al correo de la cuenta. El saldo congelado se recupera si vuelve a contratar durante la conservación de la cuenta; no es dinero electrónico, no produce intereses ni se canjea por efectivo. Contratos, facturas y pruebas de operaciones siguen sus plazos legales independientes. La conservación comercial no elimina derechos de protección de datos.

12. SEGURIDAD, INCIDENCIAS Y RESPONSABILIDAD
Cada parte responde de sus obligaciones y de los daños que le sean imputables conforme a la ley. INNOVA mantiene controles de acceso, separación de cuentas y registro de operaciones; comunicará las incidencias relevantes y aplicará medidas razonables de recuperación. El cliente custodiará sus credenciales y notificará accesos indebidos. Una indisponibilidad de un tercero no exonera automáticamente a INNOVA de sus propias obligaciones. No se excluye responsabilidad por dolo ni la que legalmente no pueda limitarse. Ante un incumplimiento relevante, la parte afectada podrá solicitar subsanación y ejercer los remedios legales correspondientes.

13. PRIVACIDAD Y RECLAMACIONES
La información de privacidad y el encargo de tratamiento cuando proceda se incorporan al expediente. No se exige consentimiento publicitario para contratar. Las reclamaciones pueden dirigirse a conta@innovandesign.com identificando el expediente; INNOVA acusará recibo y comunicará una respuesta motivada. Rige el derecho español y las normas europeas aplicables. Las controversias se someten a los órganos judiciales competentes según las reglas legales, sin renuncia general a fueros imperativos.

14. CONFORMIDAD Y FIRMA
El firmante declara que ha podido leer este texto y los anexos identificados en el pedido, que los datos y facultades de representación son correctos y que acepta el alcance y precio allí recogidos. Recibe o puede descargar una copia íntegra de la versión firmada. La marca manuscrita se vincula a esa versión, fecha e identidad declarada; no se presenta como firma cualificada. La firma corresponde a {{PARTE_QUE_FIRMA}}. La aceptación de la otra parte consta en {{EVIDENCIA_ACEPTACION_OTRA_PARTE}}. No debe consignarse una aceptación ajena que no exista.`);
add('pedido','02 · Hoja de pedido y condiciones particulares','servicios',parties+`1. IDENTIFICACIÓN DEL ENCARGO
Negocio y local: {{NEGOCIO_Y_LOCAL}}. Persona de contacto: {{CONTACTO_NEGOCIO}}. Plan: {{PLAN}}. Modalidad: {{MENSUAL_O_ANUAL}}. Inicio: {{FECHA_INICIO}}. Fin del periodo pagado: {{FECHA_FIN}}. Contrato y anexos aplicables: {{REFERENCIAS_Y_VERSIONES_ANEXOS}}. Esta hoja concreta el contrato y no autoriza servicios no descritos.

2. PRECIO CERRADO
Base del periodo: {{BASE_EUROS}} euros. IVA: {{TIPO_IVA}} %, cuota {{CUOTA_IVA_EUROS}} euros. Total: {{TOTAL_EUROS}} euros. Forma de pago: {{MEDIO_PAGO}}. Fecha límite: {{VENCIMIENTO_PAGO}}. Estado y justificante: {{ESTADO_Y_REFERENCIA_PAGO}}. La firma del pedido no acredita por sí sola que se haya cobrado. La factura se remitirá al correo del cliente.
Promoción: {{PROMOCION_APLICABLE_O_NO}}. Número de plaza de lanzamiento, si procede: {{PLAZA_PROMOCIONAL_O_NO_APLICA}}. Renovación pactada, IVA aparte: {{PRECIO_Y_MODALIDAD_RENOVACION}}. Solo se identifica como promoción confirmada cuando INNOVA ha verificado la plaza y el pago anual.

3. CONFIGURACIÓN Y PRESTACIONES
Campañas activas simultáneas: {{LIMITE_CAMPANAS}}. Funciones entregadas: {{FUNCIONES_INCLUIDAS}}. Asignación y tarifa IA: anexo de créditos indicado arriba. Funciones IA gratuitas disponibles en esta entrega: {{IA_GRATUITA_DISPONIBLE_O_NO_ACTIVA}}. No se incluye una función experimental como disponible por aparecer en una demostración.
Dominio: {{DOMINIO_O_NO_APLICA}}. Registro y salida: anexo de dominio cuando corresponda. Idioma y datos de contacto aprobados: {{IDIOMA_Y_CONTACTOS}}. Materiales recibidos: {{MATERIALES_ENTREGADOS}}. Trabajos adicionales aceptados: {{EXTRAS_O_NINGUNO}}.

4. ENTREGA
Cartel incluido: una unidad hasta A3, papel 90 g; formato elegido {{FORMATO_CARTEL}}, acabado {{ACABADO_CARTEL}}. Se incluyen dos rondas de revisión inicial. Lugar de entrega: {{LUGAR_ENTREGA}}. Fecha prevista: {{FECHA_ENTREGA}}. El plazo de 24–48 horas laborables comienza con pago recibido, cartel generado y campaña activa. Las condiciones de soporte y baja son las del contrato.

5. CONFORMIDAD
El cliente confirma esta hoja, sus importes y referencias documentales tras revisarlos. Los huecos que no correspondan deben indicarse como «No aplica», nunca dejarse abiertos. Cualquier divergencia con el contrato debe corregirse expresamente antes de firmar. Parte firmante: {{PARTE_QUE_FIRMA}}. Aceptación de la otra parte documentada en {{EVIDENCIA_ACEPTACION_OTRA_PARTE}}.`);
add('creditos','03 · Anexo de créditos y regeneraciones IA','servicios',parties+`1. UNIDADES Y ALCANCE
Los créditos son unidades de uso dentro de INNOVA, distintas de los tokens internos facturados por un proveedor. No representan dinero depositado. El límite de campañas activas y el saldo de créditos son controles separados. Plan de este expediente: {{PLAN}}. Fecha de anclaje mensual: {{FECHA_ANCLAJE}}.

2. GENERACIÓN INICIAL Y EDICIÓN
La primera generación incluida de una campaña no descuenta créditos. Como protección de gasto, la configuración de lanzamiento incluye una generación inicial en Free, hasta cinco por periodo mensual de contratación en Pro y diez en Business. Agotar ese control no convierte una generación inicial en un cargo automático: se informa de la indisponibilidad y puede continuarse manualmente. Esta condición se explica antes de contratar y cualquier excepción queda por escrito. Reactivar una campaña sin ejecutar IA, sustituir materiales o editar manualmente cuesta cero créditos.

3. SALDO Y TARIFAS
Free recibe cero créditos periódicos. Pro y Business reciben 1.000 créditos cada mes desde la fecha de contratación y acumulan lo no consumido. En Pro, regenerar diseño y marketing conjuntamente cuesta 200 créditos; cada regeneración individual de diseño, marketing o análisis de fachada cuesta 100. En Business, el conjunto cuesta 100 y cada operación individual 50. Enterprise se rige por {{CONDICIONES_ENTERPRISE_O_NO_APLICA}}. El coste se muestra antes de confirmar la operación; si cambia respecto del mostrado, debe pedirse nueva confirmación.

4. RESULTADOS Y ERRORES
Solo se consume definitivamente por una operación completada. Un error técnico, respuesta inválida o fallo de generación devuelve la reserva correspondiente. Una propuesta válida puede consumir créditos aunque no se aplique. El usuario conserva la decisión de aceptar y publicar. La regeneración de diseño preserva el contenido aportado y modifica presentación, disposición o estilos; un cambio de contenido requiere aceptación. Las solicitudes repetidas con la misma referencia no deben duplicar el cargo. Las incidencias se comunican indicando fecha y operación para cotejarlas con el historial.

5. RECARGAS Y FIN DEL SERVICIO
Paquetes iniciales, más IVA: 200 créditos por 5 euros; 600 por 12 euros; 1.400 por 25 euros. Se activan después de verificar el pago; no se recarga por el mero clic de solicitud. Durante el mes de gracia se acumula y utiliza el saldo conforme al contrato, pero no pueden comprarse recargas. Al pasar a Free tras una baja, el saldo queda congelado y se recupera al contratar de nuevo dentro del periodo de conservación. No se transfiere entre cuentas ni se canjea por efectivo, sin perjuicio de una devolución legalmente debida.

6. HERRAMIENTAS GRATUITAS Y DISPONIBILIDAD
Disponibilidad de texto, imágenes y logo en esta entrega: {{ESTADO_HERRAMIENTAS_GRATUITAS}}. Las operaciones gratuitas no descuentan créditos ni pasan automáticamente a un proveedor de pago. Pueden existir colas, límites de frecuencia o indisponibilidad del proveedor, que se informarán. No se contratará como incluida una herramienta todavía desactivada. La retirada de fondo o generación de logo debe identificarse por operación; no se presume habilitada por existir generación de imágenes.

7. ACEPTACIÓN
El cliente reconoce la diferencia entre creación, regeneración y publicación y acepta esta tarifa concreta. Las nuevas condiciones se comunicarán antes de aplicarse; no se cambia retroactivamente el precio de una operación ya confirmada. Condiciones particulares adicionales: {{EXCEPCIONES_O_NINGUNA}}.`);
add('privacidad','04 · Información de privacidad del cliente','legal',`RESPONSABLE Y CONTACTO
Responsable de la gestión comercial, contractual y de cuenta: ${provider}. Interesado y expediente: ${client}. Contacto para derechos y privacidad: conta@innovandesign.com.

1. INFORMACIÓN QUE SE TRATA
Datos de identificación profesional y representación, contacto, facturación y pagos, cuenta y soporte; materiales enviados por el cliente; versión y evidencia de aceptación de los documentos; registros técnicos necesarios para la prestación. La firma se almacena como imagen vinculada al documento. Este sistema no realiza reconocimiento biométrico ni identifica personas mediante el análisis automatizado del trazo. No se solicitan categorías especiales de datos para prestar el servicio.

2. FINALIDADES Y BASES
Las solicitudes y preparación del servicio se atienden para gestionar la relación precontractual; el alta, alojamiento, soporte y entrega ejecutan el contrato. La facturación y la atención de obligaciones administrativas responden a deberes legales. La conservación de pruebas para defender reclamaciones y la seguridad se basan, cuando proceda, en intereses legítimos ponderados y sujetos a oposición. Las comunicaciones promocionales y casos de éxito que requieran consentimiento se solicitan separadamente y pueden rechazarse sin impedir el servicio.

3. DESTINATARIOS
Acceden los responsables autorizados de INNOVA y los proveedores necesarios de alojamiento, base de datos, autenticación, correo, impresión y, cuando esté activada, IA. Se limita a cada uno la información que necesita. También pueden acceder asesoría y autoridades cuando exista fundamento legal. Relación concreta y garantías aplicables a este expediente: {{PROVEEDORES_REGIONES_Y_GARANTIAS}}. La infraestructura prevista incluye Vercel, Supabase y Hostinger; una región de alojamiento no demuestra por sí sola que no existan accesos o transferencias internacionales. Los mecanismos aplicables deben figurar en la relación antes de enviar datos a un nuevo proveedor.

4. CONSERVACIÓN
La cuenta y el contenido se conservan durante la prestación. El contenido bloqueado recuperable tiene el plazo comercial de tres años desde la finalización del plan de pago, salvo supresión que proceda. Los documentos contractuales y de pago se conservarán durante las obligaciones legales y plazos de reclamación aplicables, con acceso restringido cuando corresponda. Los registros técnicos seguirán el calendario informado en {{CALENDARIO_REGISTROS_Y_COPIAS}}. La desaparición de una campaña no implica borrar una factura sujeta a conservación legal.

5. DERECHOS
Puede solicitar acceso, rectificación, supresión, limitación, oposición y portabilidad cuando correspondan escribiendo al contacto indicado. Se pedirá únicamente la información necesaria para acreditar identidad. Si un tratamiento depende del consentimiento, puede retirarlo para el futuro. Puede reclamar ante la Agencia Española de Protección de Datos, www.aepd.es. Si no facilita los datos necesarios para contratar, facturar o entregar, no podrá completarse esa operación; los datos opcionales se identifican como tales.

6. PUBLICACIÓN E IA
El cliente decide qué datos de su negocio publica. Debe evitar fotografías de terceros o datos sensibles innecesarios. La analítica mide interacciones y no constituye una decisión automatizada con efectos jurídicos sobre el cliente. No se utiliza una aceptación de esta información como autorización general de publicidad ni de cesión de imágenes.

CONSTANCIA DE ENTREGA
La firma acredita que se ha recibido y podido leer esta información, no un consentimiento indiscriminado a tratamientos adicionales. Solicitudes o aclaraciones del interesado: {{ACLARACIONES_O_NINGUNA}}.`);
add('encargo','05 · Acuerdo de encargo de tratamiento','legal',`RESPONSABLE DEL TRATAMIENTO
${client}.

ENCARGADO DEL TRATAMIENTO
${provider}.

1. SERVICIO Y DURACIÓN
El encargo se limita a la presencia digital contratada en este expediente y dura mientras se presten las operaciones descritas, seguido de su devolución o supresión. El cliente determina la finalidad; INNOVA ejecuta las instrucciones documentadas. INNOVA actúa por cuenta propia respecto de su facturación y administración contractual, fuera de este encargo.

2. INVENTARIO DEL ENCARGO
Operaciones autorizadas: {{OPERACIONES_DATOS}}. Finalidad concreta: {{FINALIDAD_DATOS}}. Categorías de personas: {{PERSONAS_AFECTADAS}}. Tipos de datos: {{TIPOS_DATOS}}. Sistemas y localizaciones: {{SISTEMAS_Y_LOCALIZACIONES}}. No se incorporan datos de salud, menores u otras categorías especiales sin acuerdo específico y evaluación previa. Contacto de privacidad del responsable: {{CONTACTO_PRIVACIDAD_CLIENTE}}.

3. INSTRUCCIONES Y CONFIDENCIALIDAD
INNOVA no vende los datos ni los utiliza para publicidad o entrenamiento propio. Limita el acceso a personas autorizadas con compromiso de confidencialidad. Informará si considera que una instrucción infringe la normativa y suspenderá esa instrucción hasta aclararla. Las comunicaciones impuestas legalmente se comunicarán al responsable cuando la ley lo permita.

4. SEGURIDAD Y ASISTENCIA
Se aplicarán autenticación, permisos por función, separación de cuentas, cifrado de comunicaciones, registro de operaciones y recuperación documentada, con el alcance concreto del inventario técnico adjunto: {{MEDIDAS_Y_RECUPERACION_VERIFICADAS}}. No se afirma una certificación ni copia de seguridad no verificada. INNOVA ayudará razonablemente a atender derechos, evaluaciones de impacto y consultas de autoridades. Si recibe una solicitud sobre datos del cliente, la trasladará sin resolverla por su cuenta salvo instrucción.

5. INCIDENTES
INNOVA notificará al responsable sin dilación indebida desde que conozca una violación de seguridad que afecte a estos datos. Indicará lo conocido sobre hechos, categorías, posibles consecuencias, medidas adoptadas y contacto de seguimiento, completándolo conforme avance la investigación. Este aviso permite al responsable evaluar sus obligaciones; no se garantiza que toda incidencia tenga información completa en el primer mensaje.

6. SUBENCARGADOS Y TRANSFERENCIAS
Se autorizan únicamente los proveedores identificados en {{LISTA_SUBENCARGADOS_Y_GARANTIAS}} para las funciones allí descritas, sujetos a obligaciones equivalentes. INNOVA avisará de altas o sustituciones con 15 días de antelación para que el cliente pueda oponerse por motivos de protección de datos y se busque una alternativa. Si no existe alternativa adecuada, las partes acordarán el cese de la función afectada sin imponer una transferencia no autorizada. Los accesos desde fuera del EEE deben constar con su fundamento y garantías; el nombre de una región europea no sustituye esta comprobación.

7. FINALIZACIÓN Y EVIDENCIAS
El responsable elige {{DEVOLUCION_O_SUPRESION}} al terminar. INNOVA aplicará esa elección y eliminará las copias salvo conservación legal, comunicando el alcance y calendario {{PLAZO_CIERRE_Y_COPIAS}}. Los contenidos que el cliente solicite conservar bloqueados durante tres años siguen sujetos a estas instrucciones y derechos. INNOVA facilitará información para demostrar el cumplimiento y colaborará en verificaciones proporcionadas, con protección de datos de otros clientes y secretos ajenos. Las auditorías se coordinarán con preaviso razonable salvo urgencia acreditada.

8. ACEPTACIÓN
Las partes confirman el inventario y las instrucciones anteriores. Parte firmante: {{PARTE_QUE_FIRMA}}; aceptación de la otra parte: {{EVIDENCIA_ACEPTACION_OTRA_PARTE}}. Los cambios del encargo requieren constancia escrita.`);
add('materiales','06 · Autorización de materiales y publicación','clientes',parties+`1. MATERIALES ENTREGADOS
El cliente entrega para este expediente los archivos o referencias {{LISTADO_MATERIALES}}. Identifica como titulares de sus derechos a {{TITULARES_Y_LICENCIAS}} y declara que puede autorizar su uso en el alcance descrito. Si hay personas identificables, marcas ajenas o espacios sujetos a permiso, aporta {{PERMISOS_DE_TERCEROS_O_NO_APLICA}}. No se presume que una fotografía encontrada en internet sea de libre uso.

2. AUTORIZACIÓN NECESARIA PARA EL SERVICIO
El cliente autoriza a INNOVA a almacenar, adaptar a tamaños, maquetar e incorporar esos materiales a su escaparate, QR, cartel y canales contratados, durante la prestación y la conservación acordada. No se transmite la titularidad. INNOVA debe respetar las restricciones de licencia notificadas y no puede reutilizar los materiales para otros clientes. El cliente revisará los cambios sustanciales antes de publicar. Si aparece una reclamación fundada, se coordinará la retirada o sustitución sin impedir los derechos de terceros.

3. CONTENIDO APROBADO
Versión, enlace o archivo revisado: {{VERSION_CONTENIDO}}. Datos de contacto y oferta confirmados: {{DATOS_APROBADOS}}. Restricciones de publicación: {{RESTRICCIONES_O_NINGUNA}}. La firma autoriza publicar únicamente esa versión y los ajustes técnicos que no alteren su significado. Un cambio de precio, promesa o imagen requiere nueva aprobación.

4. USO PUBLICITARIO OPCIONAL, SEPARADO
Decisión del cliente sobre uso como caso de éxito: {{AUTORIZA_O_NO_AUTORIZA_CASO_EXITO}}. Si autoriza, canales concretos {{CANALES_CASO_EXITO_O_NO_APLICA}}, materiales {{MATERIALES_CASO_EXITO_O_NO_APLICA}} y duración {{DURACION_CASO_EXITO_O_NO_APLICA}}. Si no autoriza, el servicio se presta igualmente. Puede retirar para el futuro un consentimiento aplicable escribiendo a conta@innovandesign.com; se retirarán los usos controlados por INNOVA que procedan, sin presentar como reversible una distribución física ya realizada. Esta elección no autoriza mensajes comerciales al cliente ni a sus contactos.

5. CONFORMIDAD
El firmante confirma los permisos y la versión indicada, mantiene sus derechos y puede comunicar errores o solicitudes de retirada por el canal contractual. Observaciones: {{OBSERVACIONES_O_NINGUNA}}.`);
add('dominio','07 · Anexo de dominio Business','servicios',parties+`1. IDENTIFICACIÓN
Dominio solicitado: {{DOMINIO}}. Extensión: {{EXTENSION_COM_O_ES}}. Titular registral que se verificará en el alta: {{TITULAR_DOMINIO}}. Registrador: {{REGISTRADOR}}. Contacto de administración: {{CONTACTO_DOMINIO}}. Fecha de registro o renovación: {{FECHA_REGISTRO}}. Vencimiento pagado: {{VENCIMIENTO_DOMINIO}}. El alta depende de disponibilidad y requisitos del registrador; no se garantiza un nombre hasta confirmación.

2. ALCANCE INCLUIDO
El plan Business incluye un dominio .com o .es y su renovación ordinaria mientras se mantenga el plan conforme a lo contratado. Incluye su conexión al escaparate. Servicios de correo, dominios premium, compras a terceros y extensiones distintas no se incluyen sin presupuesto expreso. Servicios adicionales acordados: {{ADICIONALES_DOMINIO_O_NINGUNO}}. El titular aporta datos correctos y responde a verificaciones del registrador.

3. GESTIÓN Y CONTROL
INNOVA gestiona únicamente los cambios necesarios para prestar el servicio y documenta registrador, titular, vencimiento y acceso de recuperación. El cliente conserva el derecho a solicitar información y transferencia del dominio del que sea titular. Nunca se publican contraseñas ni códigos de transferencia en este documento; se entregan por canal seguro tras verificar al solicitante. La aceptación del registro y sus condiciones se acredita en {{EVIDENCIA_REGISTRO}}.

4. BAJA Y TRASLADO
Si Business mensual termina después de un mes, el dominio permanece registrado hasta el vencimiento ya pagado, sin cargo adicional por ese periodo. Eso no prolonga las funciones Business del escaparate. Sin renovación del plan no se presume una renovación futura del dominio: INNOVA comunicará vencimiento y alternativas al contacto indicado. El cliente podrá transferirlo o renovar por su cuenta. Los costes de un nuevo registrador se aceptan con él. Las restricciones temporales de transferencia del registro se informarán, no se utilizarán para retener el dominio indebidamente.

5. CONFORMIDAD
El cliente confirma titularidad, fechas y alcance. Instrucción al finalizar el servicio: {{INSTRUCCION_SALIDA_DOMINIO}}. La firma no acredita un registro que todavía no se haya confirmado; su estado real es {{ESTADO_REGISTRO}}.`);
add('diseno','08 · Conformidad de diseño antes de publicar','clientes',parties+`1. VERSIÓN SOMETIDA A APROBACIÓN
Campaña: {{CAMPANA}}. Enlace de revisión: {{ENLACE_REVISION}}. Versión o referencia de archivos: {{VERSION_ARCHIVOS}}. Fecha de presentación: {{FECHA_PRESENTACION}}. Ronda de revisión: {{RONDA_REVISION}} de las dos iniciales incluidas. Las versiones anteriores quedan sustituidas únicamente para el diseño de esta entrega.

2. COMPROBACIÓN DEL CLIENTE
El cliente ha revisado nombre, logotipo, imágenes, servicios, precios, oferta y sus fechas, teléfono, WhatsApp, dirección, horarios, correo y redes. Resultado y correcciones solicitadas: {{RESULTADO_REVISION_DATOS}}. Se ha revisado el texto propuesto por IA y no se trata una sugerencia automática como un hecho confirmado. Las imágenes y materiales cuentan con las autorizaciones del expediente.

3. DECISIÓN
Decisión expresa: {{APROBADO_O_REQUIERE_CAMBIOS}}. Cambios o reservas: {{CAMBIOS_O_NINGUNO}}. Si exige cambios, esta firma registra las observaciones y no autoriza publicar hasta recibir conformidad sobre la nueva versión. Si aprueba, autoriza publicar la versión identificada y preparar el cartel correspondiente. No autoriza alterar precios u ofertas después de la firma sin nueva validación.

4. CARTEL Y QR
Archivo de cartel: {{ARCHIVO_CARTEL}}. Formato y acabado: {{FORMATO_Y_ACABADO}}. Destino previsto del QR: {{DESTINO_QR}}. Esta conformidad visual no sustituye la prueba física de impresión y escaneo, que se documenta en la entrega. Nuevas impresiones por cambios posteriores a una impresión aprobada se presupuestarán, salvo error imputable al prestador.

5. ACEPTACIÓN
La aprobación se limita al contenido y diseño indicado y no certifica resultados comerciales. Persona que revisa: {{PERSONA_REVISA}}. Próxima actuación y fecha: {{SIGUIENTE_ACTUACION}}.`);
add('entrega','09 · Acta de entrega y recepción','clientes',parties+`1. ELEMENTOS ENTREGADOS
Plan y campaña: {{PLAN_Y_CAMPANA}}. Página publicada: {{URL_PUBLICA}}. URL impresa en QR: {{URL_QR}}. Cartel: {{CARTEL_FORMATO_ACABADO}}. Lugar y fecha de entrega: {{LUGAR_Y_FECHA_ENTREGA}}. Responsable de INNOVA: {{RESPONSABLE_ENTREGA}}.

2. COMPROBACIONES REALES
Página abierta en móvil y ordenador: {{RESULTADO_PAGINA}}. QR físico escaneado desde otro móvil: {{RESULTADO_QR_FISICO}}. Teléfono, WhatsApp, correo, dirección y redes: {{RESULTADO_CONTACTOS}}. Oferta, precios y horarios: {{RESULTADO_DATOS}}. Si una prueba no se ha realizado, debe registrarse «No realizada» y no presentarla como superada. La firma no transforma una comprobación pendiente en un resultado positivo.

3. ACCESO Y FORMACIÓN
Acceso del cliente entregado por canal seguro: {{ESTADO_ACCESO}}. Se ha explicado cómo editar, guardar, publicar, cambiar campaña, consultar saldo y distinguir propuesta de IA de publicación: {{RESULTADO_FORMACION}}. No se escriben contraseñas en el acta. Documentación entregada: {{DOCUMENTOS_ENTREGADOS}}. Estado de factura y recibo: {{ESTADO_FACTURA_RECIBO}}.

4. RECEPCIÓN Y RESERVAS
Recepción: {{CONFORME_O_CON_RESERVAS}}. Incidencias y elementos pendientes: {{INCIDENCIAS_O_NINGUNA}}. Responsable y fecha de subsanación: {{RESPONSABLE_Y_FECHA_SUBSANACION_O_NO_APLICA}}. El cliente conserva sus derechos frente a errores o incumplimientos; recibir el cartel o firmar el acta no supone una renuncia general.

5. SOPORTE
Contacto contractual: conta@innovandesign.com. Atención operativa por teléfono y WhatsApp de lunes a viernes de 09:00 a 20:00; objetivo de primera respuesta una hora dentro de horario. La resolución depende del caso. El cliente confirma la recepción en los términos y con las reservas expresadas.`);
add('recibo','10 · Recibo de pago','facturacion',`EMISOR
${provider}.

PAGADOR
${client}.

1. PAGO RECIBIDO
Recibo número {{NUMERO_RECIBO}}. Pedido o contrato {{REFERENCIA_PEDIDO}}. Concepto {{CONCEPTO_PAGO}}. Fecha efectiva de cobro {{FECHA_COBRO}}. Medio {{MEDIO_PAGO}}. Justificante o referencia {{REFERENCIA_PAGO}}. Importe recibido {{IMPORTE_RECIBIDO_EUROS}} euros.

2. DESGLOSE Y APLICACIÓN
Base de la operación {{BASE_EUROS}} euros. Tipo de IVA {{TIPO_IVA}} %. Cuota {{CUOTA_IVA_EUROS}} euros. Total {{TOTAL_EUROS}} euros. Pagos anteriores {{PAGOS_ANTERIORES_EUROS}} euros. Saldo pendiente después de este recibo {{SALDO_PENDIENTE_EUROS}} euros. El importe se aplica al periodo o servicio {{PERIODO_O_SERVICIO}}. No se debe firmar como cobrado un pago solo prometido o una transferencia no recibida.

3. EFECTIVO Y FACTURA
Si el pago es en efectivo, debe comprobarse el importe total de la operación y los límites legales; fraccionar los pagos no permite eludirlos. En operaciones con empresario o profesional el límite general impide pagos en efectivo de importe igual o superior a 1.000 euros. Este recibo acredita recepción del importe, no sustituye la factura ni cambia el momento de emisión legalmente exigible. Número o estado de factura: {{FACTURA_NUMERO_O_ESTADO}}. Correo de entrega: {{CLIENTE_EMAIL}}.

4. FIRMA DE RECEPCIÓN
Firma la persona que recibe o certifica el cobro por INNOVA: {{PERSONA_RECEPTORA_Y_CAPACIDAD}}. Observaciones, devolución o ajuste si procede: {{OBSERVACIONES_O_NINGUNA}}. El documento queda vinculado al expediente y al justificante citado sin incorporar datos bancarios completos innecesarios.`);
add('cambio','11 · Solicitud y aceptación de cambio de plan','clientes',parties+`1. CAMBIO SOLICITADO
Plan y modalidad actuales: {{PLAN_MODALIDAD_ACTUAL}}. Periodo abonado: {{PERIODO_ACTUAL}}. Nuevo plan y modalidad: {{NUEVO_PLAN_MODALIDAD}}. Fecha solicitada y fecha efectiva: {{FECHAS_CAMBIO}}. Motivo, si el cliente desea indicarlo: {{MOTIVO_O_NO_INDICADO}}.

2. CÁLCULO PREVIO
Días totales del periodo {{DIAS_PERIODO}}; días no consumidos {{DIAS_RESTANTES}}. Tarifa actual y nueva sin IVA {{TARIFAS_COMPARADAS}}. Fórmula y resultado {{CALCULO_PRORRATEO}}. Base a pagar {{BASE_EUROS}} euros; IVA {{CUOTA_IVA_EUROS}} euros; total {{TOTAL_EUROS}} euros. Abono aplicado, si procede {{ABONO_O_CERO}}. El cliente puede revisar el cálculo antes de aceptar; un cambio no se ejecuta con un importe oculto.

3. EFECTOS
La subida se aplica en la fecha pactada tras regularizar el importe. La bajada se aplica al final del periodo de facturación. De mensual a anual, se descuenta el importe no consumido del mes y comienza un año nuevo ese día. Pasar de anual promocional a mensual pierde definitivamente la promoción; mantener continuidad anual conserva el precio promocional del plan correspondiente. Situación promocional después del cambio: {{EFECTO_PROMOCION}}.
Campañas que el cliente elige mantener activas: {{CAMPANAS_CONSERVADAS}}. Efecto sobre dominio y funciones: {{EFECTO_DOMINIO_FUNCIONES}}. El contenido excedente no se elimina por este acto; sigue la conservación contractual. Saldo y próxima asignación informados: {{SALDO_Y_ASIGNACION}}.

4. CONFORMIDAD
El cliente solicita y acepta el cambio, su cálculo y fecha efectiva. INNOVA registrará confirmación una vez aplicado; estado actual {{ESTADO_APLICACION}}. No se presenta una solicitud como cambio ya ejecutado.`);
add('baja','12 · Solicitud y confirmación de baja','clientes',parties+`1. SOLICITUD
Cuenta y negocio: {{CUENTA_Y_NEGOCIO}}. Plan actual: {{PLAN}}. Fecha de solicitud: {{FECHA_SOLICITUD}}. Fin del periodo pagado: {{FIN_PERIODO_PAGADO}}. Fecha efectiva de baja: {{FECHA_EFECTIVA_BAJA}}. La baja voluntaria mantiene el servicio hasta ese vencimiento y no añade un mes de gracia. No se solicita un motivo obligatorio.

2. EFECTOS INFORMADOS
Al terminar el periodo se pasa a Free. El cliente elige conservar activa la campaña {{CAMPANA_FREE}} dentro de su límite. Los demás contenidos se bloquean, sin borrado inmediato, para recuperación durante tres años conforme al contrato y los derechos de protección de datos. El saldo {{SALDO_CREDITOS}} queda congelado. La promoción anual se pierde al cancelarse la continuidad y no se recupera al contratar posteriormente.

3. DOMINIO Y COPIA
Dominio, si existe: {{DOMINIO_O_NO_APLICA}}. Vencimiento ya pagado: {{VENCIMIENTO_DOMINIO_O_NO_APLICA}}. Instrucción de transferencia o renovación propia: {{INSTRUCCION_DOMINIO_O_NO_APLICA}}. Si cancela Business mensual, no se cobra de nuevo el registro ya pagado; conservarlo no prolonga Business. Solicitud de copia o supresión de materiales: {{SOLICITUD_COPIA_SUPRESION_O_NINGUNA}}. Las obligaciones legales de conservar facturas y evidencias se atienden por separado.

4. CONFIRMACIÓN
Importes pendientes o devoluciones justificadas: {{AJUSTES_O_NINGUNO}}. Estado de la baja {{ESTADO_BAJA}}. Confirmación de INNOVA {{REFERENCIA_CONFIRMACION}}. El firmante confirma la solicitud y que ha recibido esta información; no renuncia a reclamar por errores de cobro ni a sus derechos.`);
add('colaborador','13 · Acuerdo de colaboración y confidencialidad','colaboradores',`INNOVA
${provider}.

COLABORADOR
{{COLABORADOR_NOMBRE}}, NIF {{COLABORADOR_NIF}}, domicilio {{COLABORADOR_DOMICILIO}}, contacto {{COLABORADOR_EMAIL}}, representado cuando proceda por {{COLABORADOR_REPRESENTACION}}.

1. ENCARGO CONCRETO
Proyecto o servicio: {{PROYECTO}}. Trabajo y entregables: {{ENTREGABLES}}. Fechas y criterios de aceptación: {{PLAZOS_Y_ACEPTACION}}. Responsable de coordinación: Andrey. La colaboración no autoriza a contratar en nombre de INNOVA, ofrecer descuentos o asumir obligaciones frente a clientes sin autorización escrita. La naturaleza profesional de la relación debe corresponder con su organización real; este texto no altera una relación laboral si legalmente la hubiera.

2. REMUNERACIÓN
Honorarios o comisión: {{HONORARIOS_Y_BASE_CALCULO}}. Impuestos: {{IMPUESTOS_APLICABLES}}. Hito de devengo y pago: {{DEVENGO_Y_PAGO}}. Gastos autorizados: {{GASTOS_O_NINGUNO}}. No se deduce una comisión de conversaciones informales ni se paga sobre una venta no identificada. La factura y comprobación de entrega siguen el procedimiento acordado.

3. ACCESO Y CONFIDENCIALIDAD
Información y sistemas autorizados: {{ACCESOS_AUTORIZADOS}}. Se concede solo el acceso necesario, personal e intransferible; no se comparten credenciales ni se exportan bases de clientes a cuentas propias. El colaborador guarda confidencialidad sobre datos, precios no públicos, credenciales y proyectos durante la relación y mientras conserven carácter confidencial. Se exceptúa información pública legítimamente, obtenida por otra vía lícita o requerida legalmente, con aviso cuando sea posible.

4. DATOS E INCIDENTES
Si trata datos por cuenta de INNOVA, debe firmarse el encargo correspondiente antes de acceder. No utiliza datos de clientes para fines propios ni los introduce en IA externa sin autorización documentada. Comunica sin demora pérdida de dispositivo, envío equivocado, credenciales expuestas o acceso indebido a Andrey y conta@innovandesign.com, preservando evidencias y siguiendo instrucciones de contención.

5. ENTREGABLES Y DERECHOS
Derechos de uso o cesión pactados: {{DERECHOS_ENTREGABLES}}. Elementos previos o de terceros: {{MATERIALES_PREVIOS_Y_LICENCIAS}}. No se presume una cesión universal no descrita ni se entregan materiales sin permiso. El colaborador facilita archivos y documentación acordados, y corrige incumplimientos del alcance conforme a {{PROCEDIMIENTO_CORRECCION}}.

6. FINALIZACIÓN
Duración y preaviso: {{DURACION_Y_PREAVISO}}. Al terminar entrega el trabajo, devuelve o suprime la información según instrucciones y se revocan accesos. Se liquidan importes devengados sin retener credenciales o materiales del cliente como garantía. Las incidencias se documentan y se aplica la legislación española con los tribunales legalmente competentes. Parte firmante: {{PARTE_QUE_FIRMA}}; aceptación de la otra parte: {{EVIDENCIA_ACEPTACION_OTRA_PARTE}}.`);
add('procedimiento','14 · Procedimiento de contratación, entrega y soporte','organizacion',`ÁMBITO Y RESPONSABLES
Servicio Escaparates digitales. Dpto. 04: Javi, responsable técnico y de entrega. Dpto. 06: Andrey, coordinación de personas, asignación y sustituciones. Dpto. 07: Andrey, revisión documental y coordinación de validación legal y fiscal. Responsable que toma conocimiento de esta versión: {{RESPONSABLE_QUE_ACEPTA}}.

1. ANTES DE OFRECER
Comprobar alcance y disponibilidad real del plan, precio más IVA, promoción y plaza si corresponde. No prometer búsqueda automática, IA gratuita o extras que estén desactivados. Identificar el negocio y si necesita varias sucursales. Enterprise se presupuesta por separado.

2. CONTRATACIÓN
Crear expediente con cliente, representante y correo. Preparar contrato, pedido, créditos y privacidad; añadir encargo y dominio cuando apliquen. Completar los campos, verificar identidad fiscal y revisar importes. Facilitar lectura completa y resolver dudas. Registrar la conformidad y firma de la parte correspondiente; una firma de cliente no sustituye una aceptación del prestador. Guardar versión y copia. No pedir datos bancarios o personales innecesarios.

3. COBRO
Confirmar el ingreso o efectivo recibido y asociar justificante. Emitir recibo cuando proceda y factura por el sistema fiscal autorizado. La pantalla de documentación no emite por sí sola una factura. No activar recargas por capturas de pago no verificadas. Comprobar que la cuenta no esté en gracia antes de recargar.

4. PRODUCCIÓN
Recoger materiales y permisos. Generar la campaña inicial sin descontar créditos. Revisar datos sugeridos; completar manualmente lo no acreditado. Presentar diseño, recibir una de las dos rondas iniciales y obtener conformidad sobre una versión identificada. Confirmar por separado cualquier extra. Registrar y verificar el dominio Business sin inventar disponibilidad.

5. PUBLICACIÓN Y ENTREGA
Publicar con plan y límite correctos. Probar enlace, contactos y cambio de destino del QR. Imprimir cartel aprobado y escanearlo desde otro móvil en condiciones reales. Cumplir 24–48 horas laborables desde los requisitos pactados, avisando de incidencias. Entregar accesos por canal seguro y explicar guardar/publicar, saldo, regeneración y baja. Firmar acta con pruebas realmente hechas y reservas visibles.

6. SOPORTE Y CONTINUIDAD
Atender de lunes a viernes 09:00–20:00, objetivo de primera respuesta una hora de servicio. Registrar solicitud, cliente, responsable, prioridad y siguiente acción. Andrey organiza sustitución cuando Javi no esté. No confundir primera respuesta con resolución. Los trabajos fuera de alcance se presupuestan antes de ejecutarse.

7. RENOVACIONES Y BAJA
Comunicar vencimiento e importe. Durante gracia mantener las condiciones acordadas, sin recargas. Documentar pago desde vencimiento original, cambio o baja, elección de campañas y salida del dominio. Conservar contenido recuperable tres años según contrato y separar obligaciones fiscales. No borrar documentación firmada para corregirla: generar un nuevo documento rectificativo con referencia al anterior.

8. CONTROL DOCUMENTAL
Administración/Dirección prepara y revisa documentos; no presta firmas ajenas. Verifica destinatarios en cada operación y comprueba recepción cuando sea necesaria. «Aceptado por servidor» no es acuse de recibo. Fallos de envío se reintentan desde la copia ya firmada. Incidentes de seguridad se comunican a Javi y Andrey sin ocultarlos. La firma de este procedimiento deja constancia de lectura y compromiso operativo, no de que todas las pruebas de clientes estén realizadas. Observaciones de implantación: {{OBSERVACIONES_O_NINGUNA}}.`);
add('aprobacion','15 · Conformidad interna del paquete documental','legal',`OBJETO
Registrar la revisión real de los modelos antes de su uso. Este documento no sustituye los contratos de cada cliente ni convierte en comprobado un dato fiscal pendiente. Responsable que revisa: {{REVISOR_NOMBRE_Y_FUNCION}}. Versión y modelos revisados: {{LISTA_VERSIONES_REVISADAS}}.

1. IDENTIDAD Y CONDICIONES
Verificación de nombre, NIF y domicilio del prestador: {{RESULTADO_IDENTIDAD_FISCAL}}. Coherencia de precios, IVA, promoción de 50 plazas, mensualidad, prorrateos y baja: {{RESULTADO_COMERCIAL}}. Coherencia de créditos y funciones realmente disponibles: {{RESULTADO_IA}}. No basta con aprobar un título; debe leerse el contenido íntegro y sus campos.

2. PROTECCIÓN DE DATOS Y DOMINIO
Proveedores, regiones, subencargos, garantías y plazos contrastados: {{RESULTADO_PRIVACIDAD_PROVEEDORES}}. Registro, titularidad, renovación y salida de dominio: {{RESULTADO_DOMINIO}}. Los puntos que no apliquen deben justificarse; los pendientes se conservan como reservas.

3. FIRMA Y ENTREGA DE COPIAS
Método revisado: imagen manuscrita vinculada a versión, fecha, identidad declarada y huella de integridad, con descarga y correo. No se anuncia como firma cualificada ni como verificación biométrica de identidad. Prueba de firma, descarga y recepción real de correo: {{RESULTADO_PRUEBA_FIRMA_CORREO}}. Tratamiento de aceptación de ambas partes: {{PROCEDIMIENTO_ACEPTACION_PARTES}}.

4. DECISIÓN
Decisión: {{APROBADO_APROBADO_CON_RESERVAS_O_NO_APROBADO}}. Modelos y usos autorizados: {{ALCANCE_AUTORIZACION}}. Reservas y condiciones que impiden determinados usos: {{RESERVAS_O_NINGUNA}}. Acciones, responsables y fechas: {{ACCIONES_O_NINGUNA}}. La firma documenta esta decisión concreta; no expresa una garantía absoluta de ausencia de errores ni un dictamen profesional que no se haya emitido.

5. REFERENCIAS DE REVISIÓN
RGPD: https://www.boe.es/buscar/doc.php?id=DOUE-L-2016-80807
Encargo de tratamiento, AEPD: https://www.aepd.es/documento/guia-directrices-contratos.pdf
Firma electrónica, eIDAS: https://www.boe.es/buscar/doc.php?id=DOUE-L-2014-81822
Información del prestador, LSSI: https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758
Límite de efectivo, AEAT: https://sede.agenciatributaria.gob.es/Sede/colaborar-agencia-tributaria/denuncias/denuncia-pagos-efectivo.html`);
// Single client-facing contracting package; individual records remain reusable references.
const packageIds=['contrato','pedido','creditos','privacidad','encargo','materiales','dominio'];
function packageBody(id){
 let text=records.find(r=>r.id===id).content.split('\n\n').slice(1).join('\n\n');
 for(const heading of ['PRESTADOR','CLIENTE PROFESIONAL','RESPONSABLE DEL TRATAMIENTO','ENCARGADO DEL TRATAMIENTO'])text=text.replace(new RegExp('^'+heading+'\\n[\\s\\S]*?\\n\\n'),'');
 // Role headers in the processing annex are repeated in a different order.
 for(const heading of ['PRESTADOR','CLIENTE PROFESIONAL','RESPONSABLE DEL TRATAMIENTO','ENCARGADO DEL TRATAMIENTO'])text=text.replace(new RegExp('^'+heading+'\\n[\\s\\S]*?\\n\\n'),'');
 text=text.replace('{{REFERENCIAS_Y_VERSIONES_ANEXOS}}','apartados I a VII de este documento, versión 1.0, con el alcance indicado en Aplicabilidad');
 if(id==='materiales')text=text.replace(/3\. CONTENIDO APROBADO[\s\S]*?(?=4\. USO PUBLICITARIO)/,'3. APROBACIÓN ANTES DE PUBLICAR\nLa firma de la contratación permite preparar los materiales, pero no declara aprobado un diseño todavía no presentado. La versión final, los datos y la oferta se revisarán y aprobarán por separado antes de publicarse. Esa conformidad se vinculará a este mismo expediente.\n\n').replace('confirma los permisos y la versión indicada','confirma los permisos para los materiales identificados');
 return text;
}
const masterTitle='00 · Foto Fachada · Escaparates virtuales · Documento único';
const sections=['I. CONTRATO DEL SERVICIO','II. PEDIDO Y CONDICIONES PARTICULARES','III. CRÉDITOS Y REGENERACIONES IA','IV. INFORMACIÓN DE PRIVACIDAD','V. ENCARGO DE TRATAMIENTO, CUANDO PROCEDA','VI. MATERIALES Y PERMISOS','VII. DOMINIO BUSINESS, CUANDO PROCEDA'];
const masterContent=header(masterTitle)+parties+'OBJETO DEL DOCUMENTO\nEste documento reúne en una única versión la contratación de Foto Fachada · Escaparates virtuales y sus condiciones particulares y anexos. Se prepara una copia por expediente y se registra una única firma de la parte identificada al final, que comprende los apartados aplicables. No exige firmar por separado los modelos de los que procede. La aceptación de la otra parte debe constar por un medio real y verificable.\n\nÍNDICE\n'+sections.join('\n')+'\nVIII. CONFORMIDAD DEL CONJUNTO\n\nAPLICABILIDAD\nLos apartados I, II, III, IV y VI forman parte de la contratación. El apartado V se aplica cuando INNOVA trate datos por cuenta del cliente: {{APLICA_ENCARGO_Y_MOTIVO}}. El apartado VII se aplica si se contrata el dominio Business: {{APLICA_DOMINIO_Y_MOTIVO}}. En los campos de un apartado no aplicable se indicará «No aplica» con coherencia con el plan. Un dato pendiente no equivale a un hecho confirmado: las fechas de registro del dominio todavía no realizado se identificarán como pendientes de alta y se completarán mediante una confirmación vinculada al expediente. No se autoriza tratar datos por cuenta del cliente hasta que su inventario, proveedores y garantías estén definidos.\n\n'+packageIds.map((id,i)=>sections[i]+'\n\n'+packageBody(id)).join('\n\n')+'\n\nVIII. CONFORMIDAD DEL CONJUNTO\nEl firmante declara haber podido leer la totalidad de esta copia, revisar sus datos, importes y apartados aplicables y obtener aclaraciones antes de aceptar. La firma se vincula al contenido íntegro y a su versión. Parte que firma: {{PARTE_QUE_FIRMA}}. La aceptación de la otra parte consta en {{EVIDENCIA_ACEPTACION_OTRA_PARTE}}.\nEsta firma no constituye recibo de un pago no confirmado, aprobación anticipada de un diseño, acta de una entrega futura ni solicitud de cambio o baja. Esos hechos se registrarán cuando ocurran con la misma referencia de expediente. Los acuerdos internos de personal y responsabilidades de INNOVA quedan fuera de este documento del cliente. Una vez firmado, cualquier modificación se documenta en un nuevo registro relacionado, sin alterar esta versión.';
records.unshift({id:'documento-unico',title:masterTitle,category:'servicios',content:masterContent.replaceAll('Escaparates digitales','Foto Fachada · Escaparates virtuales')});
module.exports=require('./consolidated.cjs')(records);
