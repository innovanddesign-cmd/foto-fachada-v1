/**
 * UI Schema Generator - Motor de Generación de Componentes
 * Construye estructuras de escaparate únicas basadas en el análisis de marca
 * 
 * Características:
 * - Generación dinámica (sin plantillas fijas)
 * - 17 tipos de componentes disponibles
 * - Config fields automáticos por componente
 * - Variabilidad garantizada entre ejecuciones
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
    UISchema,
    UIComponent,
    UIComponentType,
    UIConfigField,
    BrandIdentity2026,
    BrandData
} from '../types';

// ─────────────────────────────────────────────────────────────
// CONFIGURACIÓN
// ─────────────────────────────────────────────────────────────

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// ─────────────────────────────────────────────────────────────
// CATÁLOGO DE COMPONENTES
// ─────────────────────────────────────────────────────────────

/** Definición de campos de configuración por tipo de componente */
const COMPONENT_CONFIG_FIELDS: Record<UIComponentType, UIConfigField[]> = {
    HeroVideoBackground: [
        { key: 'titulo_hero', label: 'Título Principal', type: 'text', placeholder: 'Ej: Bienvenido a tu rincón favorito', required: true },
        { key: 'texto_cta', label: 'Texto del Botón', type: 'text', placeholder: 'Ej: Ver Carta', required: true },
        { key: 'imagen_fondo', label: 'Imagen o Video de Fondo', type: 'file', placeholder: 'Sube tu imagen', required: false }
    ],
    HeroGradient: [
        { key: 'titulo_hero', label: 'Título Principal', type: 'text', placeholder: 'Ej: Descubre nuestro mundo', required: true },
        { key: 'subtitulo', label: 'Subtítulo', type: 'textarea', placeholder: 'Descripción breve del negocio', required: false }
    ],
    FlashCard_Offer: [
        { key: 'nombre_oferta', label: 'Nombre de la Oferta', type: 'text', placeholder: 'Ej: Menú del Día', required: true },
        { key: 'descuento', label: 'Descuento o Precio', type: 'text', placeholder: 'Ej: 15% dto. o 12,95€', required: true },
        { key: 'tiempo_limite', label: 'Tiempo Límite', type: 'text', placeholder: 'Ej: Válido hasta las 16:00', required: false },
        { key: 'imagen_oferta', label: 'Imagen del Producto', type: 'file', placeholder: 'Foto del producto', required: false }
    ],
    Instagram_Feed_Style: [
        { key: 'usuario_instagram', label: 'Usuario de Instagram', type: 'text', placeholder: '@tunegocio', required: true }
    ],
    Menu_Categories: [
        { key: 'categorias', label: 'Categorías del Menú', type: 'list', placeholder: 'Entrantes, Principales, Postres...', required: true },
        { key: 'url_carta', label: 'Enlace a Carta Completa', type: 'url', placeholder: 'https://...', required: false }
    ],
    Contact_Glass: [
        { key: 'telefono', label: 'Teléfono', type: 'tel', placeholder: '+34 600 000 000', required: false },
        { key: 'whatsapp', label: 'WhatsApp', type: 'tel', placeholder: '+34 600 000 000', required: false },
        { key: 'email', label: 'Correo Electrónico', type: 'text', placeholder: 'info@tunegocio.com', required: false }
    ],
    Location_Map: [
        { key: 'direccion', label: 'Dirección Completa', type: 'textarea', placeholder: 'Calle Mayor 1, 03500 Benidorm', required: true },
        { key: 'enlace_maps', label: 'Enlace a Google Maps', type: 'url', placeholder: 'https://maps.google.com/...', required: false }
    ],
    Reviews_Carousel: [
        { key: 'fuente_resenas', label: 'Fuente de Reseñas', type: 'text', placeholder: 'Google, TripAdvisor...', required: false, default: 'Google' }
    ],
    Gallery_Masonry: [
        { key: 'imagenes_galeria', label: 'Imágenes de Galería', type: 'file', placeholder: 'Sube múltiples fotos', required: false }
    ],
    Banner_Promocional: [
        { key: 'texto_banner', label: 'Texto del Banner', type: 'text', placeholder: '¡Oferta especial esta semana!', required: true },
        { key: 'precio_promocion', label: 'Precio Promocional', type: 'text', placeholder: '9,95€', required: false },
        { key: 'enlace_banner', label: 'Enlace del Banner', type: 'url', placeholder: 'https://...', required: false }
    ],
    Reservations_CTA: [
        { key: 'texto_reserva', label: 'Texto del Botón', type: 'text', placeholder: 'Reservar Mesa', required: true, default: 'Reservar Mesa' },
        { key: 'url_reservas', label: 'Enlace de Reservas', type: 'url', placeholder: 'https://...', required: false }
    ],
    Social_Links: [
        { key: 'instagram', label: 'Instagram', type: 'url', placeholder: 'https://instagram.com/...', required: false },
        { key: 'facebook', label: 'Facebook', type: 'url', placeholder: 'https://facebook.com/...', required: false },
        { key: 'tiktok', label: 'TikTok', type: 'url', placeholder: 'https://tiktok.com/...', required: false }
    ],
    Services_Grid: [
        { key: 'servicios', label: 'Lista de Servicios', type: 'list', placeholder: 'Corte, Peinado, Coloración...', required: true }
    ],
    Team_Showcase: [
        { key: 'miembros_equipo', label: 'Miembros del Equipo', type: 'list', placeholder: 'María (Estilista), Juan (Barbero)...', required: false }
    ],
    FAQ_Accordion: [
        { key: 'preguntas_frecuentes', label: 'Preguntas Frecuentes', type: 'list', placeholder: '¿Aceptáis reservas? | ¿Tenéis aparcamiento?', required: false }
    ],
    Testimonials_Wall: [
        { key: 'testimonios', label: 'Testimonios', type: 'list', placeholder: 'Nombre: Comentario', required: false }
    ],
    WhatsApp_Float: [
        { key: 'numero_whatsapp', label: 'Número de WhatsApp', type: 'tel', placeholder: '+34 600 000 000', required: true },
        { key: 'mensaje_inicial', label: 'Mensaje Inicial', type: 'text', placeholder: 'Hola, me gustaría...', required: false, default: 'Hola, me interesa conocer más sobre vuestros servicios' }
    ],
    Testimonials_Carousel: [
        { key: 'fuente_testimonios', label: 'Fuente', type: 'text', placeholder: 'Google Reviews', required: false, default: 'Google Reviews' }
    ],
    Event_Calendar: [
        { key: 'url_calendario', label: 'Enlace al Calendario', type: 'url', placeholder: 'https://calendly.com/...', required: true }
    ],
    Spacer: [
        { key: 'altura', label: 'Altura del espacio', type: 'text', placeholder: 'Pequeño, Medio, Grande', required: false, default: 'Medio' }
    ],
    Footer_Simple: [
        { key: 'texto_copyright', label: 'Texto Copyright', type: 'text', placeholder: '© 2026 Mi Negocio', required: false }
    ]
};

// ─────────────────────────────────────────────────────────────
// GENERADOR DE UI SCHEMA
// ─────────────────────────────────────────────────────────────

export interface UISchemaResponse {
    success: boolean;
    schema?: UISchema;
    error?: string;
}

/**
 * Genera un UI Schema completo basado en la identidad de marca
 */
export async function generateUISchema(
    identity: BrandIdentity2026,
    brandData: BrandData
): Promise<UISchemaResponse> {
    try {
        if (!genAI) {
            console.log('[UISchema] Sin API key, usando schema mock');
            await new Promise(resolve => setTimeout(resolve, 800));
            return getMockUISchema(identity, brandData);
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `Eres un Arquitecto de Experiencias Digitales Senior. Diseña la interfaz de un Escaparate Digital para este negocio.
NO USES PLANTILLAS. Genera una composición única basada en el ADN de la marca.

DATOS DEL NEGOCIO:
- Nombre: ${brandData.name}
- Tipo: ${brandData.businessType}
- Nicho: ${brandData.niche || 'general'}
- Vibe de Diseño: ${identity.vibe} (Estilo 2026)
- Público Objetivo: ${brandData.targetAudience}

ESTRATEGIA DE COMPOSICIÓN (Selecciona una aleatoriamente para garantizar variedad):
1. Transaccional (Foco en ofertas y precios)
2. Branding (Foco en historia, estética y calidad)
3. Social (Foco en comunidad, reseñas y equipo)

INSTRUCCIONES DE DISEÑO:
1. Selecciona entre 5 y 8 componentes de la lista disponible.
2. ORDEN LÓGICO:
   - Siempre empieza con un Hero de alto impacto.
   - Alterna entre contenido visual, texto y llamadas a la acción.
   - Termina con elementos de confianza o contacto.
3. COPYWRITING (CRÍTICO):
   - Usa Español de España (castellano).
   - Tono: ${identity.tono_copywriting}.
   - Evita clichés como "Bienvenidos" o "Nuestros servicios".
   - Usa verbos de acción y beneficios ("Descubre", "Siente", "Disfruta").

COMPONENTES DISPONIBLES:
${Object.keys(COMPONENT_CONFIG_FIELDS).map(c => `- ${c}`).join('\n')}

SALIDA JSON ESTRICTA:
Devuelve un array de objetos "components":
[
    {
        "type": "TipoDeComponente exacto",
        "content": {
            "titulo": "Copy creativo IA",
            "subtitulo": "Copy de apoyo IA",
            "cta": "Texto botón acción",
             // Otros campos según el componente...
        }
    }
]`;

        const result = await model.generateContent([prompt]);
        const response = await result.response;
        const text = response.text();

        // Parsear respuesta con robustez
        const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        let parsedData;
        try {
            parsedData = JSON.parse(cleanedText);
        } catch (e) {
            console.error('[UISchema] Error parseando JSON:', e);
            throw new Error('Formato JSON inválido de IA');
        }

        // Manejar si devuelve { "components": [...] } o directamente [...]
        const rawComponents = Array.isArray(parsedData) ? parsedData : (parsedData.components || []);

        if (!Array.isArray(rawComponents) || rawComponents.length === 0) {
            throw new Error('Estructura de componentes inválida');
        }

        // Construir UIComponents con config_fields
        const components: UIComponent[] = rawComponents.map((raw: { type: UIComponentType; content: Record<string, string> }, index: number) => ({
            id: `${raw.type ? raw.type.toLowerCase() : 'component'}_${String(index + 1).padStart(2, '0')}`,
            type: raw.type as UIComponentType,
            content: raw.content || {},
            config_fields: COMPONENT_CONFIG_FIELDS[raw.type as UIComponentType] || [],
            order: index + 1,
            visible: true
        }));

        const schema: UISchema = {
            brand_identity: identity,
            escaparate_structure: components,
            generated_at: new Date().toISOString(),
            version: 1,
            variability_seed: Math.random().toString(36).substring(7)
        };

        return { success: true, schema };

    } catch (error) {
        console.error('[UISchema] Error:', error);
        // Fallback a mock
        return getMockUISchema(identity, brandData);
    }
}

// ─────────────────────────────────────────────────────────────
// SCHEMAS MOCK
// ─────────────────────────────────────────────────────────────

/**
 * Genera un schema mock con variabilidad
 */
export function getMockUISchema(identity: BrandIdentity2026, brandData: BrandData): UISchemaResponse {
    // Seed para variabilidad
    const seed = Math.random();
    const variabilitySeed = seed.toString(36).substring(7);

    // Seleccionar componentes basados en tipo de negocio y seed
    const businessType = brandData.businessType?.toLowerCase() || '';
    let selectedComponentTypes: UIComponentType[];

    if (businessType.includes('bar') || businessType.includes('restaurante') || businessType.includes('café')) {
        // Hostelería
        selectedComponentTypes = seed > 0.5
            ? ['HeroVideoBackground', 'FlashCard_Offer', 'Menu_Categories', 'Gallery_Masonry', 'Contact_Glass', 'WhatsApp_Float']
            : ['HeroGradient', 'Banner_Promocional', 'Reviews_Carousel', 'Location_Map', 'Social_Links', 'Reservations_CTA'];
    } else if (businessType.includes('peluquería') || businessType.includes('salón') || businessType.includes('barbería')) {
        // Servicios de belleza
        selectedComponentTypes = seed > 0.5
            ? ['HeroVideoBackground', 'Services_Grid', 'Team_Showcase', 'Gallery_Masonry', 'Contact_Glass', 'WhatsApp_Float']
            : ['HeroGradient', 'Services_Grid', 'Reviews_Carousel', 'Instagram_Feed_Style', 'Reservations_CTA'];
    } else if (businessType.includes('spa') || businessType.includes('wellness') || businessType.includes('gimnasio')) {
        // Bienestar
        selectedComponentTypes = seed > 0.5
            ? ['HeroVideoBackground', 'Services_Grid', 'Testimonials_Wall', 'FAQ_Accordion', 'Contact_Glass']
            : ['HeroGradient', 'Gallery_Masonry', 'Team_Showcase', 'Reviews_Carousel', 'WhatsApp_Float'];
    } else {
        // Genérico
        selectedComponentTypes = seed > 0.5
            ? ['HeroVideoBackground', 'Services_Grid', 'Gallery_Masonry', 'Contact_Glass', 'Social_Links']
            : ['HeroGradient', 'Reviews_Carousel', 'Location_Map', 'FAQ_Accordion', 'WhatsApp_Float'];
    }

    // Generar contenido para cada componente
    const components: UIComponent[] = selectedComponentTypes.map((type, index) => {
        const content = generateMockContent(type, brandData, identity);
        return {
            id: `${type.toLowerCase()}_${String(index + 1).padStart(2, '0')}`,
            type,
            content,
            config_fields: COMPONENT_CONFIG_FIELDS[type] || [],
            order: index + 1,
            visible: true
        };
    });

    const schema: UISchema = {
        brand_identity: identity,
        escaparate_structure: components,
        generated_at: new Date().toISOString(),
        version: 1,
        variability_seed: variabilitySeed
    };

    return { success: true, schema };
}

/**
 * Genera contenido mock para un componente específico
 */
function generateMockContent(type: UIComponentType, brandData: BrandData, identity: BrandIdentity2026): Record<string, string> {
    const name = brandData.name || 'Tu Negocio';

    const contentByType: Record<UIComponentType, Record<string, string>> = {
        HeroVideoBackground: {
            titulo: `Vive la experiencia ${name}`,
            cta: 'Descubre Más',
            subtitulo: identity.tagline_sugerido
        },
        HeroGradient: {
            titulo: `Bienvenido a ${name}`,
            subtitulo: brandData.tagline || 'Tu destino favorito te espera'
        },
        FlashCard_Offer: {
            titulo_oferta: '¡Oferta del Día!',
            descripcion: 'Aprovecha nuestras promociones especiales',
            precio: 'Desde 9,95€'
        },
        Instagram_Feed_Style: {
            titulo: 'Síguenos en Instagram',
            usuario: '@' + name.toLowerCase().replace(/\s+/g, '')
        },
        Menu_Categories: {
            titulo: 'Nuestra Carta',
            descripcion: 'Descubre nuestras especialidades'
        },
        Contact_Glass: {
            titulo: 'Contáctanos',
            subtitulo: 'Estamos aquí para ayudarte'
        },
        Location_Map: {
            titulo: 'Encuéntranos',
            direccion: brandData.address || 'Visítanos en nuestro local'
        },
        Reviews_Carousel: {
            titulo: 'Lo Que Dicen Nuestros Clientes',
            subtitulo: 'Opiniones verificadas'
        },
        Gallery_Masonry: {
            titulo: 'Galería',
            subtitulo: 'Un vistazo a nuestro espacio'
        },
        Banner_Promocional: {
            texto: '¡Promoción Especial Esta Semana!',
            cta: 'Ver Ofertas'
        },
        Reservations_CTA: {
            titulo: '¿Listo para visitarnos?',
            texto_boton: 'Reservar Ahora'
        },
        Social_Links: {
            titulo: 'Síguenos',
            subtitulo: 'No te pierdas ninguna novedad'
        },
        Services_Grid: {
            titulo: 'Nuestros Servicios',
            subtitulo: 'Todo lo que necesitas en un solo lugar'
        },
        Team_Showcase: {
            titulo: 'Nuestro Equipo',
            subtitulo: 'Profesionales apasionados'
        },
        FAQ_Accordion: {
            titulo: 'Preguntas Frecuentes',
            subtitulo: 'Resolvemos tus dudas'
        },
        Testimonials_Wall: {
            titulo: 'Testimonios',
            subtitulo: 'Experiencias reales'
        },
        WhatsApp_Float: {
            mensaje: '¡Hola! Me gustaría más información sobre ' + name
        },
        Testimonials_Carousel: {
            titulo: 'Lo que dicen de nosotros',
            subtitulo: 'Clientes felices'
        },
        Event_Calendar: {
            titulo: 'Próximos Eventos',
            subtitulo: 'No te lo pierdas'
        },
        Spacer: {
            // Sin contenido visible
        },
        Footer_Simple: {
            texto: `© ${new Date().getFullYear()} ${name}. Todos los derechos reservados.`
        }
    };

    return contentByType[type] || { titulo: name };
}

/**
 * Obtiene los campos de configuración para un tipo de componente
 */
export function getConfigFieldsForComponent(type: UIComponentType): UIConfigField[] {
    return COMPONENT_CONFIG_FIELDS[type] || [];
}

/**
 * Valida que todos los componentes tengan sus config_fields
 */
export function validateSchemaIntegrity(schema: UISchema): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const component of schema.escaparate_structure) {
        if (!component.config_fields || component.config_fields.length === 0) {
            errors.push(`Componente ${component.id} sin config_fields`);
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Verifica que no haya textos en inglés en el schema
 */
export function validateSpanishLanguage(schema: UISchema): { valid: boolean; englishWords: string[] } {
    const englishWords: string[] = [];
    const forbiddenWords = ['discount', 'price', 'location', 'contact', 'menu', 'book', 'reserve', 'welcome'];

    const checkObject = (obj: unknown, path: string) => {
        if (typeof obj === 'string') {
            forbiddenWords.forEach(word => {
                if (obj.toLowerCase().includes(word)) {
                    englishWords.push(`${path}: "${obj}" contiene "${word}"`);
                }
            });
        } else if (typeof obj === 'object' && obj !== null) {
            Object.entries(obj).forEach(([key, value]) => {
                checkObject(value, `${path}.${key}`);
            });
        }
    };

    checkObject(schema, 'schema');

    return {
        valid: englishWords.length === 0,
        englishWords
    };
}
