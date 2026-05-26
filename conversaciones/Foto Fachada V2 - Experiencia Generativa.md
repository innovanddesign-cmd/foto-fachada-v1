#Plataforma: Gemini


MASTER PROMPT: FOTO FACHADA V2 - GENERATIVE STOREFRONT ENGINE

ROL: Actúa como un Senior Full-Stack Product Architect & Creative Director con 15 años de experiencia en desarrollo de Apps Top 10 (estilo Airbnb, Uber, Instagram 2026). Tu objetivo es reconstruir "Foto Fachada" desde cero, eliminando cualquier lógica de constructor web tradicional y sustituyéndola por una Interfaz Generativa (Generative UI).



1. EL ESTÁNDAR VISUAL (BENCHMARK: MENUENQR.ONLINE)

La aplicación debe ser indistinguible de una app nativa premium de 2026. Reglas de diseño innegociables:



Estética: Glassmorphism extremo (blur 20px-40px), bordes ultra-redondeados (32px a 48px), y sombras de profundidad multi-capa.

Jerarquía: Uso de tipografías con interletrado óptico (Headline Extra-Bold, Body Regular).

Interactividad: Transiciones elásticas (Spring animations) de 300ms. Nada de saltos bruscos.

Idioma: Toda la plataforma y el contenido generado debe estar 100% en ESPAÑOL. Prohibido cualquier anglicismo.

2. EL FLUJO DE USUARIO (VENTA INVERTIDA)

No uses rutas tradicionales. Implementa una Single Page Application (SPA) gobernada por esta Máquina de Estados:



Estado 0 (Captura): Solo un botón de subida de foto. Limpieza absoluta.

Estado 1 (Análisis Brand DNA): La IA analiza la fachada y extrae: Paleta de colores (5 niveles), Tipografía y el "Vibe" del negocio.

Estado 2 (Showcase Inmersivo): Renderiza un Mockup de Smartphone con un escaparate diseñado por la IA al vuelo. NO USAR PLANTILLAS. La IA decide la estructura (Hero, Ofertas, Galería, etc.) basándose en el negocio. Botón obligatorio de "REGENERAR" para crear variaciones infinitas.

Estado 3 (Cartelería Pro): Genera un cartel publicitario (Print-Ready 300DPI) que herede el diseño del escaparate. Debe parecer diseñado por un estudio gráfico de élite.

Estado 4 (Smart Config): El formulario de datos no es estático. Se genera dinámicamente: si el diseño de la IA tiene una "Oferta", pide el precio; si tiene "Categorías", pide los nombres. Pre-rellena todo con sugerencias de la IA.

Estado 5 (Despliegue): Entrega de URL final y Kit de éxito.

3. ARQUITECTURA TÉCNICA REQUERIDA

Frontend: Next.js (App Router), Tailwind CSS, Framer Motion.

Motor de UI: El sistema debe interpretar un JSON Schema generado por la IA para renderizar componentes "Glass-App" en tiempo real.

Persistencia: Si el usuario refresca la página, la app debe recuperar el estado y el diseño actual (sessionStorage).

Rendimiento: Carga instantánea (<800ms). Optimización total de imágenes (WebP/AVIF).

4. ECOSISTEMA DE LA PLATAFORMA (PÁGINAS PÚBLICAS Y DASHBOARD)

Debes construir el sitio completo, no solo la herramienta:



Landing Page Pública: Home de alto impacto, página de ejemplos (estilo directorio), precios transparentes y centro de ayuda con soporte WhatsApp.

Dashboard de Usuario: Estética de "Torre de Control". Navegación por Tab Bar inferior (estilo app móvil). Tarjetas Glassmorphism para gestionar los escaparates creados.

5. RESTRICCIONES CRÍTICAS

Cero Inglés: Absolutamente ningún texto en inglés en botones, mensajes de error o código visible.

Mobile-First: La plataforma debe ser perfecta en móvil; el escritorio es secundario.

Validación: Antes de cada despliegue, verifica que el formulario dinámico (Estado 4) coincida exactamente con los componentes creados en el escaparate (Estado 2).

Gemini ha dicho
Entendido. Como Director Creativo y Arquitecto Jefe de Producto, asumo el mando de la evolución de Foto Fachada V2. Mi enfoque no es construir un software, sino una experiencia sensorial generativa que convierta la fricción técnica en magia visual.

Estamos eliminando el concepto de "editor" para pasar al concepto de "inteligencia de despliegue". A continuación, presento la arquitectura maestra y el ecosistema de diseño para este motor de nueva generación.

🏗️ Arquitectura de la Experiencia: La Máquina de Estados
La aplicación operará bajo una arquitectura de Estado Fluido. No hay páginas de carga; hay transiciones de estado orquestadas por Framer Motion con curvas de aprendizaje orgánicas.

Los 6 Estados del Flujo de Usuario
Estado	Nombre	Acción de la IA	Interfaz (UI)
E0	Captura	Espera activa de activos.	Lienzo vacío con efecto frosted glass.
E1	ADN de Marca	Extracción de paleta, fuentes y "vibra".	Escaneo radial sobre la foto subida.
E2	Escaparate	Generación de componentes según rubro.	Maqueta de móvil 3D con scroll elástico.
E3	Cartelería	Adaptación de diseño a gran formato.	Previsualización de impresión en 300 DPI.
E4	Configuración	Generación de campos según diseño.	Formulario predictivo sin campos inútiles.
E5	Éxito	Despliegue en infraestructura Edge.	Tarjeta de victoria con código QR único.
🎨 Sistema de Diseño: "Cristal Líquido 2026"
Nuestra estética se basa en la profundidad y la transparencia. No usamos colores planos; usamos refracciones.

Superficies: Capas de cristal con desenfoque de fondo (Backdrop Blur) de entre 20px y 40px.

Contornos: Bordes ultra-suavizados (32px a 48px) con trazos internos de 1px en color blanco al 20% para simular el borde de un cristal.

Tipografía: Usaremos variantes de fuentes variables (Variable Fonts) con interletrado ajustado para máxima legibilidad en pantallas móviles de alta densidad.

Movimiento: Todas las interacciones usan físicas de resorte (Spring physics). Si el usuario desliza, el contenido debe rebotar con naturalidad, no detenerse en seco.

🛠️ Implementación Técnica de Vanguardia
El Motor Generativo (JSON a UI)
El corazón de la App es un intérprete que recibe un esquema de la IA. Si la IA detecta que el negocio es una "Cafetería de Especialidad", el JSON dictará:

Componente: Galería de Origen (Visualización de granos).

Componente: Menú Estacional (Precios dinámicos).

Vibe: Minimalista, colores tierra, tipografía Serif.

JavaScript
// Ejemplo conceptual del esquema de ADN de Marca (Interno)
{
  "estilo": "Minimalismo_Orgánico",
  "colores": ["#F5F5F5", "#2D2D2D", "#A3876A"],
  "componentes_activos": ["Sección_Principal", "Tarjetas_Producto", "Ubicación_Mapa"],
  "animacion": "Desplazamiento_Suave"
}
Rendimiento Extremo
Carga Crítica: < 800ms mediante la generación estática de bordes y el uso de imágenes AVIF optimizadas en tiempo real.

Persistencia: Implementación de un almacén de estado en la sesión para que el progreso no se pierda ante cualquier interrupción, manteniendo la integridad del diseño generado.

📑 Ecosistema de la Plataforma
1. Página de Inicio (Landing)
Un escaparate de nuestras propias capacidades. Un encabezado imponente que muestra transformaciones reales de fachadas a tiendas digitales en un bucle infinito de alta calidad. Nada de texto genérico: "Tu negocio físico, digitalizado por inteligencia pura".

2. Panel de Control (Torre de Control)
Diseñado exclusivamente para el pulgar.

Navegación Inferior: Acceso rápido a "Mis Tiendas", "Analítica" y "Ajustes".

Tarjetas de Gestión: Cada tienda es una tarjeta de cristal que vibra suavemente al tocarla, mostrando el estado actual de las ventas o visitas.

3. Centro de Ayuda
Soporte integrado vía WhatsApp con un diseño que mantiene la coherencia estética. Sin formularios de contacto arcaicos.

🚫 Restricciones de Calidad y Validación
Control de Idioma: Se auditará cada cadena de texto. No se permite "Login", se usa "Acceder". No se permite "Submit", se usa "Finalizar".

Validación de Formulario Dinámico: Antes de pasar al Estado 5, el sistema realiza una comprobación cruzada: si el diseño generado incluye un "Menú de Degustación", el formulario del Estado 4 debe haber solicitado los nombres de los platos. Si falta un dato, la IA lo sugiere basándose en la foto original.

¿Deseas que proceda con el diseño detallado de la "Torre de Control" (Dashboard) o prefieres que desglose primero la lógica del motor de Análisis de ADN de Marca?

Has dicho
vamos a desglosarlo todo paso por caso. Haz primero un sumario con todos los bloques y luego vamos a redactar un prompt por cada bloque

Gemini ha dicho
Excelente decisión. Para construir una arquitectura de este calibre, necesitamos una hoja de ruta técnica y creativa impecable. Como tu Director de Producto, he estructurado el proyecto en 6 Bloques Maestros.

A continuación, el sumario del ecosistema y los prompts diseñados para que una IA de código de última generación (o un equipo de desarrollo elite) ejecute cada pieza con precisión quirúrgica.

🏗️ Sumario del Proyecto: Foto Fachada V2
Bloque	Nombre	Propósito
01	Sistema de Diseño "Cristal Líquido"	Definir tokens de diseño, curvas de animación y componentes base.
02	Motor de Visión y ADN de Marca	Lógica de análisis de imagen y extracción de identidad visual.
03	Generador de Interfaz Dinámica (UID)	El cerebro que convierte el JSON de la IA en una tienda funcional.
04	Motor de Cartelería y Exportación	Generación de archivos de alta resolución (300 DPI) para impresión.
05	Formulario Inteligente y Despliegue	Interfaz de configuración adaptativa y publicación en el Edge.
06	Panel de Control (Torre de Control)	Dashboard móvil para que el usuario gestione sus escaparates.
🖋️ Prompts de Ejecución por Bloque
BLOQUE 01: El Sistema de Diseño (UI/UX Kit)
Prompt: "Actúa como Diseñador de Sistemas Senior. Crea un archivo de configuración de Tailwind CSS y una librería de componentes en React (Framer Motion) que defina la estética 'Cristal Líquido 2026'. Requisitos: Bordes redondeados de 40px, fondos con backdrop-blur de 30px, y bordes semi-transparentes de 1px. Define una paleta de colores semántica que acepte variables de 'Acento' dinámicas. Las animaciones deben ser de tipo 'Spring' (stiffness: 300, damping: 30). Todo el código y comentarios deben estar en español. No uses 'padding', usa 'espaciado'. No uses 'border-radius', usa 'curvatura'."

BLOQUE 02: Análisis de ADN de Marca (IA Vision)
Prompt: "Diseña una función de servidor en Next.js que integre un modelo de visión artificial. La función debe recibir una imagen de la fachada de un negocio y devolver un objeto JSON estrictamente en español con: 1. Paleta cromática (hexadecimales), 2. Estilo tipográfico sugerido (Serif/Sans/Display), 3. Categoría del negocio, y 4. 'Vibración' estética (ej: Rústico moderno, Lujo minimalista). El análisis debe ser capaz de ignorar elementos distractores como coches o peatones."

BLOQUE 03: Motor de Interfaz Generativa (Showcase)
Prompt: "Construye un componente 'EscaparateVivo' que renderice una interfaz móvil dentro de un mockup de smartphone. Este componente no usa plantillas fijas; debe mapear el JSON del Bloque 02 para decidir qué secciones mostrar (ej: si es restaurante, muestra 'Carta Digital'; si es tienda, muestra 'Galería de Productos'). Implementa un botón de 'REGENERAR' que cambie la disposición de los componentes con una transición elástica. Todo el contenido generado (textos de relleno, botones, títulos) debe ser en español persuasivo."

BLOQUE 04: Cartelería Pro (Print Engine)
Prompt: "Desarrolla un generador de activos visuales que tome el ADN de la marca y cree una composición para cartel publicitario. Utiliza Canvas o SVG para asegurar una resolución de salida de 300 DPI. El diseño debe heredar el estilo del escaparate digital pero optimizado para lectura física. Incluye un código QR dinámico generado automáticamente que apunte a la futura URL del negocio. Los textos deben decir cosas como 'Escanea para descubrir' o 'Tu nueva experiencia digital'."

BLOQUE 05: Formulario Inteligente y Publicación
Prompt: "Crea un componente de formulario que se auto-construya basándose en los componentes presentes en el Bloque 03. Si el escaparate tiene una sección de 'Precios', el formulario debe habilitar campos numéricos. Si tiene 'Historia', habilita un área de texto. Implementa la lógica de persistencia usando sessionStorage para que los datos no se borren. El botón final debe decir 'Lanzar al Mundo' y activar una animación de despliegue exitoso."

BLOQUE 06: La Torre de Control (Dashboard)
Prompt: "Diseña la interfaz del Panel de Control del usuario siguiendo el estándar 'Mobile-First'. Usa una barra de navegación inferior con iconos de cristal. La pantalla principal debe mostrar tarjetas de los escaparates creados con métricas simplificadas (Visitas, Clics). Incluye un botón flotante central '+' para iniciar el proceso de captura (Estado 0). El lenguaje debe ser cercano y profesional, evitando términos técnicos en inglés."

¿Por cuál de estos bloques te gustaría que empezáramos a trabajar en profundidad ahora mismo? Puedo generar el código base del Sistema de Diseño o configurar la lógica del Motor de Visión.

Has dicho
quiero que redactes un prompt para cada bloque utilizando todos los tokens de salida posible, si necesita 2 o 3 mensajes para redactar el prompt perfecto por cada bloque, hazlo. Yo te iré diciendo continuar para seguir con la redacción. Es muy importante no dejarse nada y tener en cuenta:



SUBIDA DE ARCHIVOS

- Fotos y videos y e interior o exterior

- Definir formatos y tamaños de archivos

- Crear galeria de archivos subidos en el dashboard



ANALISIS DE NEGOCIO

- Extraer identidad visual

- Mostrar informe al usuario



LANDING ESCAPARATE

- Diseño web moderno, actual e innovador

- Establecer guia de diseño fronted y experiencia UX/UI, similar a ejemplos de "https://menuenqr.online/escaparates"

- Adaptar a la identidad visual de cada negocio

- Estructura y diseño personalizado para cada negocio

- Posibilidad de regenerar





GENERAR CARTEL QR

- Diseño profesional y llamativo

- Biblioteca de carteles en dashboard

- Tamaño por defecto A4



CONFIGURAR CONTENIDO ESCAPARATE

- Cada escaparate tiene unos parámetros para configurar

- Formulario intuitivo y sencillo

Gemini ha dicho
Entendido perfectamente. Como Director de Producto, voy a estructurar estos prompts no como simples peticiones, sino como Especificaciones Técnicas de Ingeniería (ETI). Cada prompt será una directriz exhaustiva que obligará a la IA a comportarse como un desarrollador de élite de 2026.

Vamos a empezar con los dos primeros bloques fundamentales: el Sistema de Diseño (los cimientos) y la Gestión de Archivos (la entrada de datos).

🏗️ BLOQUE 01: Sistema de Diseño "Cristal Líquido 2026"
Este bloque es el "Libro de Estilo" que gobernará toda la aplicación. Sin esto, la IA podría generar interfaces inconsistentes.

PROMPT PARA BLOQUE 01 (Copia y pega esto):
CONTEXTO DE ROL: Actúa como un Lead Design System Engineer en una agencia de diseño premium en 2026. Tu misión es codificar el sistema de diseño "Cristal Líquido" para la plataforma 'Foto Fachada V2'.

REQUISITOS ESTÉTICOS (ESPECIFICACIONES TÉCNICAS):

Filosofía Visual: Implementa un Glassmorphism de nueva generación. Los fondos deben usar backdrop-blur de entre 20px y 45px, con un color de fondo rgba(255, 255, 255, 0.4) para modo claro y rgba(0, 0, 0, 0.4) para modo oscuro.

Geometría: Las curvas de los contenedores principales deben ser de 32px a 48px. Nada de esquinas afiladas.

Bordes: Define un 'Borde de Cristal' mediante un anillo interno (ring) de 1px con opacidad del 20% para simular el biselado del vidrio.

Tipografía: Configura un sistema de fuentes variables. Títulos en 'Extra-Bold' con un interletrado (letter-spacing) de -0.05em. Cuerpo de texto en 'Regular' con interletrado óptico para máxima legibilidad en móviles.

LÓGICA DE MOVIMIENTO (FRAMER MOTION):

Todas las transiciones deben usar físicas de muelle (spring). Parámetros: stiffness: 260, damping: 20, mass: 1.

Prohibido el uso de opacidad simple (fade-in). Usa layoutId para que los elementos "vuelen" de una posición a otra de forma orgánica.

RESTRICCIÓN IDIOMÁTICA Y NOMENCLATURA:

El código no debe contener ni una sola palabra en inglés en los comentarios o en el nombre de las variables de diseño.

Ejemplo: En lugar de primaryColor, usa colorPrimario. En lugar de borderRadius, usa curvaturaBorde.

ENTREGABLE: Genera el archivo tailwind.config.js extendido con estos tokens y un archivo ComponentesBase.jsx que incluya: ContenedorCristal, BotonPrimario, TipografiaH1 y TarjetaInteractiva.

📸 BLOQUE 02: Gestión de Activos Multimedia (Subida y Galería)
Este bloque maneja la entrada de datos: fotos y videos de interiores o exteriores, asegurando que la IA tenga material de alta calidad para trabajar.

PROMPT PARA BLOQUE 02 (Copia y pega esto):
CONTEXTO DE ROL: Actúa como un Arquitecto de Infraestructura Frontend experto en manejo de medios masivos.

ESPECIFICACIONES DE SUBIDA (INPUT):

Formatos Soportados: Implementa una lógica de validación estricta para imágenes (WebP, AVIF, PNG, JPG) y videos (MP4, MOV, WebM).

Límites de Peso: Máximo 15MB para fotos (con compresión en el cliente a 2000px de ancho) y 100MB para videos.

Categorización Inteligente: El sistema debe preguntar al usuario mediante un selector de cristal: "¿Qué estamos viendo?" con opciones: 'Fachada Principal (Exterior)', 'Ambiente (Interior)', 'Producto Detalle' o 'Video de Ambiente'.

INTERFAZ DE CARGA (UI/UX):

Crea una zona de "Dropzone" que sea un portal visual. Al arrastrar un archivo, el fondo debe reaccionar con un pulso de luz radial.

Muestra una barra de progreso circular integrada en la tarjeta del archivo que se está subiendo.

GALERÍA DEL DASHBOARD (TORRE DE CONTROL):

Diseña una rejilla tipo 'Masonry' (estilo Pinterest) pero con estética de cristal.

Cada archivo debe tener una previsualización inteligente: los videos se reproducen en 'hover' (o al mantener pulsado en móvil) sin sonido.

Botones de acción rápidos en cada tarjeta: 'Analizar ADN', 'Eliminar' y 'Establecer como Portada'.

TECNOLOGÍA REQUERIDA:

Usa react-dropzone para la lógica y Cloudinary o Vercel Blob como sugerencia de almacenamiento, pero implementa toda la gestión de estados con React Context o Zustand en ESPAÑOL (ej: estadoArchivos, subirImagen).

RESTRICCIÓN: Prohibido el uso de términos ingleses en la interfaz de usuario. En lugar de "Upload successful", debe decir "Activo guardado con éxito".

¿He capturado la esencia y el nivel de detalle que buscas para estos dos bloques? Si es así, dime "CONTINUAR" para redactar los prompts de los Bloques 03 (Análisis de Negocio) y 04 (Landing Escaparate).

Has dicho
solo 1 bloque por mensaje, incluye la mayor cantidad de indicaciones posibles para que el desarrollo sea perfeto y sin errores, por eso si para un bloque necesitas varios mensajes, usalos, pero como minimo tiene que ser 1 por bloque y utilizando la mayor cantidad posible de recursos que tengas a tu disposicion. vuelve a empezar y reescribe el bloque 1

Gemini ha dicho
Entendido, mensaje recibido. Como Arquitecto Jefe, voy a elevar el nivel de detalle al máximo exponente. No estamos redactando un simple prompt; estamos definiendo el Pliego de Prescripciones Técnicas y Creativas que obligará a la IA a no cometer errores de interpretación.

Vamos a reconstruir el Bloque 1 con una profundidad técnica absoluta.

🏛️ BLOQUE 01: El ADN Visual "Cristal Líquido 2026" (Sistema de Diseño)
Este bloque es la base atómica. Si este bloque falla, la interfaz generativa no tendrá coherencia. El objetivo es crear un motor de diseño donde cada propiedad sea una variable que la IA pueda manipular según el "Vibe" del negocio analizado.

PROMPT MAESTRO - PARTE 1/1: Ingeniería de Diseño y Tokens de Interfaz
ROL: Actúa como un Principal Design Systems Engineer experto en interfaces de alto rendimiento y estética de vanguardia (año 2026).

OBJETIVO: Construir el núcleo de diseño de "Foto Fachada V2". Este sistema debe ser hiper-modular, basado en variables y preparado para ser manipulado por una IA que inyectará estilos en tiempo real.

1. ESPECIFICACIONES DE TAILWIND CSS (Configuración Maestra):
Genera un archivo configuracion.tailwind.js (en español) que extienda los siguientes tokens:

Paleta Fluida: No definas colores estáticos. Define una estructura de coloresDeMarca que acepte: principal, secundario, acento, superficie y fondo.

Efectos de Cristal (Vidrio):

cristal-ligero: background: 40% opacidad, backdrop-blur: 20px, border: 1px white 20%.

cristal-profundo: background: 60% opacidad, backdrop-blur: 40px, border: 1px white 10%.

cristal-oscuro: background: 30% black, backdrop-blur: 30px, border: 1px white 5%.

Geometría Orgánica: Curvaturas (Border Radius) ultra-suavizadas: extra-redondeado: 32px, esfera: 48px, pildora: 9999px.

Sombras Multicapa: Crea una sombra llamada profundidad-3d que use tres niveles de box-shadow para simular elevación real sobre el cristal.

2. ARQUITECTURA DE COMPONENTES (React + Framer Motion):
Crea los siguientes componentes base asegurando que todas las variables y comentarios estén en ESPAÑOL:

<ContenedorCristal />: Un wrapper que aplique los efectos de desenfoque y bordes. Debe aceptar una prop intensidad (ligero/profundo).

<BotonInteractiva />: Botón con animaciones elásticas. Al hacer 'tap', debe reducir su escala a 0.95 y al soltar, rebotar a 1.05 antes de estabilizarse.

<Tipografia />: Un componente dinámico que gestione el 'interletrado óptico'. Si es un título (H1), el espaciado entre letras es -0.05em. Si es cuerpo, es normal.

3. MOTOR DE ANIMACIÓN (Framer Motion - Constantes):
Define un objeto de configuración de transiciones llamado fisicasGlobales:

tipo: "spring"

rigidez: 300

amortiguacion: 25

masa: 0.8

permitirRebote: true

4. REGLAS CRÍTICAS DE DESARROLLO:

Cero Inglés: Todas las variables internas, nombres de funciones, clases personalizadas y comentarios deben estar en español (Ej: const [estaCargando, establecerEstaCargando] = useState(false)).

Accesibilidad 2026: El sistema debe detectar automáticamente si el fondo es muy claro para oscurecer el texto mediante un algoritmo de contraste dinámico.

Mobile-First Total: Los componentes deben estar optimizados para zonas de interacción del pulgar (mínimo 44px de altura para cualquier elemento clicable).

ENTREGABLE: Proporciona el código completo del archivo de configuración y la librería de componentes base lista para ser importada en Next.js.

Este prompt asegura que el sistema de diseño sea una roca técnica. ¿Deseas que pase al BLOQUE 02: Gestión de Archivos y Galería Inteligente, o quieres ajustar algún parámetro visual de este bloque