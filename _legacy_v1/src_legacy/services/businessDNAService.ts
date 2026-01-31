/**
 * Business DNA Service
 * ====================
 * Extrae el "DNA" del negocio desde el análisis de fachada.
 * Conecta el input (foto) con el output (Simple Pages).
 */

import type { BrandData, BusinessDNA, BrandVibe, AudienceType, LocationContext, PriceRange } from '../types';

// ─────────────────────────────────────────────────────────────
// VIBE DETECTION
// ─────────────────────────────────────────────────────────────

const VIBE_KEYWORDS: Record<BrandVibe, string[]> = {
    canalla: ['industrial', 'urban', 'dark', 'bold', 'edgy', 'street', 'graffiti', 'neon', 'bar', 'pub', 'tattoo'],
    tradicional: ['classic', 'vintage', 'traditional', 'artisan', 'handmade', 'heritage', 'family', 'wood', 'rustic'],
    lujo: ['luxury', 'premium', 'exclusive', 'elegant', 'marble', 'gold', 'boutique', 'gourmet', 'spa', 'fine'],
    industrial: ['minimal', 'concrete', 'metal', 'exposed', 'loft', 'modern', 'gym', 'crossfit', 'tech'],
    moderno: ['contemporary', 'fresh', 'colorful', 'trendy', 'instagram', 'brunch', 'healthy', 'organic'],
    acogedor: ['cozy', 'warm', 'homely', 'cafe', 'bakery', 'pastry', 'tea', 'comfort', 'neighborhood']
};

/**
 * Detect brand vibe from style and business type
 */
function detectVibe(style: string, businessType: string, description: string): BrandVibe {
    const combined = `${style} ${businessType} ${description}`.toLowerCase();

    let bestVibe: BrandVibe = 'moderno';
    let maxScore = 0;

    for (const [vibe, keywords] of Object.entries(VIBE_KEYWORDS)) {
        const score = keywords.filter(kw => combined.includes(kw)).length;
        if (score > maxScore) {
            maxScore = score;
            bestVibe = vibe as BrandVibe;
        }
    }

    return bestVibe;
}

// ─────────────────────────────────────────────────────────────
// AUDIENCE DETECTION
// ─────────────────────────────────────────────────────────────

const AUDIENCE_SIGNALS: Record<AudienceType, { keywords: string[]; contexts: string[] }> = {
    turista_uk: {
        keywords: ['english', 'british', 'full english', 'fish chips', 'pub'],
        contexts: ['benidorm', 'magaluf', 'costa del sol', 'tourist']
    },
    turista_eu: {
        keywords: ['international', 'tourist', 'menu turístico'],
        contexts: ['barcelona', 'madrid centro', 'costa']
    },
    senior_nacional: {
        keywords: ['tradicional', 'casero', 'de toda la vida', 'menú del día'],
        contexts: ['barrio', 'mercado', 'pueblo']
    },
    local_joven: {
        keywords: ['trendy', 'instagram', 'brunch', 'craft', 'artesanal'],
        contexts: ['centro', 'barrio cool', 'hipster']
    },
    familias: {
        keywords: ['familiar', 'niños', 'terraza', 'parque', 'menú infantil'],
        contexts: ['residencial', 'centro comercial']
    },
    profesional: {
        keywords: ['business', 'networking', 'coworking', 'executive', 'meeting'],
        contexts: ['oficinas', 'business district']
    }
};

/**
 * Detect target audience from brand data
 */
function detectAudience(target: string, location: string, description: string): AudienceType {
    const combined = `${target} ${location} ${description}`.toLowerCase();

    let bestAudience: AudienceType = 'local_joven';
    let maxScore = 0;

    for (const [audience, signals] of Object.entries(AUDIENCE_SIGNALS)) {
        const keywordScore = signals.keywords.filter(kw => combined.includes(kw)).length * 2;
        const contextScore = signals.contexts.filter(ctx => combined.includes(ctx)).length;
        const score = keywordScore + contextScore;

        if (score > maxScore) {
            maxScore = score;
            bestAudience = audience as AudienceType;
        }
    }

    return bestAudience;
}

// ─────────────────────────────────────────────────────────────
// LOCATION CONTEXT
// ─────────────────────────────────────────────────────────────

function detectLocationContext(address: string, description: string): LocationContext {
    const combined = `${address} ${description}`.toLowerCase();

    if (/turista|tourist|costa|beach|playa/.test(combined)) return 'turistica';
    if (/centro|downtown|casco|histórico/.test(combined)) return 'centro';
    if (/industrial|polígono|nave/.test(combined)) return 'industrial';
    return 'barrio';
}

// ─────────────────────────────────────────────────────────────
// PRICE RANGE DETECTION
// ─────────────────────────────────────────────────────────────

function detectPriceRange(_style: string, vibe: BrandVibe): PriceRange {
    // Luxury vibe = premium/luxury prices
    if (vibe === 'lujo') return 'luxury';
    if (vibe === 'tradicional') return 'mid';
    if (vibe === 'canalla') return 'mid';
    if (vibe === 'industrial') return 'premium';
    if (vibe === 'acogedor') return 'budget';
    return 'mid';
}

// ─────────────────────────────────────────────────────────────
// PRODUCT/SERVICE EXTRACTION
// ─────────────────────────────────────────────────────────────

const BUSINESS_TYPE_PRODUCTS: Record<string, string[]> = {
    'cafetería': ['Café', 'Tostada', 'Zumo natural'],
    'bar': ['Cerveza', 'Tapa', 'Vermut'],
    'restaurante': ['Menú del día', 'Plato del chef', 'Entrante'],
    'peluquería': ['Corte', 'Tratamiento', 'Color'],
    'gym': ['Sesión personal', 'Clase grupal', 'Mensualidad'],
    'panadería': ['Pan artesano', 'Bollería', 'Empanada'],
    'pastelería': ['Tarta', 'Pastel', 'Bizcocho'],
    'pizzería': ['Pizza', 'Pasta', 'Ensalada'],
    'heladería': ['Helado artesano', 'Granizado', 'Crepe'],
    'spa': ['Masaje', 'Tratamiento facial', 'Circuito'],
    'tienda': ['Producto destacado', 'Novedad', 'Oferta especial']
};

function extractProducts(businessType: string, _description: string): string[] {
    const normalizedType = businessType.toLowerCase();

    // Find matching business type
    for (const [type, products] of Object.entries(BUSINESS_TYPE_PRODUCTS)) {
        if (normalizedType.includes(type)) {
            return products;
        }
    }

    // Default products
    return ['Producto estrella', 'Oferta especial', 'Novedad'];
}

function extractServices(_businessType: string, description: string): string[] {
    const services: string[] = [];

    // Extract from description
    const serviceKeywords = ['servicio', 'atención', 'delivery', 'reserva', 'wifi', 'terraza', 'parking'];
    for (const keyword of serviceKeywords) {
        if (description.toLowerCase().includes(keyword)) {
            services.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
        }
    }

    return services.length > 0 ? services : ['Atención personalizada'];
}

// ─────────────────────────────────────────────────────────────
// MAIN EXTRACTION
// ─────────────────────────────────────────────────────────────

/**
 * Extract full BusinessDNA from BrandData
 */
export function extractBusinessDNA(brandData: BrandData): BusinessDNA {
    const vibe = detectVibe(
        brandData.style || '',
        brandData.businessType || '',
        brandData.description || ''
    );

    const audience = detectAudience(
        brandData.targetAudience || '',
        brandData.address || '',
        brandData.description || ''
    );

    const locationContext = detectLocationContext(
        brandData.address || '',
        brandData.description || ''
    );

    const priceRange = detectPriceRange(brandData.style || '', vibe);

    // Determine language preference based on audience
    let languagePreference: BusinessDNA['language_preference'] = 'es';
    if (audience === 'turista_uk') languagePreference = 'en';
    else if (audience === 'turista_eu') languagePreference = 'es_en';

    const dna: BusinessDNA = {
        // Identity
        brand_vibe: vibe,
        primary_color: brandData.colors?.primary || '#6366f1',
        secondary_color: brandData.colors?.secondary || '#a855f7',
        accent_color: brandData.colors?.accent || '#f59e0b',

        // Context
        business_type: brandData.businessType || 'Negocio',
        business_niche: brandData.niche || brandData.businessType || 'General',
        target_audience: audience,

        // Detected
        detected_services: extractServices(brandData.businessType || '', brandData.description || ''),
        detected_products: extractProducts(brandData.businessType || '', brandData.description || ''),
        price_range: priceRange,

        // Location
        location_context: locationContext,
        language_preference: languagePreference,

        // Metadata
        confidence_score: calculateConfidence(brandData),
        analysis_timestamp: new Date().toISOString()
    };

    return dna;
}

/**
 * Calculate confidence score based on available data
 */
function calculateConfidence(brandData: BrandData): number {
    let score = 0;
    const weights = {
        name: 15,
        businessType: 20,
        description: 15,
        colors: 10,
        style: 15,
        address: 10,
        targetAudience: 15
    };

    if (brandData.name) score += weights.name;
    if (brandData.businessType) score += weights.businessType;
    if (brandData.description && brandData.description.length > 50) score += weights.description;
    if (brandData.colors?.primary) score += weights.colors;
    if (brandData.style) score += weights.style;
    if (brandData.address) score += weights.address;
    if (brandData.targetAudience) score += weights.targetAudience;

    return Math.min(score, 100);
}

/**
 * Enrich BrandData with extracted DNA
 */
export function enrichBrandData(brandData: BrandData): BrandData {
    return {
        ...brandData,
        dna: extractBusinessDNA(brandData)
    };
}

/**
 * Get DNA summary for display
 */
export function getDNASummary(dna: BusinessDNA): {
    vibe_label: string;
    audience_label: string;
    location_label: string;
    main_product: string;
} {
    const vibeLabels: Record<BrandVibe, string> = {
        canalla: '🔥 Canalla / Atrevido',
        tradicional: '🏛️ Tradicional / Clásico',
        lujo: '✨ Lujo / Premium',
        industrial: '⚙️ Industrial / Minimal',
        moderno: '🚀 Moderno / Trendy',
        acogedor: '☕ Acogedor / Familiar'
    };

    const audienceLabels: Record<AudienceType, string> = {
        turista_uk: '🇬🇧 Turista Británico',
        turista_eu: '🇪🇺 Turista Europeo',
        senior_nacional: '🇪🇸 Senior Nacional',
        local_joven: '🎯 Local Joven',
        familias: '👨‍👩‍👧 Familias',
        profesional: '💼 Profesional'
    };

    const locationLabels: Record<LocationContext, string> = {
        turistica: '🏖️ Zona Turística',
        barrio: '🏘️ Barrio',
        centro: '🏛️ Centro',
        industrial: '🏭 Zona Industrial'
    };

    return {
        vibe_label: vibeLabels[dna.brand_vibe],
        audience_label: audienceLabels[dna.target_audience],
        location_label: locationLabels[dna.location_context],
        main_product: dna.detected_products[0] || 'Producto'
    };
}
