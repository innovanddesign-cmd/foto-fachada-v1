/**
 * Placeholder Generator
 * =====================
 * Genera sugerencias de contenido pre-rellenado basadas en BusinessDNA.
 * El usuario puede validar o editar antes de publicar.
 */

import type { BusinessDNA, PriceRange } from '../types';
import { generateActionCopy, getCopywritingRules } from './copywritingEngine';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface PlaceholderSuggestion {
    key: string;
    label: string;
    suggested_value: string;
    confidence: 'high' | 'medium' | 'low';
    editable: boolean;
    source: 'dna' | 'template' | 'ai';
}

export interface ActionPlaceholders {
    action_id: number;
    action_name: string;
    suggestions: PlaceholderSuggestion[];
    copy_style: {
        vibe: string;
        translated: boolean;
    };
}

// ─────────────────────────────────────────────────────────────
// PRICE SUGGESTIONS BY RANGE
// ─────────────────────────────────────────────────────────────

const PRICE_SUGGESTIONS: Record<PriceRange, { offer: string; original: string; discount: string }> = {
    budget: { offer: '2.50€', original: '4.00€', discount: '15%' },
    mid: { offer: '5.90€', original: '8.90€', discount: '20%' },
    premium: { offer: '9.90€', original: '14.90€', discount: '25%' },
    luxury: { offer: '19.90€', original: '29.90€', discount: '30%' }
};

// ─────────────────────────────────────────────────────────────
// MAIN GENERATOR
// ─────────────────────────────────────────────────────────────

/**
 * Generate placeholder suggestions for a specific action based on BusinessDNA
 */
export function generatePlaceholders(
    dna: BusinessDNA,
    actionId: number,
    actionName: string
): ActionPlaceholders {
    const rules = getCopywritingRules(dna);
    const actionCopy = generateActionCopy(dna, actionId);
    const prices = PRICE_SUGGESTIONS[dna.price_range] || PRICE_SUGGESTIONS.mid;
    const mainProduct = dna.detected_products[0] || 'Producto estrella';
    const mainService = dna.detected_services[0] || 'Servicio principal';

    let suggestions: PlaceholderSuggestion[] = [];

    switch (actionId) {
        case 1: // Oferta Flash
            suggestions = [
                {
                    key: 'producto',
                    label: 'Producto en oferta',
                    suggested_value: mainProduct,
                    confidence: dna.detected_products.length > 0 ? 'high' : 'medium',
                    editable: true,
                    source: 'dna'
                },
                {
                    key: 'precio_oferta',
                    label: 'Precio de oferta',
                    suggested_value: prices.offer,
                    confidence: 'medium',
                    editable: true,
                    source: 'template'
                },
                {
                    key: 'precio_original',
                    label: 'Precio original',
                    suggested_value: prices.original,
                    confidence: 'medium',
                    editable: true,
                    source: 'template'
                },
                {
                    key: 'mensaje_urgencia',
                    label: 'Mensaje de urgencia',
                    suggested_value: actionCopy.urgencia || '¡Solo hoy!',
                    confidence: 'high',
                    editable: true,
                    source: 'ai'
                },
                {
                    key: 'tiempo_limite',
                    label: 'Tiempo límite (horas)',
                    suggested_value: '24',
                    confidence: 'medium',
                    editable: true,
                    source: 'template'
                }
            ];
            break;

        case 2: // Comparador Pro
            suggestions = [
                {
                    key: 'precio_normal',
                    label: 'Precio normal',
                    suggested_value: prices.original,
                    confidence: 'medium',
                    editable: true,
                    source: 'template'
                },
                {
                    key: 'precio_especial',
                    label: 'Tu precio especial',
                    suggested_value: prices.offer,
                    confidence: 'medium',
                    editable: true,
                    source: 'template'
                },
                {
                    key: 'beneficio_1',
                    label: 'Beneficio 1',
                    suggested_value: 'Calidad artesanal garantizada',
                    confidence: 'medium',
                    editable: true,
                    source: 'template'
                },
                {
                    key: 'beneficio_2',
                    label: 'Beneficio 2',
                    suggested_value: 'Ingredientes seleccionados',
                    confidence: 'medium',
                    editable: true,
                    source: 'template'
                }
            ];
            break;

        case 3: // Rasca y Gana
            suggestions = [
                {
                    key: 'premio',
                    label: 'Premio a ganar',
                    suggested_value: `${mainProduct} gratis`,
                    confidence: 'high',
                    editable: true,
                    source: 'dna'
                },
                {
                    key: 'codigo_premio',
                    label: 'Código del premio',
                    suggested_value: 'WINNER-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
                    confidence: 'high',
                    editable: false,
                    source: 'template'
                },
                {
                    key: 'validez',
                    label: 'Validez del premio',
                    suggested_value: '7 días',
                    confidence: 'medium',
                    editable: true,
                    source: 'template'
                }
            ];
            break;

        case 4: // Rachas de Visita
            suggestions = [
                {
                    key: 'nombre_programa',
                    label: 'Nombre del programa',
                    suggested_value: `Club ${dna.business_type || 'VIP'}`,
                    confidence: 'medium',
                    editable: true,
                    source: 'dna'
                },
                {
                    key: 'visitas_meta',
                    label: 'Visitas para premio',
                    suggested_value: '7',
                    confidence: 'high',
                    editable: true,
                    source: 'template'
                },
                {
                    key: 'premio',
                    label: 'Premio al completar',
                    suggested_value: `${mainProduct} gratis`,
                    confidence: 'high',
                    editable: true,
                    source: 'dna'
                }
            ];
            break;

        case 5: // Producto Gancho
            suggestions = [
                {
                    key: 'producto_gratis',
                    label: 'Producto gratuito',
                    suggested_value: mainProduct,
                    confidence: 'high',
                    editable: true,
                    source: 'dna'
                },
                {
                    key: 'descripcion',
                    label: 'Descripción',
                    suggested_value: actionCopy.descripcion || 'Tu regalo te espera',
                    confidence: 'medium',
                    editable: true,
                    source: 'ai'
                },
                {
                    key: 'tiempo_validez',
                    label: 'Validez (minutos)',
                    suggested_value: '15',
                    confidence: 'high',
                    editable: true,
                    source: 'template'
                }
            ];
            break;

        case 6: // Trae a un Amigo
            suggestions = [
                {
                    key: 'premio_referidor',
                    label: 'Premio para quien invita',
                    suggested_value: mainProduct,
                    confidence: 'high',
                    editable: true,
                    source: 'dna'
                },
                {
                    key: 'premio_invitado',
                    label: 'Premio para el invitado',
                    suggested_value: mainProduct,
                    confidence: 'high',
                    editable: true,
                    source: 'dna'
                },
                {
                    key: 'mensaje_whatsapp',
                    label: 'Mensaje de WhatsApp',
                    suggested_value: `¡Hola! Te invito a probar ${mainProduct} en ${dna.business_type}. Usa mi código y ambos ganamos 🎁`,
                    confidence: 'medium',
                    editable: true,
                    source: 'ai'
                }
            ];
            break;

        case 7: // Feedback + Incentivo
            suggestions = [
                {
                    key: 'pregunta_1',
                    label: 'Pregunta 1',
                    suggested_value: '¿Cómo fue tu experiencia?',
                    confidence: 'high',
                    editable: true,
                    source: 'template'
                },
                {
                    key: 'pregunta_2',
                    label: 'Pregunta 2',
                    suggested_value: '¿Nos recomendarías?',
                    confidence: 'high',
                    editable: true,
                    source: 'template'
                },
                {
                    key: 'recompensa',
                    label: 'Recompensa',
                    suggested_value: `${prices.discount} en tu próxima visita`,
                    confidence: 'medium',
                    editable: true,
                    source: 'template'
                }
            ];
            break;

        case 8: // Guía del Experto
            suggestions = [
                {
                    key: 'titulo_guia',
                    label: 'Título de la guía',
                    suggested_value: `Los 3 secretos de ${mainProduct || mainService}`,
                    confidence: 'high',
                    editable: true,
                    source: 'ai'
                },
                {
                    key: 'nombre_experto',
                    label: 'Nombre del experto',
                    suggested_value: 'Tu Nombre',
                    confidence: 'low',
                    editable: true,
                    source: 'template'
                },
                {
                    key: 'cargo_experto',
                    label: 'Cargo',
                    suggested_value: `Fundador de ${dna.business_type || 'este negocio'}`,
                    confidence: 'medium',
                    editable: true,
                    source: 'dna'
                },
                {
                    key: 'producto_cta',
                    label: 'Producto a promocionar',
                    suggested_value: mainProduct,
                    confidence: 'high',
                    editable: true,
                    source: 'dna'
                }
            ];
            break;

        case 9: // Recomendado para Ti
            suggestions = [
                {
                    key: 'pregunta_1',
                    label: 'Pregunta 1',
                    suggested_value: '¿Cómo tienes el hambre hoy?',
                    confidence: 'high',
                    editable: true,
                    source: 'template'
                },
                {
                    key: 'pregunta_2',
                    label: 'Pregunta 2',
                    suggested_value: '¿Dulce o salado?',
                    confidence: 'high',
                    editable: true,
                    source: 'template'
                },
                {
                    key: 'producto_estrella',
                    label: 'Producto recomendado',
                    suggested_value: mainProduct,
                    confidence: 'high',
                    editable: true,
                    source: 'dna'
                },
                {
                    key: 'descripcion_match',
                    label: 'Por qué es el match',
                    suggested_value: 'Seleccionado especialmente para ti basado en tus preferencias',
                    confidence: 'medium',
                    editable: true,
                    source: 'template'
                },
                {
                    key: 'precio',
                    label: 'Precio',
                    suggested_value: prices.offer,
                    confidence: 'medium',
                    editable: true,
                    source: 'template'
                }
            ];
            break;

        default:
            suggestions = [];
    }

    return {
        action_id: actionId,
        action_name: actionName,
        suggestions,
        copy_style: {
            vibe: dna.brand_vibe,
            translated: rules.translate_to === 'en'
        }
    };
}

/**
 * Convert suggestions to config object for page generation
 */
export function suggestionsToConfig(
    suggestions: PlaceholderSuggestion[]
): Record<string, string> {
    const config: Record<string, string> = {};

    for (const suggestion of suggestions) {
        config[suggestion.key] = suggestion.suggested_value;
    }

    return config;
}

/**
 * Merge user edits with suggestions
 */
export function mergeWithUserEdits(
    suggestions: PlaceholderSuggestion[],
    userEdits: Record<string, string>
): PlaceholderSuggestion[] {
    return suggestions.map(suggestion => ({
        ...suggestion,
        suggested_value: userEdits[suggestion.key] ?? suggestion.suggested_value
    }));
}
