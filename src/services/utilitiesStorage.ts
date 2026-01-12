/**
 * Utilities Storage Service
 * =========================
 * Almacenamiento y recuperación de configuración de utilidades.
 * Mapea los datos a un JSON único asociado al negocio.
 */

import type { UtilityId, LandingUtilities, BrandData } from '../types';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface BusinessUtilitiesData {
    brand_id: string;
    brand_name: string;
    utilities: LandingUtilities;
    created_at: string;
    updated_at: string;
}

// ─────────────────────────────────────────────────────────────
// STORAGE KEY GENERATION
// ─────────────────────────────────────────────────────────────

const STORAGE_PREFIX = 'fotofachada_utilities_';

function getBrandSlug(brandName: string): string {
    return brandName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
}

function getStorageKey(brandName: string): string {
    return `${STORAGE_PREFIX}${getBrandSlug(brandName)}`;
}

// ─────────────────────────────────────────────────────────────
// SAVE / LOAD
// ─────────────────────────────────────────────────────────────

/**
 * Save utilities configuration for a brand
 */
export function saveUtilities(
    brandData: BrandData,
    utilities: LandingUtilities
): BusinessUtilitiesData {
    const key = getStorageKey(brandData.name);
    const now = new Date().toISOString();

    // Check if exists
    const existing = loadUtilities(brandData.name);

    const data: BusinessUtilitiesData = {
        brand_id: getBrandSlug(brandData.name),
        brand_name: brandData.name,
        utilities,
        created_at: existing?.created_at || now,
        updated_at: now
    };

    localStorage.setItem(key, JSON.stringify(data));

    return data;
}

/**
 * Load utilities configuration for a brand
 */
export function loadUtilities(brandName: string): BusinessUtilitiesData | null {
    const key = getStorageKey(brandName);

    try {
        const stored = localStorage.getItem(key);
        if (!stored) return null;
        return JSON.parse(stored);
    } catch {
        return null;
    }
}

/**
 * Get all saved utilities configurations
 */
export function getAllUtilities(): BusinessUtilitiesData[] {
    const results: BusinessUtilitiesData[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
            try {
                const data = JSON.parse(localStorage.getItem(key) || '');
                results.push(data);
            } catch {
                // Skip invalid entries
            }
        }
    }

    return results.sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
}

/**
 * Delete utilities configuration for a brand
 */
export function deleteUtilities(brandName: string): boolean {
    const key = getStorageKey(brandName);

    if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        return true;
    }
    return false;
}

// ─────────────────────────────────────────────────────────────
// MERGE WITH BRAND DATA
// ─────────────────────────────────────────────────────────────

/**
 * Create initial utilities config from BrandData
 * Pre-fills some fields from existing brand data
 */
export function initializeFromBrandData(brandData: BrandData): LandingUtilities {
    const configs: LandingUtilities['configs'] = {} as LandingUtilities['configs'];
    const selected: UtilityId[] = [];

    // Pre-fill WhatsApp if available
    if (brandData.whatsapp) {
        selected.push('whatsapp');
        configs.whatsapp = {
            phone: brandData.whatsapp,
            message: `Hola, me gustaría información sobre ${brandData.name}`
        };
    }

    // Pre-fill Instagram if available
    if (brandData.instagram) {
        selected.push('instagram');
        configs.instagram = {
            username: brandData.instagram.replace('@', '')
        };
    }

    // Pre-fill Facebook if available
    if (brandData.facebook) {
        selected.push('facebook');
        configs.facebook = {
            url: brandData.facebook
        };
    }

    // Pre-fill location if address available
    if (brandData.address) {
        selected.push('location');
        configs.location = {
            address: brandData.address,
            maps_url: ''
        };
    }

    return { selected, configs };
}

// ─────────────────────────────────────────────────────────────
// EXPORT TO JSON
// ─────────────────────────────────────────────────────────────

/**
 * Export complete configuration as JSON string
 */
export function exportAsJson(data: BusinessUtilitiesData): string {
    return JSON.stringify(data, null, 2);
}

/**
 * Generate shareable link data object
 */
export function generateLinkData(
    brandData: BrandData,
    utilities: LandingUtilities
): Record<string, unknown> {
    return {
        brand: {
            name: brandData.name,
            type: brandData.businessType,
            colors: brandData.colors,
            tagline: brandData.tagline
        },
        utilities: {
            selected: utilities.selected,
            configs: utilities.configs
        },
        meta: {
            generated_at: new Date().toISOString(),
            version: '1.0'
        }
    };
}
