/**
 * Utilities Data
 * ==============
 * Definiciones de todas las utilidades disponibles para las landings.
 * Cada utilidad tiene sus campos de configuración específicos.
 */

import type { UtilityDefinition, UtilityId } from '../types';

// ─────────────────────────────────────────────────────────────
// UTILITY DEFINITIONS
// ─────────────────────────────────────────────────────────────

export const UTILITIES: UtilityDefinition[] = [
    // ═══════════════════════════════════════════════════════════
    // REDES SOCIALES
    // ═══════════════════════════════════════════════════════════
    {
        id: 'instagram',
        name: 'Instagram',
        emoji: '📸',
        category: 'social',
        description: 'Botón para seguir en Instagram',
        fields: [
            {
                key: 'username',
                label: 'Usuario de Instagram',
                type: 'text',
                placeholder: '@tunegocio',
                required: true
            }
        ]
    },
    {
        id: 'facebook',
        name: 'Facebook',
        emoji: '👍',
        category: 'social',
        description: 'Enlace a página de Facebook',
        fields: [
            {
                key: 'url',
                label: 'URL de Facebook',
                type: 'url',
                placeholder: 'https://facebook.com/tunegocio',
                required: true
            }
        ]
    },
    {
        id: 'tiktok',
        name: 'TikTok',
        emoji: '🎵',
        category: 'social',
        description: 'Perfil de TikTok',
        fields: [
            {
                key: 'username',
                label: 'Usuario de TikTok',
                type: 'text',
                placeholder: '@tunegocio',
                required: true
            }
        ]
    },

    // ═══════════════════════════════════════════════════════════
    // CONTACTO
    // ═══════════════════════════════════════════════════════════
    {
        id: 'whatsapp',
        name: 'WhatsApp',
        emoji: '💬',
        category: 'contact',
        description: 'Botón de chat por WhatsApp',
        fields: [
            {
                key: 'phone',
                label: 'Número de WhatsApp',
                type: 'tel',
                placeholder: '+34 600 000 000',
                required: true
            },
            {
                key: 'message',
                label: 'Mensaje predefinido',
                type: 'textarea',
                placeholder: 'Hola, vengo de Foto Fachada y me gustaría...',
                required: false
            }
        ]
    },
    {
        id: 'phone',
        name: 'Llamar',
        emoji: '📞',
        category: 'contact',
        description: 'Botón de llamada directa',
        fields: [
            {
                key: 'phone',
                label: 'Número de teléfono',
                type: 'tel',
                placeholder: '+34 600 000 000',
                required: true
            }
        ]
    },

    // ═══════════════════════════════════════════════════════════
    // INFORMACIÓN
    // ═══════════════════════════════════════════════════════════
    {
        id: 'location',
        name: 'Ubicación',
        emoji: '📍',
        category: 'info',
        description: 'Enlace a Google Maps',
        fields: [
            {
                key: 'address',
                label: 'Dirección completa',
                type: 'text',
                placeholder: 'Calle Principal 123, Ciudad',
                required: true
            },
            {
                key: 'maps_url',
                label: 'URL de Google Maps (opcional)',
                type: 'url',
                placeholder: 'https://maps.google.com/...',
                required: false
            }
        ]
    },
    {
        id: 'menu',
        name: 'Carta / Menú',
        emoji: '🍽️',
        category: 'info',
        description: 'Mostrar carta o menú del local',
        fields: [
            {
                key: 'menu_url',
                label: 'URL de la carta (PDF o imagen)',
                type: 'url',
                placeholder: 'https://tusitio.com/carta.pdf',
                required: false
            },
            {
                key: 'menu_items',
                label: 'Platos destacados (uno por línea)',
                type: 'list',
                placeholder: 'Paella valenciana - 15€\nGazpacho andaluz - 6€',
                required: false
            }
        ]
    },
    {
        id: 'services',
        name: 'Servicios',
        emoji: '✂️',
        category: 'info',
        description: 'Lista de servicios ofrecidos',
        fields: [
            {
                key: 'services_list',
                label: 'Servicios (uno por línea)',
                type: 'list',
                placeholder: 'Corte de pelo - 15€\nTinte - 45€\nMechas - 60€',
                required: true
            }
        ]
    },
    {
        id: 'reviews',
        name: 'Reseñas',
        emoji: '⭐',
        category: 'info',
        description: 'Enlace a Google Business o TripAdvisor',
        fields: [
            {
                key: 'google_url',
                label: 'URL de Google Business',
                type: 'url',
                placeholder: 'https://g.page/tunegocio/review',
                required: false
            },
            {
                key: 'tripadvisor_url',
                label: 'URL de TripAdvisor',
                type: 'url',
                placeholder: 'https://tripadvisor.es/...',
                required: false
            },
            {
                key: 'cta_text',
                label: 'Texto del botón',
                type: 'text',
                placeholder: '¡Déjanos tu opinión!',
                required: false
            }
        ]
    },

    // ═══════════════════════════════════════════════════════════
    // MEDIA
    // ═══════════════════════════════════════════════════════════
    {
        id: 'gallery',
        name: 'Galería',
        emoji: '🖼️',
        category: 'media',
        description: 'Carrusel de fotos del local',
        fields: [
            {
                key: 'images',
                label: 'URLs de imágenes (una por línea)',
                type: 'list',
                placeholder: 'https://tusitio.com/foto1.jpg\nhttps://tusitio.com/foto2.jpg',
                required: true
            },
            {
                key: 'caption',
                label: 'Título de la galería',
                type: 'text',
                placeholder: 'Nuestro local',
                required: false
            }
        ]
    }
];

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Get utility definition by ID
 */
export function getUtility(id: UtilityId): UtilityDefinition | undefined {
    return UTILITIES.find(u => u.id === id);
}

/**
 * Get utilities by category
 */
export function getUtilitiesByCategory(category: UtilityDefinition['category']): UtilityDefinition[] {
    return UTILITIES.filter(u => u.category === category);
}

/**
 * Get all utility categories with their utilities
 */
export function getGroupedUtilities(): Record<string, UtilityDefinition[]> {
    return {
        'Redes Sociales': getUtilitiesByCategory('social'),
        'Contacto': getUtilitiesByCategory('contact'),
        'Información': getUtilitiesByCategory('info'),
        'Multimedia': getUtilitiesByCategory('media')
    };
}

/**
 * Generate default config for a utility
 */
export function getDefaultConfig(id: UtilityId): Record<string, string> {
    const utility = getUtility(id);
    if (!utility) return {};

    const config: Record<string, string> = {};
    for (const field of utility.fields) {
        config[field.key] = '';
    }
    return config;
}

/**
 * Validate utility config
 */
export function validateConfig(id: UtilityId, config: Record<string, string>): { valid: boolean; errors: string[] } {
    const utility = getUtility(id);
    if (!utility) return { valid: false, errors: ['Utilidad no encontrada'] };

    const errors: string[] = [];

    for (const field of utility.fields) {
        if (field.required && (!config[field.key] || config[field.key].trim() === '')) {
            errors.push(`${field.label} es requerido`);
        }
    }

    return { valid: errors.length === 0, errors };
}
