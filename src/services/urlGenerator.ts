/**
 * URL Generator
 * =============
 * Genera URLs únicas y persistentes para Simple Pages.
 * Formato: fotofachada.com/{slug-negocio}/{nombre-accion}
 */

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface GeneratedUrl {
    full_url: string;
    brand_slug: string;
    action_slug: string;
    unique_id: string;
    short_code: string;
}

export interface PageMetadata {
    id: string;
    url: string;
    brand_name: string;
    action_id: number;
    action_name: string;
    created_at: string;
    expires_at: string | null;
    status: 'active' | 'expired' | 'draft';
    analytics: {
        views: number;
        conversions: number;
        last_view: string | null;
    };
}

// ─────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────

/**
 * Convert text to URL-safe slug
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-z0-9\s-]/g, '')    // Remove special chars
        .replace(/\s+/g, '-')            // Spaces to hyphens
        .replace(/-+/g, '-')             // Multiple hyphens to single
        .replace(/^-|-$/g, '')           // Trim hyphens
        .substring(0, 50);               // Max length
}

/**
 * Generate a short unique ID (6 chars)
 */
export function generateShortId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Generate a short code for QR/sharing (8 chars)
 */
export function generateShortCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing chars
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// ─────────────────────────────────────────────────────────────
// MAIN GENERATOR
// ─────────────────────────────────────────────────────────────

const BASE_URL = 'https://fotofachada.com';

/**
 * Generate a unique URL for a Simple Page
 */
export function generatePageUrl(
    brandName: string,
    actionName: string
): GeneratedUrl {
    const brandSlug = slugify(brandName);
    const actionSlug = slugify(actionName);
    const uniqueId = generateShortId();
    const shortCode = generateShortCode();

    const fullUrl = `${BASE_URL}/${brandSlug}/${actionSlug}-${uniqueId}`;

    return {
        full_url: fullUrl,
        brand_slug: brandSlug,
        action_slug: actionSlug,
        unique_id: uniqueId,
        short_code: shortCode
    };
}

/**
 * Generate a short URL for sharing
 */
export function generateShortUrl(shortCode: string): string {
    return `${BASE_URL}/p/${shortCode}`;
}

// ─────────────────────────────────────────────────────────────
// PERSISTENCE (LocalStorage MVP)
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'fotofachada_pages';

/**
 * Save page metadata to storage
 */
export function savePage(metadata: PageMetadata): void {
    const pages = getAllPages();
    const existingIndex = pages.findIndex(p => p.id === metadata.id);

    if (existingIndex >= 0) {
        pages[existingIndex] = metadata;
    } else {
        pages.push(metadata);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
}

/**
 * Get all saved pages
 */
export function getAllPages(): PageMetadata[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

/**
 * Get page by URL
 */
export function getPageByUrl(url: string): PageMetadata | null {
    const pages = getAllPages();
    return pages.find(p => p.url === url) || null;
}

/**
 * Get pages by brand
 */
export function getPagesByBrand(brandName: string): PageMetadata[] {
    const pages = getAllPages();
    const brandSlug = slugify(brandName);
    return pages.filter(p => p.url.includes(`/${brandSlug}/`));
}

/**
 * Update page analytics
 */
export function recordPageView(url: string): void {
    const pages = getAllPages();
    const pageIndex = pages.findIndex(p => p.url === url);

    if (pageIndex >= 0) {
        pages[pageIndex].analytics.views++;
        pages[pageIndex].analytics.last_view = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
    }
}

/**
 * Record a conversion
 */
export function recordConversion(url: string): void {
    const pages = getAllPages();
    const pageIndex = pages.findIndex(p => p.url === url);

    if (pageIndex >= 0) {
        pages[pageIndex].analytics.conversions++;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
    }
}

// ─────────────────────────────────────────────────────────────
// PAGE CREATION HELPER
// ─────────────────────────────────────────────────────────────

/**
 * Create a new page with all metadata
 */
export function createPage(
    brandName: string,
    actionId: number,
    actionName: string,
    expiresInDays: number | null = null
): { url: GeneratedUrl; metadata: PageMetadata } {
    const url = generatePageUrl(brandName, actionName);

    const now = new Date();
    const expiresAt = expiresInDays
        ? new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

    const metadata: PageMetadata = {
        id: url.unique_id,
        url: url.full_url,
        brand_name: brandName,
        action_id: actionId,
        action_name: actionName,
        created_at: now.toISOString(),
        expires_at: expiresAt,
        status: 'active',
        analytics: {
            views: 0,
            conversions: 0,
            last_view: null
        }
    };

    savePage(metadata);

    return { url, metadata };
}

/**
 * Check if a page is expired
 */
export function isPageExpired(metadata: PageMetadata): boolean {
    if (!metadata.expires_at) return false;
    return new Date(metadata.expires_at) < new Date();
}

/**
 * Get page statistics summary
 */
export function getPageStats(brandName: string): {
    total_pages: number;
    total_views: number;
    total_conversions: number;
    conversion_rate: number;
} {
    const pages = getPagesByBrand(brandName);

    const totalViews = pages.reduce((sum, p) => sum + p.analytics.views, 0);
    const totalConversions = pages.reduce((sum, p) => sum + p.analytics.conversions, 0);

    return {
        total_pages: pages.length,
        total_views: totalViews,
        total_conversions: totalConversions,
        conversion_rate: totalViews > 0 ? (totalConversions / totalViews) * 100 : 0
    };
}
