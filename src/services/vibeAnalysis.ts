/**
 * Vibe Analysis Types and Utilities
 * ===================================
 * Frontend support for the Generative Design Brain
 */

// ─────────────────────────────────────────────────────────────
// VIBE DEFINITIONS
// ─────────────────────────────────────────────────────────────

export interface VibeProfile {
    id: string;
    name: string;
    emotion: string;
    description: string;
    emoji: string;
    color: string;
    typography: string[];
    visualMechanics: string[];
    keywords: string[];
}

export const VIBE_PROFILES: VibeProfile[] = [
    {
        id: 'nostalgia',
        name: 'Nostalgia & Coleccionismo',
        emotion: 'Nostalgia, detalle, pasión',
        description: 'Para negocios centrados en objetos de colección, memorabilia, retro gaming',
        emoji: '🎮',
        color: '#8B5CF6',
        typography: ['Press Start 2P', 'Orbitron', 'VT323'],
        visualMechanics: ['gallery', 'wishlist', 'collection-grid'],
        keywords: ['figuras', 'colección', 'vintage', 'retro', 'gaming', 'comics', 'cómic']
    },
    {
        id: 'adventure',
        name: 'Energía & Aventura',
        emotion: 'Libertad, adrenalina, naturaleza',
        description: 'Para deportes extremos, surf, skate, aventuras outdoor',
        emoji: '🏄',
        color: '#0EA5E9',
        typography: ['Permanent Marker', 'Bangers', 'Satisfy'],
        visualMechanics: ['video-hero', 'action-slider', 'challenge-tracker'],
        keywords: ['surf', 'skate', 'aventura', 'extreme', 'outdoor', 'deportes']
    },
    {
        id: 'gourmet',
        name: 'Sofisticación Gourmet',
        emotion: 'Elegancia, sabor, experiencia',
        description: 'Para restaurantes, bares de autor, gastronomía premium',
        emoji: '🍷',
        color: '#7C3AED',
        typography: ['Playfair Display', 'Cormorant Garamond', 'Libre Baskerville'],
        visualMechanics: ['menu-card', 'reservation', 'chef-story'],
        keywords: ['restaurante', 'gourmet', 'vino', 'gastronomía', 'bar', 'coctel']
    },
    {
        id: 'artisanal',
        name: 'Calidez Artesanal',
        emotion: 'Hogar, tradición, handmade',
        description: 'Para panaderías, cafeterías, negocios artesanales',
        emoji: '🥐',
        color: '#D97706',
        typography: ['Quicksand', 'Nunito', 'Comfortaa'],
        visualMechanics: ['product-showcase', 'story-carousel', 'warm-cta'],
        keywords: ['panadería', 'café', 'artesanal', 'casero', 'tradicional', 'pastelería']
    },
    {
        id: 'tech',
        name: 'Innovación Tech',
        emotion: 'Futuro, precisión, innovación',
        description: 'Para startups, tecnología, servicios digitales',
        emoji: '💻',
        color: '#06B6D4',
        typography: ['Space Grotesk', 'JetBrains Mono', 'Outfit'],
        visualMechanics: ['feature-grid', 'comparison-table', 'demo-video'],
        keywords: ['tecnología', 'startup', 'digital', 'software', 'app', 'innovación']
    },
    {
        id: 'wellness',
        name: 'Calma & Bienestar',
        emotion: 'Paz, equilibrio, zen',
        description: 'Para spa, yoga, centros de bienestar',
        emoji: '🧘',
        color: '#10B981',
        typography: ['Raleway', 'Josefin Sans', 'Montserrat'],
        visualMechanics: ['testimonials', 'benefits-list', 'booking-form'],
        keywords: ['spa', 'yoga', 'wellness', 'bienestar', 'masaje', 'meditación']
    },
    {
        id: 'industrial',
        name: 'Fuerza Industrial',
        emotion: 'Potencia, durabilidad, confianza',
        description: 'Para talleres, mecánicos, ferreterías',
        emoji: '🔧',
        color: '#64748B',
        typography: ['Oswald', 'Bebas Neue', 'Anton'],
        visualMechanics: ['before-after', 'services-grid', 'quote-calculator'],
        keywords: ['taller', 'mecánico', 'ferretería', 'industrial', 'reparación', 'construcción']
    },
    {
        id: 'fashion',
        name: 'Estilo & Moda',
        emotion: 'Tendencia, exclusividad, estilo',
        description: 'Para boutiques, moda, accesorios',
        emoji: '👗',
        color: '#EC4899',
        typography: ['DM Serif Display', 'Fraunces', 'Bodoni Moda'],
        visualMechanics: ['lookbook', 'product-slider', 'style-quiz'],
        keywords: ['moda', 'boutique', 'ropa', 'accesorios', 'fashion', 'diseño']
    },
    {
        id: 'fitness',
        name: 'Potencia Fitness',
        emotion: 'Transformación, disciplina, fuerza',
        description: 'Para gimnasios, centros deportivos, trainers',
        emoji: '💪',
        color: '#EF4444',
        typography: ['Teko', 'Black Ops One', 'Russo One'],
        visualMechanics: ['challenge-board', 'progress-tracker', 'class-schedule'],
        keywords: ['gimnasio', 'fitness', 'gym', 'crossfit', 'entrenamiento', 'deporte']
    },
    {
        id: 'family',
        name: 'Ternura Familiar',
        emotion: 'Cariño, cuidado, familia',
        description: 'Para veterinarias, tiendas de mascotas, servicios familiares',
        emoji: '🐾',
        color: '#F472B6',
        typography: ['Baloo 2', 'Comic Neue', 'Patrick Hand'],
        visualMechanics: ['pet-gallery', 'tips-carousel', 'appointment-booking'],
        keywords: ['veterinaria', 'mascotas', 'perros', 'gatos', 'niños', 'familia']
    }
];

// ─────────────────────────────────────────────────────────────
// VIBE DETECTION
// ─────────────────────────────────────────────────────────────

/**
 * Detect the most appropriate vibe based on business type
 */
export function detectVibe(businessType: string): VibeProfile {
    const type = businessType.toLowerCase();

    for (const vibe of VIBE_PROFILES) {
        if (vibe.keywords.some(kw => type.includes(kw))) {
            return vibe;
        }
    }

    // Default to gourmet (most common local business)
    return VIBE_PROFILES.find(v => v.id === 'gourmet') || VIBE_PROFILES[0];
}

/**
 * Get typography recommendation for a business type
 */
export function getTypographyForVibe(vibeId: string): string {
    const vibe = VIBE_PROFILES.find(v => v.id === vibeId);
    return vibe?.typography[0] || 'Inter';
}

/**
 * Get visual mechanic recommendations
 */
export function getVisualMechanicsForVibe(vibeId: string): string[] {
    const vibe = VIBE_PROFILES.find(v => v.id === vibeId);
    return vibe?.visualMechanics || ['product-showcase'];
}

// ─────────────────────────────────────────────────────────────
// SMART FOOTER CONFIG
// ─────────────────────────────────────────────────────────────

export interface SmartFooterConfig {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
    address?: string;
    hours?: string;
    mapsUrl?: string;
}

/**
 * Generate Google Maps URL from address
 */
export function generateMapsUrl(address: string): string {
    return `https://maps.google.com/?q=${encodeURIComponent(address)}`;
}

/**
 * Generate WhatsApp URL
 */
export function generateWhatsAppUrl(phone: string, message?: string): string {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const url = `https://wa.me/${cleanPhone}`;
    return message ? `${url}?text=${encodeURIComponent(message)}` : url;
}
