# Revisión UX/UI · 26 septiembre 2026

Aplicada con UI UX Pro Max, instalado desde nextlevelbuilder/ui-ux-pro-max-skill. Consultas: sistema de diseño SaaS business website builder, navegación atrás, recomendaciones Next.js. Sistema elegido: superficies claras, azul #2563eb, texto #1e293b, secundaria #475569, controles de 44 px y foco visible. Se conserva Inter y las plantillas originales del cliente; no se cambian precios.

## Problemas corregidos
- Biblioteca de carteles sin salida y controles fuera del viewport: navegación permanente por pasos, panel, botones Volver, controles sobre la vista previa escalada.
- Navegación sin historial: URL por paso y restauración con Atrás/Adelante.
- Editor secuencial con progreso compartido: campos accesibles, directos y revisables, incluidos servicios y productos.
- Guardado que no actualizaba snapshots existentes: actualiza contenido y carteles conservando el ID del borrador.
- Duplicados con la misma dirección: nuevo slug independiente.
- Carteles duplicados al guardar cambios: actualiza por ID.
- Publicar y guardar confundidos: borrador local / cuenta / web publicada separados; actualización pública guarda antes los cambios del editor abierto.
- Métricas de crecimiento fijas, opciones sin implementar y notificaciones ficticias retiradas del panel.
- Upload principal sin selector de fichero: control nativo accesible y errores persistentes; imágenes base64 recuperables después de recargar.
- Identidad: eliminado retraso artificial y botones de logo sin acción; nombre, sector y descripción editables, confirmación con estado ocupado.
- Carteles: sin textos falsos de ubicación, contactos ni motor técnico; QR negro con margen blanco, formatos A4/A5/cuadrado; exportación restaura dimensiones originales.
- Plantillas generadas: no se inventan horarios ni servicios genéricos si no hay datos; un campo vaciado por el usuario no vuelve a mostrar la sugerencia.
- Cabecera, panel, creación, diseño, contenido, identidad y cartelería con jerarquía unificada, foco, etiquetas y estados de espera/error.

## Verificación ejecutada
- TypeScript sin errores.
- tests/mvp-persistence.cjs: guardado, idempotencia, recursos privados/públicos, publicación saneada, retirada y errores.
- tests/draft-saving.cjs: actualización de borrador conserva identidad, contenido reciente y carteles.
- Navegador local: subir imagen, fallback manual, confirmar identidad, elegir diseño, editar descripción/horario, abrir y salir de cartelería, guardar/reabrir cartel, Atrás del navegador conserva datos.
- PNG A4 descargado y abierto: 2379×3366, imagen/texto/QR completos.
- Cartelería revisada a 390×844, 844×390, 768×1024 y 1024×768; medidas sin scroll horizontal en tamaños comprobados.

## Límites pendientes
- Gemini devuelve 429; la generación manual funciona. No afirmar que la IA real está operativa.
- La sesión real de login/registro fue confirmada por el usuario; en esta revisión la prueba local de publicación autenticada usa pruebas de servicio, no una cuenta nueva real.
- El diálogo de impresión/PDF y la lectura física del QR con una cámara requieren comprobación en el dispositivo de destino.
- Landing comercial simplificada: se eliminan paneles con métricas ficticias y cinco iframes simultáneos; se conservan precios y referencias. Las plantillas originales del cliente no se han rehecho.
- Dominio final de Hostinger pendiente de conexión; Vercel es el destino de publicación autorizado.
