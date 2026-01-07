/**
 * LinkContentGenerator (Backend)
 * ==================================
 * Generates unique URLs and enriches strategies with link information
 * for the Infinite Creativity engine.
 */

import type { BrandData, Strategy } from './CreativeEngineService.js';

export type { BrandData, Strategy } from './CreativeEngineService.js';

export interface EnrichedStrategy extends Strategy {
    url: string;
    slug: string;
    type: 'gamification' | 'promo' | 'social' | 'menu' | 'reservation' | 'info';
    _enrichment: {
        brandSlug: string;
        index: number;
        enrichedAt: string;
    };
}

/**
 * Generates a web-safe slug from text
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^\w\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Spaces to hyphens
        .replace(/-+/g, '-') // Collapse multiple hyphens
        .replace(/^-|-$/g, ''); // Trim hyphens
}

/**
 * Determines the type of link based on strategy ID and title
 */
export function detectLinkType(strategy: Strategy): EnrichedStrategy['type'] {
    const id = strategy.id.toLowerCase();
    const title = strategy.title.toLowerCase();

    if (id.includes('wheel') || id.includes('fortune') || id.includes('game') || id.includes('rulet')) {
        return 'gamification';
    }
    if (id.includes('flash') || id.includes('offer') || id.includes('promo') || id.includes('descuento')) {
        return 'promo';
    }
    if (id.includes('social') || id.includes('wall') || id.includes('testimon')) {
        return 'social';
    }
    if (title.includes('menú') || title.includes('menu') || title.includes('carta')) {
        return 'menu';
    }
    if (title.includes('reserv') || title.includes('book')) {
        return 'reservation';
    }

    return 'info';
}

/**
 * Generates a unique URL for a strategy/widget
 */
export function generateLinkUrl(
    strategy: Strategy,
    brandSlug: string,
    linkType: EnrichedStrategy['type']
): string {
    const isDev = process.env.NODE_ENV !== 'production';
    const protocol = isDev ? 'http' : 'https';
    const domain = isDev ? 'localhost:3000' : process.env.PUBLIC_DOMAIN || 'foto-fachada-v1.vercel.app';

    const widgetSlug = slugify(strategy.title);

    // Generate URL based on type
    switch (linkType) {
        case 'menu':
            return `${protocol}://${domain}/menu/${brandSlug}`;

        case 'reservation':
            return `${protocol}://${domain}/reservas/${brandSlug}`;

        case 'social':
            return `${protocol}://${domain}/social/${brandSlug}`;

        case 'gamification':
            return `${protocol}://${domain}/juego/${brandSlug}/${widgetSlug}`;

        case 'promo':
            return `${protocol}://${domain}/ofertas/${brandSlug}/${widgetSlug}`;

        case 'info':
        default:
            return `${protocol}://${domain}/info/${brandSlug}/${widgetSlug}`;
    }
}

/**
 * Enriches an array of strategies with URLs and metadata
 */
export function enrichStrategiesWithUrls(
    strategies: Strategy[],
    brandData: BrandData
): EnrichedStrategy[] {
    const brandSlug = slugify(brandData.name);

    return strategies.map((strategy, index) => {
        const linkType = detectLinkType(strategy);
        const url = generateLinkUrl(strategy, brandSlug, linkType);
        const slug = slugify(strategy.title);

        return {
            ...strategy,
            url,
            slug,
            type: linkType,
            _enrichment: {
                brandSlug,
                index,
                enrichedAt: new Date().toISOString()
            }
        } as EnrichedStrategy;
    });
}

/**
 * Replaces {{variable}} placeholders with actual values
 */
export function replaceVariables(
    template: string,
    variables: Record<string, any>
): string {
    let result = template;

    for (const [key, value] of Object.entries(variables)) {
        const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        const safeValue = String(value || '').replace(/[<>]/g, ''); // Basic XSS prevention
        result = result.replace(placeholder, safeValue);
    }

    // Replace any remaining unmatched variables with empty string
    result = result.replace(/\{\{[^}]+\}\}/g, '');

    return result;
}

/**
 * Generates a complete, standalone widget page HTML
 * (For future use when we separate widgets into individual pages)
 */
export function generateWidgetPage(
    enrichedStrategy: EnrichedStrategy,
    brandData: BrandData,
    config: Record<string, any>
): string {
    // Replace variables in the code template
    const widgetHtml = replaceVariables(enrichedStrategy.code_template, config);

    // TODO: Add full page wrapper with header, footer, meta tags
    // For now, return the widget HTML directly
    return widgetHtml;
}

/**
 * Extracts all variable names from a template
 */
export function extractVariableNames(template: string): string[] {
    const matches = template.match(/\{\{([^}]+)\}\}/g) || [];
    return matches.map(match => match.replace(/\{\{|\}\}/g, ''));
}
