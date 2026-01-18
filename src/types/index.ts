// ─────────────────────────────────────────────────────────────
// BUSINESS DNA TYPES - Motor de conexión Análisis → Simple Pages
// ─────────────────────────────────────────────────────────────

export type BrandVibe = 'canalla' | 'tradicional' | 'lujo' | 'industrial' | 'moderno' | 'acogedor';
export type AudienceType = 'turista_uk' | 'turista_eu' | 'senior_nacional' | 'local_joven' | 'familias' | 'profesional';
export type LocationContext = 'turistica' | 'barrio' | 'centro' | 'industrial';
export type PriceRange = 'budget' | 'mid' | 'premium' | 'luxury';

// ─────────────────────────────────────────────────────────────
// UI SCHEMA GENERATIVO - Motor de Escaparates 2026
// ─────────────────────────────────────────────────────────────

/** Clasificación de Vibe 2026 para negocios */
export type BrandVibe2026 =
    | 'Urban-Tech'           // Moderno, tecnológico, startups
    | 'Mediterranean-Gourmet' // Gastronomía mediterránea elegante
    | 'Vintage-Cálido'       // Retro, acogedor, artesanal
    | 'Neon-Nightlife'       // Vida nocturna, clubes, bares
    | 'Chiringuito-Moderno'  // Playa, casual, veraniego
    | 'Industrial-Chic'      // Lofts, cervecerías artesanas
    | 'Wellness-Zen'         // Spa, yoga, bienestar
    | 'Street-Food'          // Comida rápida gourmet
    | 'Luxury-Boutique'      // Lujo, exclusividad
    | 'Family-Friendly';     // Familiar, accesible

/** Mapeo cromático avanzado con glassmorphism */
export interface ChromaticPalette {
    color_principal: string;   // Tono dominante de la fachada (hex)
    color_acento: string;      // Tono de contraste de letreros (hex)
    color_superficie: string;  // Tono para fondos con transparencia (rgba)
    gradiente_sugerido: string; // CSS gradient para fondos inmersivos
}

/** Par tipográfico para el escaparate */
export interface TypographyPair {
    headline: string;  // Google Font para títulos (peso 700-900)
    body: string;      // Google Font para cuerpo (peso 400)
}

/** Identidad de marca generada por IA */
export interface BrandIdentity2026 {
    vibe: BrandVibe2026;
    palette: ChromaticPalette;
    fonts: TypographyPair;
    tagline_sugerido: string;
    tono_copywriting: 'profesional' | 'casual' | 'premium' | 'juvenil';
    valores_clave?: string[]; // Nuevos valores detectados
    descripcion_visual?: string; // Descripción de la estética
}

/** Tipos de componentes UI disponibles para el escaparate */
export type UIComponentType =
    | 'HeroVideoBackground'   // Hero con video/imagen de fondo
    | 'HeroGradient'          // Hero con gradiente
    | 'FlashCard_Offer'       // Tarjeta de oferta flash
    | 'Instagram_Feed_Style'  // Feed estilo Instagram
    | 'Menu_Categories'       // Categorías de menú scrollable
    | 'Contact_Glass'         // Tarjeta glassmorphism de contacto
    | 'Location_Map'          // Mapa interactivo
    | 'Reviews_Carousel'      // Carrusel de reseñas
    | 'Gallery_Masonry'       // Galería tipo masonry
    | 'Banner_Promocional'    // Banner de promoción
    | 'Reservations_CTA'      // Botón de reservas
    | 'Social_Links'          // Enlaces a redes sociales
    | 'Services_Grid'         // Grid de servicios y precios
    | 'Testimonials_Carousel' // Testimonios de clientes
    | 'Event_Calendar'        // Calendario de eventos
    | 'WhatsApp_Float'        // Botón flotante de WhatsApp
    | 'Spacer'                // Espaciador vertical
    | 'Footer_Simple';        // Footer simple de cierre

/** Campo de configuración para un componente */
export interface UIConfigField {
    key: string;
    label: string;           // Siempre en español
    type: 'text' | 'tel' | 'url' | 'textarea' | 'file' | 'number' | 'color' | 'list';
    placeholder: string;     // Siempre en español
    required: boolean;
    default?: string;
}

/** Componente individual del escaparate */
export interface UIComponent {
    id: string;
    type: UIComponentType;
    content: Record<string, string>;    // Contenido pre-generado por IA
    config_fields: UIConfigField[];     // Campos que el usuario debe configurar
    order: number;                      // Orden en la página
    visible: boolean;
}

/** Schema completo del escaparate generado */
export interface UISchema {
    brand_identity: BrandIdentity2026;
    escaparate_structure: UIComponent[];
    generated_at: string;
    version: number;
    variability_seed: string;  // Para test de variabilidad
}

export interface BusinessDNA {
    // Identidad visual
    brand_vibe: BrandVibe;
    primary_color: string;
    secondary_color: string;
    accent_color: string;

    // Contexto del negocio
    business_type: string;
    business_niche: string;
    target_audience: AudienceType;

    // Elementos detectados
    detected_services: string[];
    detected_products: string[];
    price_range: PriceRange;

    // Ubicación y contexto
    location_context: LocationContext;
    language_preference: 'es' | 'en' | 'es_en' | 'multi';

    // Metadatos
    confidence_score: number;
    analysis_timestamp: string;
}

// ─────────────────────────────────────────────────────────────
// BRAND DATA - Extracted from storefront image
// ─────────────────────────────────────────────────────────────

export interface BrandData {
    name: string;
    businessType: string;
    niche?: string;
    tagline?: string;
    description: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
    };
    typography: string;
    style: string;
    logoUrl?: string;
    targetAudience?: string;
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
    address?: string;
    hours?: string;
    // Nuevo: DNA extendido opcional
    dna?: BusinessDNA;
}

// ─────────────────────────────────────────────────────────────
// LANDING UTILITIES - Funciones adicionales para la landing
// ─────────────────────────────────────────────────────────────

export type UtilityId =
    | 'instagram' | 'facebook' | 'tiktok'      // Redes sociales
    | 'whatsapp' | 'phone'                      // Contacto
    | 'location'                                 // Ubicación
    | 'menu' | 'services'                        // Carta/Servicios
    | 'reviews'                                  // Reseñas
    | 'gallery';                                 // Galería

export interface UtilityDefinition {
    id: UtilityId;
    name: string;
    emoji: string;
    category: 'social' | 'contact' | 'info' | 'media';
    description: string;
    fields: UtilityConfigField[];
}

export interface UtilityConfigField {
    key: string;
    label: string;
    type: 'text' | 'tel' | 'url' | 'textarea' | 'file' | 'list';
    placeholder: string;
    required: boolean;
}

export interface UtilityConfig {
    id: UtilityId;
    enabled: boolean;
    config: Record<string, string>;
}

export interface LandingUtilities {
    selected: UtilityId[];
    configs: Record<UtilityId, Record<string, string>>;
}

// Marketing strategy generated by AI
export interface WidgetConfigField {
    key: string;
    label: string;
    type: 'text' | 'number' | 'color' | 'tel' | 'email' | 'textarea' | 'list';
    default?: string;
    placeholder?: string;
}

export interface GenerativeStrategy {
    id: string;
    emoji: string;
    title: string;
    description: string;
    ui_config_schema: WidgetConfigField[];
    code_template: string;
}

export interface MarketingStrategy {
    id: string;
    title: string;
    description: string;
    reasoning: string;
    tactics: string[];
    seasonalContext?: string;
    locationContext?: string;
    // New fields for Generative Engine (optional for backward compatibility)
    emoji?: string;
    code_template?: string;
    ui_config_schema?: WidgetConfigField[];
}

// Link/feature for the landing page
export interface LandingLink {
    id: string;
    name: string;
    emoji: string;
    description: string;
    type: 'gamification' | 'reservation' | 'menu' | 'contact' | 'social' | 'promo' | 'info';
    engagement: 'low' | 'medium' | 'high' | 'very-high';
    conversion: 'low' | 'medium' | 'high' | 'very-high';
    isPremium: boolean;
    regenerateCount: number;
    url?: string; // Generated URL for this specific link's content page
}

// Landing page configuration
// Landing page styling configuration
export interface LandingPageConfig {
    background: {
        type: 'solid' | 'gradient' | 'image' | 'texture';
        value: string; // Hex color, gradient string, image URL, or texture ID
        overlay?: string; // Optional overlay color/opacity (e.g. "rgba(0,0,0,0.5)")
    };
    header: {
        logoSize: number; // 60-120
        titleColor: string;
        subtitleColor: string;
        layout: 'centered' | 'left';
    };
    buttons: {
        style: 'pill' | 'rounded' | 'sharp' | 'glass';
        background: string;
        textColor: string;
        border?: string;
        shadow?: string;
    };
    separators: {
        top?: 'wave' | 'zigzag' | 'dome' | 'none';
        bottom?: 'wave' | 'zigzag' | 'dome' | 'none';
        color: string;
    };
    font: string;
}

export interface LandingConfig {
    id: string;
    name: string;
    brand: BrandData;
    links: LandingLink[];
    // Replaced simple "template" string with full config object
    // We allow a "presetId" to track which theme started it, but "config" holds the real data
    presetId?: string;
    config: LandingPageConfig;
    createdAt: Date;
    updatedAt: Date;
}

// Project containing multiple landings/campaigns
export interface Project {
    id: string;
    name: string;
    description?: string;
    campaign?: string; // e.g., "Navidad 2024", "Black Friday"
    landings: LandingConfig[];
    status: 'active' | 'draft' | 'archived';
    createdAt: Date;
    updatedAt: Date;
}

// User subscription tier
export type SubscriptionTier = 'free' | 'plus' | 'pro' | 'premium';
export type UserTier = SubscriptionTier; // Alias for convenience

// User data
export interface User {
    id: string;
    email: string;
    name?: string;
    tier: SubscriptionTier;
    projects: Project[];
    limits: UserLimits;
}

// Usage limits based on subscription
export interface UserLimits {
    maxProjects: number;
    maxLandingsPerProject: number;
    maxLinkRegenerations: number;
    availableTemplates: number;
    hasAnalytics: boolean;
    hasPremiumFeatures: boolean;
    posterHasWatermark: boolean;
}

// Subscription tier limits
export const TIER_LIMITS: Record<SubscriptionTier, UserLimits> = {
    free: {
        maxProjects: 1,
        maxLandingsPerProject: 1,
        maxLinkRegenerations: 3,
        availableTemplates: 2,
        hasAnalytics: false,
        hasPremiumFeatures: false,
        posterHasWatermark: true
    },
    plus: {
        maxProjects: 5,
        maxLandingsPerProject: 3,
        maxLinkRegenerations: 10,
        availableTemplates: 4,
        hasAnalytics: true,
        hasPremiumFeatures: false,
        posterHasWatermark: false
    },
    pro: {
        maxProjects: 20,
        maxLandingsPerProject: 10,
        maxLinkRegenerations: -1, // unlimited
        availableTemplates: 4,
        hasAnalytics: true,
        hasPremiumFeatures: true,
        posterHasWatermark: false
    },
    premium: {
        maxProjects: -1, // unlimited
        maxLandingsPerProject: -1,
        maxLinkRegenerations: -1,
        availableTemplates: 4,
        hasAnalytics: true,
        hasPremiumFeatures: true,
        posterHasWatermark: false
    }
};

// App flow step
export type FlowStep = 'upload' | 'analysis' | 'strategy' | 'links' | 'design' | 'poster' | 'complete';

export const FLOW_STEPS: { id: FlowStep; name: string; icon: string }[] = [
    { id: 'upload', name: 'Subir Foto', icon: 'Camera' },
    { id: 'analysis', name: 'Análisis', icon: 'Sparkles' },
    { id: 'strategy', name: 'Estrategias', icon: 'Target' },
    { id: 'links', name: 'Enlaces', icon: 'Link' },
    { id: 'design', name: 'Diseño', icon: 'Layout' },
    { id: 'poster', name: 'Cartel QR', icon: 'QrCode' }
];

// API Response types
export interface VisionAnalysisResponse {
    success: boolean;
    data?: BrandData;
    error?: string;
}

export interface StrategyGenerationResponse {
    success: boolean;
    strategies?: MarketingStrategy[];
    error?: string;
}

export interface LinksGenerationResponse {
    success: boolean;
    links?: LandingLink[];
    error?: string;
}
