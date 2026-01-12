/**
 * Action Selector Service
 * =======================
 * Selecciona automáticamente 1 acción de cada bloque basándose en BusinessDNA.
 */

import type { BrandData, BusinessDNA } from '../types';
import { STRATEGIC_CATEGORIES, type StrategicAction, type StrategicCategory } from '../data/strategicCategories';

export interface PlaceholderField {
    label: string;
    value: string;
    placeholder: string;
    confidence: 'high' | 'medium' | 'low';
}

export interface SelectedAction {
    category: StrategicCategory;
    action: StrategicAction;
    config: Record<string, PlaceholderField>;
    reason: string;
}

export interface AutoSelectedActions {
    venta: SelectedAction;
    fidelizar: SelectedAction;
    autoridad: SelectedAction;
}

const SELECTION_RULES: Record<string, {
    venta: number[];
    fidelizar: number[];
    autoridad: number[];
}> = {
    'bar': { venta: [1, 3], fidelizar: [4, 5], autoridad: [7, 9] },
    'restaurante': { venta: [1, 2], fidelizar: [4, 6], autoridad: [8, 7] },
    'cafetería': { venta: [1, 5], fidelizar: [4, 5], autoridad: [7, 9] },
    'peluquería': { venta: [2, 1], fidelizar: [6, 4], autoridad: [8, 9] },
    'gym': { venta: [5, 1], fidelizar: [4, 6], autoridad: [8, 7] },
    'tienda': { venta: [1, 2], fidelizar: [3, 5], autoridad: [9, 7] },
    'canalla': { venta: [3, 1], fidelizar: [3, 4], autoridad: [7, 9] },
    'tradicional': { venta: [1, 5], fidelizar: [4, 6], autoridad: [8, 7] },
    'lujo': { venta: [2, 5], fidelizar: [6, 5], autoridad: [8, 9] },
    'moderno': { venta: [1, 3], fidelizar: [3, 4], autoridad: [9, 7] },
    'default': { venta: [1, 3, 2], fidelizar: [4, 3, 5], autoridad: [7, 8, 9] }
};

function getBestActionId(
    categoryType: 'venta' | 'fidelizar' | 'autoridad',
    businessType: string,
    vibe: string
): number {
    const normalized = businessType.toLowerCase();
    const normalizedVibe = vibe.toLowerCase();

    const rule =
        SELECTION_RULES[normalized] ||
        SELECTION_RULES[normalizedVibe] ||
        SELECTION_RULES['default'];

    return rule[categoryType][0];
}

function getCategoryById(id: string): StrategicCategory | null {
    return STRATEGIC_CATEGORIES.find(c => c.id === id) || null;
}

function getActionById(category: StrategicCategory, actionId: number): StrategicAction | null {
    return category.actions.find(a => a.id === actionId) || null;
}

function generateReason(action: StrategicAction, businessType: string): string {
    const reasons: Record<number, string> = {
        1: `Ideal para ${businessType} - Las ofertas relámpago generan urgencia`,
        2: `Perfecto para destacar tus productos frente a la competencia`,
        3: `El factor sorpresa funciona muy bien con tu audiencia`,
        4: `Las rachas de visita fidelizan clientes en ${businessType}`,
        5: `Un producto gancho atrae nuevos clientes`,
        6: `Los referidos son oro para tu negocio`,
        7: `Las encuestas rápidas mejoran reputación online`,
        8: `Tu experiencia merece una guía de experto`,
        9: `Las recomendaciones personalizadas aumentan ventas`
    };
    return reasons[action.id] || `Seleccionado para tu tipo de negocio`;
}

function generatePlaceholders(actionId: number, brandData: BrandData): Record<string, PlaceholderField> {
    const businessType = brandData.businessType || 'negocio';
    const product = getMainProduct(businessType);

    const configs: Record<number, Record<string, PlaceholderField>> = {
        1: {
            producto: { label: 'Producto', value: product, placeholder: 'ej: caña', confidence: 'medium' },
            descuento: { label: 'Descuento', value: '2x1', placeholder: 'ej: 50%', confidence: 'medium' },
            duracion: { label: 'Duración', value: '24 horas', placeholder: 'ej: 2 días', confidence: 'high' }
        },
        3: {
            premio1: { label: 'Premio 1', value: 'Café gratis', placeholder: 'ej: Bebida gratis', confidence: 'medium' },
            premio2: { label: 'Premio 2', value: '10% descuento', placeholder: 'ej: Postre', confidence: 'medium' },
            premio3: { label: 'Premio 3', value: 'Regalo sorpresa', placeholder: 'ej: 2x1', confidence: 'low' }
        },
        4: {
            meta: { label: 'Visitas para premio', value: '5', placeholder: 'ej: 10', confidence: 'high' },
            premio: { label: 'Premio', value: product + ' gratis', placeholder: 'ej: Consumición', confidence: 'medium' }
        },
        7: {
            regalo: { label: 'Regalo por completar', value: 'Café gratis', placeholder: 'ej: Descuento', confidence: 'medium' }
        }
    };

    return configs[actionId] || {
        nombre: { label: 'Nombre', value: brandData.name || '', placeholder: 'Nombre del negocio', confidence: 'high' }
    };
}

function getMainProduct(businessType: string): string {
    const products: Record<string, string> = {
        'bar': 'caña', 'cafetería': 'café', 'restaurante': 'menú',
        'pizzería': 'pizza', 'panadería': 'pan', 'heladería': 'helado'
    };
    const normalized = businessType.toLowerCase();
    for (const [key, value] of Object.entries(products)) {
        if (normalized.includes(key)) return value;
    }
    return 'producto';
}

export function autoSelectActions(
    brandData: BrandData,
    dna?: BusinessDNA
): AutoSelectedActions | null {
    const businessType = brandData.businessType || 'negocio';
    const vibe = dna?.brand_vibe || 'moderno';

    const ventaCategory = getCategoryById('ventas');
    const fidelizarCategory = getCategoryById('fidelizacion');
    const autoridadCategory = getCategoryById('autoridad');

    if (!ventaCategory || !fidelizarCategory || !autoridadCategory) {
        console.error('[ActionSelector] Categories not found');
        return null;
    }

    const ventaActionId = getBestActionId('venta', businessType, vibe);
    const fidelizarActionId = getBestActionId('fidelizar', businessType, vibe);
    const autoridadActionId = getBestActionId('autoridad', businessType, vibe);

    const ventaAction = getActionById(ventaCategory, ventaActionId) || ventaCategory.actions[0];
    const fidelizarAction = getActionById(fidelizarCategory, fidelizarActionId) || fidelizarCategory.actions[0];
    const autoridadAction = getActionById(autoridadCategory, autoridadActionId) || autoridadCategory.actions[0];

    return {
        venta: {
            category: ventaCategory,
            action: ventaAction,
            config: generatePlaceholders(ventaAction.id, brandData),
            reason: generateReason(ventaAction, businessType)
        },
        fidelizar: {
            category: fidelizarCategory,
            action: fidelizarAction,
            config: generatePlaceholders(fidelizarAction.id, brandData),
            reason: generateReason(fidelizarAction, businessType)
        },
        autoridad: {
            category: autoridadCategory,
            action: autoridadAction,
            config: generatePlaceholders(autoridadAction.id, brandData),
            reason: generateReason(autoridadAction, businessType)
        }
    };
}

export function getConfigValues(config: Record<string, PlaceholderField>): Record<string, string> {
    const values: Record<string, string> = {};
    for (const [key, field] of Object.entries(config)) {
        values[key] = field.value;
    }
    return values;
}
