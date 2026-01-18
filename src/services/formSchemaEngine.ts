/**
 * Form Schema Engine
 * ===================
 * Transforma el UI Schema generativo en grupos de campos de formulario.
 * Implementa introspección dinámica para crear formularios adaptativos.
 */

import type { UISchema, UIComponentType, UIConfigField } from '../types';

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────

export interface FormGroup {
    component_id: string;
    component_type: UIComponentType;
    title: string;           // Título en español
    description: string;     // Descripción del grupo
    icon: string;            // Emoji para visual
    fields: UIConfigField[];
    order: number;
}

export interface FormStep {
    id: string;
    title: string;
    icon: string;
    groups: FormGroup[];
}

export interface AdaptiveFormSchema {
    steps: FormStep[];
    total_fields: number;
    uses_stepper: boolean;   // true si hay +4 componentes
}

// ─────────────────────────────────────────────────────────────
// MAPEO DE COMPONENTES A TÍTULOS Y DESCRIPCIONES
// ─────────────────────────────────────────────────────────────

const COMPONENT_META: Record<UIComponentType, { title: string; description: string; icon: string; category: 'identity' | 'products' | 'contact' | 'social' }> = {
    'HeroVideoBackground': {
        title: 'Cabecera Principal',
        description: 'El primer impacto visual de tu escaparate',
        icon: '🎬',
        category: 'identity'
    },
    'HeroGradient': {
        title: 'Cabecera con Gradiente',
        description: 'Encabezado con colores de tu marca',
        icon: '🌈',
        category: 'identity'
    },
    'FlashCard_Offer': {
        title: 'Oferta Destacada',
        description: 'Promoción llamativa para tus clientes',
        icon: '🏷️',
        category: 'products'
    },
    'Instagram_Feed_Style': {
        title: 'Galería Estilo Instagram',
        description: 'Muestra tus mejores fotos',
        icon: '📸',
        category: 'social'
    },
    'Menu_Categories': {
        title: 'Categorías de Menú',
        description: 'Organiza tus productos o servicios',
        icon: '📋',
        category: 'products'
    },
    'Contact_Glass': {
        title: 'Datos de Contacto',
        description: 'Cómo pueden encontrarte tus clientes',
        icon: '📞',
        category: 'contact'
    },
    'Location_Map': {
        title: 'Ubicación',
        description: 'Dónde encontrar tu negocio',
        icon: '📍',
        category: 'contact'
    },
    'Reviews_Carousel': {
        title: 'Reseñas de Clientes',
        description: 'Opiniones que generan confianza',
        icon: '⭐',
        category: 'social'
    },
    'Gallery_Masonry': {
        title: 'Galería de Imágenes',
        description: 'Fotos de tu local o productos',
        icon: '🖼️',
        category: 'products'
    },
    'Banner_Promocional': {
        title: 'Banner Promocional',
        description: 'Destaca una promoción especial',
        icon: '🎯',
        category: 'products'
    },
    'Reservations_CTA': {
        title: 'Botón de Reservas',
        description: 'Permite a tus clientes reservar',
        icon: '📅',
        category: 'contact'
    },
    'Social_Links': {
        title: 'Redes Sociales',
        description: 'Conecta con tus seguidores',
        icon: '🔗',
        category: 'social'
    },
    'Services_Grid': {
        title: 'Servicios',
        description: 'Lista de servicios que ofreces',
        icon: '✨',
        category: 'products'
    },
    'Team_Showcase': {
        title: 'Equipo',
        description: 'Presenta a tu equipo',
        icon: '👥',
        category: 'identity'
    },
    'FAQ_Accordion': {
        title: 'Preguntas Frecuentes',
        description: 'Resuelve dudas comunes',
        icon: '❓',
        category: 'contact'
    },
    'Testimonials_Wall': {
        title: 'Testimonios',
        description: 'Lo que dicen tus clientes',
        icon: '💬',
        category: 'social'
    },
    'WhatsApp_Float': {
        title: 'Botón de WhatsApp',
        description: 'Contacto directo por WhatsApp',
        icon: '💬',
        category: 'contact'
    },
    'Testimonials_Carousel': {
        title: 'Muro de Testimonios',
        description: 'Muestra lo que dicen tus clientes',
        icon: '🌟',
        category: 'social'
    },
    'Event_Calendar': {
        title: 'Calendario de Eventos',
        description: 'Promociona tus próximas actividades',
        icon: '📅',
        category: 'social'
    },
    'Spacer': {
        title: 'Espaciador',
        description: 'Separación visual entre secciones',
        icon: '⬍',
        category: 'identity'
    },
    'Footer_Simple': {
        title: 'Pie de Página',
        description: 'Copyright y legal',
        icon: '👣',
        category: 'identity'
    }
};

// ─────────────────────────────────────────────────────────────
// CAMPOS ADICIONALES POR TIPO DE COMPONENTE
// (Cuando el UI Schema no tiene config_fields definidos)
// ─────────────────────────────────────────────────────────────

const DEFAULT_FIELDS: Record<UIComponentType, UIConfigField[]> = {
    'HeroVideoBackground': [
        { key: 'titulo', label: 'Título Principal', type: 'text', placeholder: 'Escribe el nombre de tu negocio', required: true },
        { key: 'subtitulo', label: 'Subtítulo', type: 'text', placeholder: 'Ej: Los mejores sabores de Benidorm', required: false }
    ],
    'HeroGradient': [
        { key: 'titulo', label: 'Título Principal', type: 'text', placeholder: 'Tu negocio', required: true },
        { key: 'subtitulo', label: 'Lema o Subtítulo', type: 'text', placeholder: 'Tu lema aquí', required: false }
    ],
    'FlashCard_Offer': [
        { key: 'producto', label: 'Nombre del Producto', type: 'text', placeholder: 'Ej: Menú del día', required: true },
        { key: 'precio_original', label: 'Precio Original', type: 'number', placeholder: '12.99', required: false },
        { key: 'precio_oferta', label: 'Precio Oferta', type: 'number', placeholder: '9.99', required: true },
        { key: 'descripcion', label: 'Descripción Corta', type: 'textarea', placeholder: 'Incluye...', required: false }
    ],
    'Instagram_Feed_Style': [
        { key: 'usuario_instagram', label: 'Usuario de Instagram', type: 'text', placeholder: '@tunegocio', required: true }
    ],
    'Menu_Categories': [
        { key: 'categorias', label: 'Categorías (una por línea)', type: 'textarea', placeholder: 'Entrantes\nPlatos principales\nPostres', required: true }
    ],
    'Contact_Glass': [
        { key: 'whatsapp', label: 'Número de WhatsApp', type: 'tel', placeholder: '+34 600 123 456', required: true },
        { key: 'mensaje_whatsapp', label: 'Mensaje Predeterminado', type: 'textarea', placeholder: 'Hola, quiero más información...', required: false, default: 'Hola, quiero aprovechar la oferta que he visto en vuestro escaparate digital' },
        { key: 'email', label: 'Correo Electrónico', type: 'text', placeholder: 'contacto@tunegocio.com', required: false }
    ],
    'Location_Map': [
        { key: 'direccion', label: 'Dirección Completa', type: 'text', placeholder: 'Calle Ejemplo 123, Benidorm', required: true },
        { key: 'horario', label: 'Horario de Apertura', type: 'text', placeholder: 'L-V: 9:00-20:00', required: false }
    ],
    'Reviews_Carousel': [
        { key: 'url_google', label: 'Enlace a Google Reviews', type: 'url', placeholder: 'https://g.page/tunegocio/review', required: false },
        { key: 'url_tripadvisor', label: 'Enlace a TripAdvisor', type: 'url', placeholder: 'https://tripadvisor.com/...', required: false }
    ],
    'Gallery_Masonry': [
        { key: 'imagenes', label: 'Imágenes (URLs separadas por línea)', type: 'textarea', placeholder: 'https://ejemplo.com/foto1.jpg', required: false }
    ],
    'Banner_Promocional': [
        { key: 'texto_banner', label: 'Texto del Banner', type: 'text', placeholder: '¡Oferta limitada!', required: true },
        { key: 'enlace_cta', label: 'Enlace del Botón', type: 'url', placeholder: 'https://...', required: false }
    ],
    'Reservations_CTA': [
        { key: 'url_reservas', label: 'Enlace de Reservas', type: 'url', placeholder: 'https://reservas.tunegocio.com', required: false },
        { key: 'telefono_reservas', label: 'Teléfono para Reservas', type: 'tel', placeholder: '+34 912 345 678', required: true }
    ],
    'Social_Links': [
        { key: 'instagram', label: 'Instagram', type: 'text', placeholder: '@tunegocio', required: false },
        { key: 'facebook', label: 'Facebook', type: 'url', placeholder: 'https://facebook.com/tunegocio', required: false },
        { key: 'tiktok', label: 'TikTok', type: 'text', placeholder: '@tunegocio', required: false }
    ],
    'Services_Grid': [
        { key: 'servicios', label: 'Servicios (uno por línea)', type: 'textarea', placeholder: 'Corte de pelo\nTinte\nMechas', required: true }
    ],
    'Team_Showcase': [
        { key: 'miembros', label: 'Nombres del Equipo', type: 'textarea', placeholder: 'María - Directora\nJuan - Chef', required: false }
    ],
    'FAQ_Accordion': [
        { key: 'preguntas', label: 'Preguntas y Respuestas', type: 'textarea', placeholder: '¿Aceptáis reservas?\nSí, llama al...', required: false }
    ],
    'Testimonials_Wall': [
        { key: 'testimonios', label: 'Testimonios de Clientes', type: 'textarea', placeholder: '"Excelente servicio" - María G.', required: false }
    ],
    'WhatsApp_Float': [
        { key: 'whatsapp', label: 'Número de WhatsApp', type: 'tel', placeholder: '+34 600 123 456', required: true },
        { key: 'mensaje_bienvenida', label: 'Mensaje de Bienvenida', type: 'textarea', placeholder: '¡Hola! ¿En qué podemos ayudarte?', required: false, default: '¡Hola! He visto tu escaparate digital y me gustaría más información' }
    ],
    'Testimonials_Carousel': [
        { key: 'fuente', label: 'Fuente de Testimonios', type: 'text', placeholder: 'Google Reviews', required: false, default: 'Google Reviews' }
    ],
    'Event_Calendar': [
        { key: 'url_calendario', label: 'URL del Calendario', type: 'url', placeholder: 'https://calendly.com/...', required: true }
    ],
    'Spacer': [
        { key: 'altura', label: 'Altura', type: 'text', placeholder: 'Normal', required: false, default: 'Normal' }
    ],
    'Footer_Simple': [
        { key: 'copyright', label: 'Texto Copyright', type: 'text', placeholder: '© 2026 Mi Negocio', required: false }
    ]
};

// ─────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL: TRANSFORMAR UI SCHEMA EN FORMULARIO
// ─────────────────────────────────────────────────────────────

/**
 * Transforma un UISchema en un AdaptiveFormSchema listo para renderizar
 */
export function schemaToFormSchema(schema: UISchema): AdaptiveFormSchema {
    const groups: FormGroup[] = [];

    // Iterar sobre cada componente del escaparate
    schema.escaparate_structure.forEach((component) => {
        const meta = COMPONENT_META[component.type];
        if (!meta) return;

        // Usar config_fields del componente, o los defaults si no existen
        const fields = component.config_fields?.length > 0
            ? component.config_fields
            : DEFAULT_FIELDS[component.type] || [];

        // Mezclar defaults con content pre-generado
        const enrichedFields = fields.map(field => ({
            ...field,
            default: component.content?.[field.key] || field.default || ''
        }));

        groups.push({
            component_id: component.id,
            component_type: component.type,
            title: meta.title,
            description: meta.description,
            icon: meta.icon,
            fields: enrichedFields,
            order: component.order
        });
    });

    // Ordenar por orden del componente
    groups.sort((a, b) => a.order - b.order);

    // Decidir si usar stepper
    const usesStepper = groups.length > 4;
    const totalFields = groups.reduce((sum, g) => sum + g.fields.length, 0);

    if (usesStepper) {
        // Dividir en pasos por categoría
        const steps = groupByCategory(groups);
        return { steps, total_fields: totalFields, uses_stepper: true };
    } else {
        // Un solo paso con todos los grupos
        return {
            steps: [{
                id: 'all',
                title: 'Configuración',
                icon: '⚙️',
                groups
            }],
            total_fields: totalFields,
            uses_stepper: false
        };
    }
}

/**
 * Agrupa los grupos por categoría para crear pasos
 */
function groupByCategory(groups: FormGroup[]): FormStep[] {
    const categoryGroups: Record<string, FormGroup[]> = {
        identity: [],
        products: [],
        contact: [],
        social: []
    };

    groups.forEach(group => {
        const meta = COMPONENT_META[group.component_type];
        if (meta) {
            categoryGroups[meta.category].push(group);
        }
    });

    const steps: FormStep[] = [];

    if (categoryGroups.identity.length > 0) {
        steps.push({
            id: 'identity',
            title: 'Textos e Identidad',
            icon: '✏️',
            groups: categoryGroups.identity
        });
    }

    if (categoryGroups.products.length > 0) {
        steps.push({
            id: 'products',
            title: 'Productos y Ofertas',
            icon: '🏷️',
            groups: categoryGroups.products
        });
    }

    if (categoryGroups.contact.length > 0 || categoryGroups.social.length > 0) {
        steps.push({
            id: 'contact',
            title: 'Contacto y Redes',
            icon: '📱',
            groups: [...categoryGroups.contact, ...categoryGroups.social]
        });
    }

    return steps;
}

/**
 * Valida los valores del formulario contra el schema
 */
export function validateFormValues(
    schema: AdaptiveFormSchema,
    values: Record<string, string>
): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    schema.steps.forEach(step => {
        step.groups.forEach(group => {
            group.fields.forEach(field => {
                const value = values[`${group.component_id}_${field.key}`];

                // Validar requeridos
                if (field.required && (!value || !value.trim())) {
                    errors[`${group.component_id}_${field.key}`] = 'Este campo es obligatorio';
                    return;
                }

                if (!value) return;

                // Validar tipos
                switch (field.type) {
                    case 'tel':
                        if (!/^[+\d\s()-]*$/.test(value)) {
                            errors[`${group.component_id}_${field.key}`] = 'Formato de teléfono no válido';
                        }
                        break;
                    case 'url':
                        if (!value.startsWith('http://') && !value.startsWith('https://')) {
                            errors[`${group.component_id}_${field.key}`] = 'La URL debe empezar con http:// o https://';
                        }
                        break;
                    case 'number':
                        if (isNaN(parseFloat(value))) {
                            errors[`${group.component_id}_${field.key}`] = 'Introduce un número válido';
                        }
                        break;
                }
            });
        });
    });

    return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Extrae valores iniciales del schema (defaults + content pre-generado)
 */
export function getInitialValues(schema: AdaptiveFormSchema): Record<string, string> {
    const values: Record<string, string> = {};

    schema.steps.forEach(step => {
        step.groups.forEach(group => {
            group.fields.forEach(field => {
                const key = `${group.component_id}_${field.key}`;
                values[key] = field.default || '';
            });
        });
    });

    return values;
}

/**
 * Genera un resumen de configuración para el deploy
 */
export function generateFinalConfig(
    schema: AdaptiveFormSchema,
    values: Record<string, string>
): Record<string, Record<string, string>> {
    const config: Record<string, Record<string, string>> = {};

    schema.steps.forEach(step => {
        step.groups.forEach(group => {
            config[group.component_id] = {};
            group.fields.forEach(field => {
                const key = `${group.component_id}_${field.key}`;
                if (values[key]) {
                    config[group.component_id][field.key] = values[key];
                }
            });
        });
    });

    return config;
}
