# Fuentes de los ejemplos de marca

Solicitud: sustituir FamilyFirst por Distrito Homes y los dos ejemplos de estética por INNVEEX y DERMOOK. Mantener Elite Estates. Los dos nuevos ejemplos de estética son propuestas de diseño, no una publicación en el dominio de las marcas.

## Recursos originales autorizados

Carpetas de Google Drive CLIENTES:
- INNVEEX: `1BaY-LLSJ2a9_uVop2YkybJN_VTZnCdKJ`
- DERMOOK: `1lvCg-7tNSLCzmaTyHb1Xi7JagNPp1jgu`

Archivos seleccionados para implementación:
- INNVEEX logo: `1XYFuicmb69299FVeqs0yAW3td9GYrdbE` (PNG transparente gris).
- INNVEEX textura web: `1svgM5gkXKEpW4LQxVaqSPYafR_A0p7Ku`.
- INNVEEX aparatología: `1P3GmR9FtPJ5wIEiYs0tyTEFBXXXnBnQW`.
- DERMOOK logo: `1vTwTY5uamVRcaxUyt4HQf69-CooyI89W` (turquesa).
- DERMOOK modelo: `1hAWAgas_TZnWWfgN31StFbg8JMq1RCEt`.
- DERMOOK tratamiento: `1NDeXkEjYNDK5o5AJihU9saQBlTsl7UmU`.

Sin sustitución de logotipos ni recoloración. Fotografías optimizadas para la web. No usar la captura antigua de WordPress de DERMOOK como recurso público.

## Distrito Homes: caso real

- Web: https://distritohomes.es/
- Landing QR: https://www.distritohomes.es/landing.html
- Panel: https://distritohomes.es/admin (redirige al inicio de sesión privado).
- Logo público: https://distritohomes.es/logo.png
- Imagen de landing: https://distritohomes.es/informe_valoracion/almendro5/benidorm.jpg

Las tres páginas se comprobaron en navegador el 28/09/2026. No se ha iniciado sesión en el panel ni accedido a datos privados.

## Criterios de diseño

UI/UX Pro Max: jerarquía editorial, legibilidad, áreas táctiles de 44 px, estados de foco, movimiento reducido y adaptación móvil/tablet/escritorio. Las paletas recomendadas genéricamente por la skill no sustituyen los colores originales de cada marca. No se incluyen testimonios, resultados médicos, precios ni datos de contacto inventados.

## Verificación de implementación

- OpenCode: preparación de assets y base HTML/CSS de INNVEEX; integración, páginas restantes y correcciones finales revisadas en Codex.
- Logotipos INNVEEX y DERMOOK: igualdad de píxeles RGBA con los archivos originales de Drive verificada.
- Cinco páginas comprobadas en navegador a 390×844, 768×1024, 1024×768 y 1440×900: sin imágenes rotas ni desbordamiento horizontal; anclas internas comprobadas.
- Alternancia web/landing, retorno a galería y cierre de diálogo dentro del iframe comprobados. Se corrigió el cierre de los diálogos sin habilitar el envío de formularios en el sandbox.
- TypeScript y compilación Next.js de producción superados. No se modifican autenticación, base de datos, precios ni sitios externos de las marcas.

## Ajuste de tarjetas y caso de exito (28/09/2026)

- Distrito Homes muestra la landing QR original adaptada a assets locales y CSS compilado, sin enlaces al administrador. El proyecto completo se cuenta debajo de la galeria en su propio caso de exito, basado en los hechos aportados por el usuario.
- INNVEEX y DERMOOK abren por defecto su landing; desde ella se accede a la web completa. Instagram, WhatsApp y presupuesto son acciones provisionales de demostracion hasta recibir los enlaces oficiales. No se usan contactos aleatorios de terceros.
- OpenCode genero el componente inicial del caso, posteriormente revisado e integrado.
