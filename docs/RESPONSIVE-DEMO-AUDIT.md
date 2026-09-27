# Revisión de ejemplos — 27/09/2026

## Alcance y selección

Se revisaron 14 originales exportados del proyecto Stitch ESCAPARATES VIRTUALES y las 8 demos existentes de la home. Se capturaron las 22 páginas a 768×1024, 1024×768 y 1440×900. El archivo de evidencias local es `outputs/responsive-audit/auditoria-inicial.html` en el workspace padre. Las capturas iniciales pueden mostrar recursos externos aún cargando; no constituyen por sí solas prueba de un enlace roto.

| Ejemplo original | Decisión y hallazgo principal |
|---|---|
| Elite Estates | Destacado. Original limitado a 512 px; ampliar composición y sustituir imágenes de objetos en fichas inmobiliarias. |
| UrbanPulse | Reserva. Hero adecuado, pero tarjetas pequeñas alineadas a la izquierda en escritorio. |
| Minimalist Rentals | Reserva. Columna móvil y fondos pendientes de carga en las primeras capturas. |
| InvestHome | Fuera de la home. Datos financieros ilustrativos y enfoque de inversión distinto a la agencia local. |
| FamilyFirst | Destacado. Identidad familiar diferenciada; ajustar ancho, tarjetas y navegación. |
| Aura Luxe | Destacado. Identidad editorial coherente; cuadrícula de tratamientos y reserva adaptable. |
| DermaScience | Fuera de la home. Columna móvil y afirmaciones clínicas ilustrativas. |
| PureZen | Destacado. Retirar falso reproductor, poner portada real y adaptar secciones. |
| Nova Glow | Fuera de la home. CTAs demasiado anchos y estadísticas ficticias. |
| Glossy Chic | Reserva. Buen acabado, pero columna móvil y contenido temporal antiguo. |
| Pure Polish | Reserva. Buen lenguaje visual; falta distribución de escritorio. |
| Vivid Claw | Fuera de la home. Imágenes sobredimensionadas retrasan el contenido comercial. |
| Serene Hands | Fuera de la home. Portada sobredimensionada y grandes zonas vacías. |
| NailHub | Fuera de la home. Enfoque de membresías y composición móvil. |

## Ocho demos anteriores

Salamandra, Sofia, Mango, Quinchuqui y Belleza conservan sus fotografías y tipografías. A partir de 768 px se distribuyen identidad y acciones en dos columnas, manteniendo la composición móvil. Elite Detail y DermaScience amplían contenedores y reparten contenido; Pure Dining limita el tamaño de su portada editorial. Las rutas anteriores siguen disponibles en el visor; no se muestran entre los cuatro destacados.

## Cambios implementados

- Registro compartido en `lib/marketing/demos.ts`: cuatro destacados y ocho rutas anteriores.
- Home: hero con Elite Estates y Aura Luxe; galería con dos inmobiliarias y dos centros de estética. Se conservan marcos de teléfono y neón INNOVA.
- Cuatro HTML de Stitch adaptados por OpenCode; CSS Tailwind compilado, sin CDN de ejecución.
- Imágenes originales descargadas y alojadas en el proyecto. Revisión manual posterior corrigió asociaciones equivocadas de OpenCode.
- Elite: restaurada villa de portada y viviendas de fichas; objetos sustituidos por interiores inmobiliarios del mismo conjunto de diseños.
- FamilyFirst: restauradas ilustración familiar y vivienda originales; mapa y retrato originales conservados.
- Aura Luxe: restaurada portada y correspondencia de imágenes de tratamientos; mapa identificado como ubicación ilustrativa.
- PureZen: portada con imagen de estética del mismo original; eliminado falso reproductor y asignadas imágenes botánicas/cosméticas a sus secciones.
- Diálogos de demo cerrables, foco visible, tamaños táctiles mínimos en destacados y reducción de movimiento. No se envían reservas ni datos.
- Precios y autenticación no modificados.

## Validación realizada

- Compilación de producción Next y comprobación TypeScript: correctas.
- Referencias locales HTML a imágenes, CSS y scripts: sin archivos ausentes.
- Sintaxis de `legacy-demo.js`: correcta.
- Primera revisión responsive: 66 capturas; sin desbordamiento horizontal de página en las métricas recogidas.
- Verificación visual posterior realizada parcialmente en demos anteriores; capturas `after-*` disponibles localmente.
- Conexión de Brave recuperada. Cuatro destacados comprobados a 390×844, 768×1024, 1024×768 y 1440×900: sin desbordamiento horizontal de página ni imágenes HTML rotas. Capturas `final-*` y métricas guardadas en el workspace.
- Visor Aura Luxe: abrir y cerrar diálogo de reserva y volver a los ejemplos funciona. Las acciones son ilustrativas, no reservas reales.
- Revisión visual: corregidos contraste azul sobre fondo oscuro en Elite, distribución de tratamientos de Aura en tablet y espacio para la cámara de los teléfonos. Galería distribuida en cuatro columnas de escritorio y dos en tablet.
- Capturas posteriores de las ocho demos anteriores completadas. Publicación de los cuatro destacados preparada tras la validación local.

La revisión usa tamaños de viewport de tablet y escritorio; no es una prueba en dispositivos físicos.
