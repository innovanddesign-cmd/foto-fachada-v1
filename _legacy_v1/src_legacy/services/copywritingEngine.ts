/**
 * Copywriting Engine
 * ==================
 * Motor de generación de copy adaptado al vibe del negocio.
 * Aplica reglas de escritura basadas en brand_vibe y target_audience.
 */

import type { BrandVibe, BusinessDNA } from '../types';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface CopywritingRules {
    tone: 'direct' | 'warm' | 'elegant' | 'minimal' | 'playful';
    sentence_length: 'short' | 'medium' | 'long';
    typography_weight: 'regular' | 'bold' | 'extra-bold';
    punctuation_style: 'minimal' | 'exclamatory' | 'formal';
    use_emojis: boolean;
    translate_to: 'en' | null;
    css_classes: string[];
}

export interface CopyVariant {
    es: string;
    en: string;
}

// ─────────────────────────────────────────────────────────────
// VIBE → RULES MAPPING
// ─────────────────────────────────────────────────────────────

const VIBE_RULES: Record<BrandVibe, Omit<CopywritingRules, 'translate_to'>> = {
    canalla: {
        tone: 'direct',
        sentence_length: 'short',
        typography_weight: 'extra-bold',
        punctuation_style: 'minimal',
        use_emojis: false,
        css_classes: ['font-black', 'uppercase', 'tracking-tight']
    },
    tradicional: {
        tone: 'warm',
        sentence_length: 'medium',
        typography_weight: 'regular',
        punctuation_style: 'formal',
        use_emojis: false,
        css_classes: ['font-serif', 'tracking-normal']
    },
    lujo: {
        tone: 'elegant',
        sentence_length: 'long',
        typography_weight: 'regular',
        punctuation_style: 'formal',
        use_emojis: false,
        css_classes: ['font-serif', 'italic', 'tracking-wide']
    },
    industrial: {
        tone: 'minimal',
        sentence_length: 'short',
        typography_weight: 'bold',
        punctuation_style: 'minimal',
        use_emojis: false,
        css_classes: ['font-mono', 'uppercase', 'tracking-widest']
    },
    moderno: {
        tone: 'playful',
        sentence_length: 'medium',
        typography_weight: 'bold',
        punctuation_style: 'exclamatory',
        use_emojis: true,
        css_classes: ['font-sans', 'tracking-tight']
    },
    acogedor: {
        tone: 'warm',
        sentence_length: 'medium',
        typography_weight: 'regular',
        punctuation_style: 'exclamatory',
        use_emojis: true,
        css_classes: ['font-sans', 'rounded']
    }
};

// ─────────────────────────────────────────────────────────────
// COPY TEMPLATES BY VIBE
// ─────────────────────────────────────────────────────────────

const COPY_TEMPLATES: Record<BrandVibe, {
    urgency: CopyVariant;
    cta_primary: CopyVariant;
    cta_secondary: CopyVariant;
    welcome: CopyVariant;
    quality: CopyVariant;
    exclusive: CopyVariant;
}> = {
    canalla: {
        urgency: { es: 'Solo hoy.', en: 'Today only.' },
        cta_primary: { es: '¿Vienes o qué?', en: 'Coming or what?' },
        cta_secondary: { es: 'Yo quiero.', en: 'I want it.' },
        welcome: { es: 'Tu sitio.', en: 'Your spot.' },
        quality: { es: 'Sin mierdas.', en: 'No BS.' },
        exclusive: { es: 'Para pocos.', en: 'For the few.' }
    },
    tradicional: {
        urgency: { es: 'Oferta por tiempo limitado', en: 'Limited time offer' },
        cta_primary: { es: 'Descubre nuestra tradición', en: 'Discover our tradition' },
        cta_secondary: { es: 'Saber más', en: 'Learn more' },
        welcome: { es: 'Bienvenido a casa', en: 'Welcome home' },
        quality: { es: 'Elaborado con esmero desde siempre', en: 'Crafted with care since day one' },
        exclusive: { es: 'Reservado para quienes aprecian lo auténtico', en: 'Reserved for those who appreciate the authentic' }
    },
    lujo: {
        urgency: { es: 'Una oportunidad singular', en: 'A singular opportunity' },
        cta_primary: { es: 'Solicitar experiencia', en: 'Request experience' },
        cta_secondary: { es: 'Explorar', en: 'Explore' },
        welcome: { es: 'Le esperábamos', en: 'We were expecting you' },
        quality: { es: 'Excelencia en cada detalle', en: 'Excellence in every detail' },
        exclusive: { es: 'Para paladares selectos', en: 'For discerning palates' }
    },
    industrial: {
        urgency: { es: 'AHORA', en: 'NOW' },
        cta_primary: { es: 'PROBAR', en: 'TRY' },
        cta_secondary: { es: 'VER MÁS', en: 'SEE MORE' },
        welcome: { es: 'ENTRA', en: 'ENTER' },
        quality: { es: 'PROCESO. PRODUCTO. PERFECCIÓN.', en: 'PROCESS. PRODUCT. PERFECTION.' },
        exclusive: { es: 'EDICIÓN LIMITADA', en: 'LIMITED EDITION' }
    },
    moderno: {
        urgency: { es: '¡No te lo pierdas! 🔥', en: "Don't miss it! 🔥" },
        cta_primary: { es: '¡Lo quiero! ✨', en: 'I want it! ✨' },
        cta_secondary: { es: 'Descubrir más', en: 'Discover more' },
        welcome: { es: '¡Hola! 👋', en: 'Hey! 👋' },
        quality: { es: 'Hecho con amor 💜', en: 'Made with love 💜' },
        exclusive: { es: 'Solo para ti 🎁', en: 'Just for you 🎁' }
    },
    acogedor: {
        urgency: { es: '¡Date prisa, cariño!', en: 'Hurry up, dear!' },
        cta_primary: { es: 'Ven a probarlo', en: 'Come try it' },
        cta_secondary: { es: 'Más información', en: 'More info' },
        welcome: { es: '¡Qué alegría verte!', en: 'So glad to see you!' },
        quality: { es: 'Hecho como en casa', en: 'Homemade with love' },
        exclusive: { es: 'Nuestro secreto mejor guardado', en: 'Our best kept secret' }
    }
};

// ─────────────────────────────────────────────────────────────
// MAIN ENGINE
// ─────────────────────────────────────────────────────────────

/**
 * Get copywriting rules based on BusinessDNA
 */
export function getCopywritingRules(dna: BusinessDNA): CopywritingRules {
    const baseRules = VIBE_RULES[dna.brand_vibe] || VIBE_RULES.moderno;

    // Determine if translation is needed
    const needsTranslation =
        dna.target_audience === 'turista_uk' ||
        dna.target_audience === 'turista_eu' ||
        dna.language_preference === 'en' ||
        dna.language_preference === 'es_en';

    return {
        ...baseRules,
        translate_to: needsTranslation ? 'en' : null
    };
}

/**
 * Get copy variant based on vibe and language
 */
export function getCopy(
    vibe: BrandVibe,
    copyType: keyof typeof COPY_TEMPLATES.canalla,
    language: 'es' | 'en' = 'es'
): string {
    const templates = COPY_TEMPLATES[vibe] || COPY_TEMPLATES.moderno;
    return templates[copyType][language];
}

/**
 * Transform text according to vibe rules
 */
export function transformText(text: string, vibe: BrandVibe): string {
    const rules = VIBE_RULES[vibe];

    let transformed = text;

    // Apply typography weight styling hints
    if (rules.typography_weight === 'extra-bold') {
        // For canalla: make text more punchy
        transformed = transformed
            .replace(/\./g, '. ')
            .replace(/,/g, '. ')
            .trim();
    }

    // Apply punctuation style
    if (rules.punctuation_style === 'minimal') {
        transformed = transformed.replace(/!/g, '.').replace(/\?+/g, '?');
    } else if (rules.punctuation_style === 'exclamatory') {
        if (!transformed.endsWith('!') && !transformed.endsWith('?')) {
            transformed += '!';
        }
    }

    // Apply case for industrial
    if (vibe === 'industrial') {
        transformed = transformed.toUpperCase();
    }

    return transformed;
}

/**
 * Generate action-specific copy based on DNA
 */
export function generateActionCopy(
    dna: BusinessDNA,
    actionId: number,
    productName?: string
): Record<string, string> {
    const rules = getCopywritingRules(dna);
    const lang = rules.translate_to || 'es';
    const vibe = dna.brand_vibe;

    const product = productName || dna.detected_products[0] || 'nuestro producto';

    // Action-specific copy generation
    switch (actionId) {
        case 1: // Oferta Flash
            return {
                titulo: transformText(
                    lang === 'en' ? `${product} + Special Price` : `${product} + Precio Especial`,
                    vibe
                ),
                urgencia: getCopy(vibe, 'urgency', lang),
                cta: getCopy(vibe, 'cta_primary', lang)
            };

        case 2: // Comparador Pro
            return {
                titulo: transformText(
                    lang === 'en' ? 'See the difference' : 'Ve la diferencia',
                    vibe
                ),
                cta: transformText(
                    lang === 'en' ? 'Get the best price' : 'Consigue el mejor precio',
                    vibe
                )
            };

        case 3: // Rasca y Gana
            return {
                mensaje_inicial: transformText(
                    lang === 'en' ? 'Scratch and win!' : '¡Rasca y gana!',
                    vibe
                ),
                mensaje_ganador: transformText(
                    lang === 'en' ? 'Congratulations!' : '¡Enhorabuena!',
                    vibe
                )
            };

        case 4: // Rachas de Visita
            return {
                titulo: transformText(
                    lang === 'en' ? 'Your loyalty streak' : 'Tu racha de fidelidad',
                    vibe
                ),
                mensaje_motivacional: transformText(
                    lang === 'en' ? 'Keep it up!' : '¡Sigue así!',
                    vibe
                )
            };

        case 5: // Producto Gancho
            return {
                titulo: transformText(
                    lang === 'en' ? `Free ${product}` : `${product} gratis`,
                    vibe
                ),
                descripcion: transformText(
                    lang === 'en' ? 'Your gift is waiting' : 'Tu regalo te espera',
                    vibe
                )
            };

        case 6: // Trae a un Amigo
            return {
                titulo: transformText(
                    lang === 'en' ? 'Bring a friend, both win' : 'Trae a un amigo, ambos ganáis',
                    vibe
                ),
                cta: getCopy(vibe, 'cta_primary', lang)
            };

        case 7: // Feedback + Incentivo
            return {
                titulo: transformText(
                    lang === 'en' ? 'Your opinion matters' : 'Tu opinión importa',
                    vibe
                ),
                agradecimiento: transformText(
                    lang === 'en' ? 'Thanks for helping us!' : '¡Gracias por ayudarnos!',
                    vibe
                )
            };

        case 8: // Guía del Experto
            return {
                titulo: transformText(
                    lang === 'en' ? `The 3 secrets of ${product}` : `Los 3 secretos de ${product}`,
                    vibe
                ),
                cta: transformText(
                    lang === 'en' ? `Try ${product} now` : `Probar ${product} ahora`,
                    vibe
                )
            };

        case 9: // Recomendado para Ti
            return {
                titulo: transformText(
                    lang === 'en' ? 'Find your perfect match' : 'Encuentra tu match perfecto',
                    vibe
                ),
                resultado: transformText(
                    lang === 'en' ? 'Your Perfect Match' : 'Tu Match Perfecto',
                    vibe
                )
            };

        default:
            return {
                titulo: getCopy(vibe, 'welcome', lang),
                cta: getCopy(vibe, 'cta_primary', lang)
            };
    }
}

/**
 * Get CSS classes for styling based on vibe
 */
export function getVibeStyles(vibe: BrandVibe): {
    fontFamily: string;
    fontWeight: string;
    letterSpacing: string;
    textTransform: string;
} {
    const vibeStyles: Record<BrandVibe, ReturnType<typeof getVibeStyles>> = {
        canalla: {
            fontFamily: "'Inter', sans-serif",
            fontWeight: '900',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase'
        },
        tradicional: {
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: '400',
            letterSpacing: '0',
            textTransform: 'none'
        },
        lujo: {
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: '400',
            letterSpacing: '0.05em',
            textTransform: 'none'
        },
        industrial: {
            fontFamily: "'Courier New', monospace",
            fontWeight: '700',
            letterSpacing: '0.1em',
            textTransform: 'uppercase'
        },
        moderno: {
            fontFamily: "'Inter', sans-serif",
            fontWeight: '700',
            letterSpacing: '-0.01em',
            textTransform: 'none'
        },
        acogedor: {
            fontFamily: "'Inter', sans-serif",
            fontWeight: '500',
            letterSpacing: '0',
            textTransform: 'none'
        }
    };

    return vibeStyles[vibe] || vibeStyles.moderno;
}
