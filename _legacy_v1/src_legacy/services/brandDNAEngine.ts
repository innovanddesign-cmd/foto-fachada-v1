/**
 * Brand DNA Engine - Motor de Análisis de ADN de Marca
 * Procesa imágenes de fachadas y extrae identidad visual avanzada
 * 
 * Características:
 * - Mapeo cromático avanzado (principal, acento, superficie, gradiente)
 * - Detección de "Vibe" 2026
 * - Selección tipográfica dinámica
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
    BrandVibe2026,
    ChromaticPalette,
    TypographyPair,
    BrandIdentity2026,
    BrandData
} from '../types';

// ─────────────────────────────────────────────────────────────
// CONFIGURACIÓN
// ─────────────────────────────────────────────────────────────

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Vibes disponibles para clasificación
const AVAILABLE_VIBES: BrandVibe2026[] = [
    'Urban-Tech', 'Mediterranean-Gourmet', 'Vintage-Cálido', 'Neon-Nightlife',
    'Chiringuito-Moderno', 'Industrial-Chic', 'Wellness-Zen', 'Street-Food',
    'Luxury-Boutique', 'Family-Friendly'
];

// Pares tipográficos sugeridos por vibe
const TYPOGRAPHY_SUGGESTIONS: Record<BrandVibe2026, TypographyPair> = {
    'Urban-Tech': { headline: 'Space Grotesk', body: 'Inter' },
    'Mediterranean-Gourmet': { headline: 'Playfair Display', body: 'Lora' },
    'Vintage-Cálido': { headline: 'Merriweather', body: 'Source Sans Pro' },
    'Neon-Nightlife': { headline: 'Bebas Neue', body: 'Roboto' },
    'Chiringuito-Moderno': { headline: 'Montserrat', body: 'Open Sans' },
    'Industrial-Chic': { headline: 'Oswald', body: 'Nunito' },
    'Wellness-Zen': { headline: 'Cormorant Garamond', body: 'Raleway' },
    'Street-Food': { headline: 'Poppins', body: 'Mulish' },
    'Luxury-Boutique': { headline: 'Cinzel', body: 'Jost' },
    'Family-Friendly': { headline: 'Quicksand', body: 'Outfit' }
};

// ─────────────────────────────────────────────────────────────
// INTERFAZ DE RESPUESTA
// ─────────────────────────────────────────────────────────────

export interface BrandDNAResponse {
    success: boolean;
    identity?: BrandIdentity2026;
    brandData?: BrandData;
    error?: string;
}

// ─────────────────────────────────────────────────────────────
// MOTOR PRINCIPAL
// ─────────────────────────────────────────────────────────────

/**
 * Analiza imágenes de fachada y extrae el ADN de marca completo
 */
export async function analyzeBrandDNA(imagesBase64: string[]): Promise<BrandDNAResponse> {
    try {
        if (!genAI) {
            console.log('[BrandDNA] Sin API key, usando datos mock');
            await new Promise(resolve => setTimeout(resolve, 1500));
            return getMockBrandDNA();
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `Eres un Director de Arte y Branding experto en tendencias 2026. Tu misión es DECODIFICAR la identidad visual de este negocio basándote en la fotografía de su fachada.

TU OBJETIVO: Extraer un ADN de marca único, sofisticado y listo para diseño web de alta gama.

1. ANÁLISIS DE VIBE (ESTÉTICA):
Clasifica el local en UNO de estos estilos 2026:
- Urban-Tech (Moderno, minimalista, tecnológico)
- Mediterranean-Gourmet (Cálido, texturas naturales, elegante)
- Vintage-Cálido (Nostálgico, acogedor, madera)
- Neon-Nightlife (Oscuro, contrastes fuertes, vibrante)
- Chiringuito-Moderno (Relajado, aire libre, fresco)
- Industrial-Chic (Ladrillo visto, metal, moderno)
- Wellness-Zen (Limpio, suave, equilibrado)
- Street-Food (Dinámico, colorido, informal)
- Luxury-Boutique (Sofisticado, exclusivo, premium)
- Family-Friendly (Accesible, seguro, divertido)

2. MAPEO CROMÁTICO INTELIGENTE (NO HEX ALEATORIOS):
Extrae una paleta funcional de 5 niveles directamente de la imagen:
- Principal: El color dominante de la marca/fachada.
- Acento: Color de contraste para llamadas a la acción (CTAs).
- Superficie: Una versión muy suave/clara del principal para fondos glassmorphism (rgba).
- Gradiente: Un gradiente CSS lineal elegante usando los tonos detectados.

3. COPYWRITING ESTRATÉGICO (ESPAÑOL DE ESPAÑA):
- Tagline: Una frase gancho corta, magnética e invitadora. NO uses "Bienvenidos a".
- Tono: Define si el texto debe ser profesional, casual, premium o juvenil.

RESPONDE SOLO CON ESTE JSON ESTRICTO:
{
    "nombre_negocio": "Nombre detectado o inferido",
    "tipo_negocio": "Categoría específica (ej: Cafetería de Especialidad)",
    "nicho_especifico": "Descripción corta del nicho",
    "vibe": "NombreDelVibeExacto",
    "paleta": {
        "color_principal": "#HEX",
        "color_acento": "#HEX",
        "color_superficie": "rgba(r,g,b,0.1)",
        "gradiente_sugerido": "linear-gradient(...)"
    },
    "tipografia": {
        "headline": "NombreGoogleFont",
        "body": "NombreGoogleFont"
    },
    "tagline_sugerido": "Frase gancho en Español de España",
    "tono_copywriting": "profesional|casual|premium|juvenil",
    "descripcion_visual": "Breve descripción estética del local",
    "publico_objetivo": "Perfil del cliente ideal"
}

IMPORTANTE:
- Prioriza la DETECCIÓN REAL sobre la invención.
- Los colores deben armonizar entre sí.
- Textos 100% en Español de España de alta calidad editorial.`;

        // Preparar imágenes
        const imageParts = imagesBase64.map(base64 => {
            const data = base64.replace(/^data:image\/\w+;base64,/, '');
            return {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: data
                }
            };
        });

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();

        // Parsear respuesta
        const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        const rawData = JSON.parse(cleanedText);

        // Construir BrandIdentity2026
        const identity: BrandIdentity2026 = {
            vibe: (AVAILABLE_VIBES.includes(rawData.vibe) ? rawData.vibe : 'Mediterranean-Gourmet') as BrandVibe2026,
            palette: {
                color_principal: rawData.paleta?.color_principal || '#1e40af',
                color_acento: rawData.paleta?.color_acento || '#f59e0b',
                color_superficie: rawData.paleta?.color_superficie || 'rgba(30, 64, 175, 0.1)',
                gradiente_sugerido: rawData.paleta?.gradiente_sugerido || 'linear-gradient(135deg, #1e40af, #3b82f6)'
            },
            fonts: rawData.tipografia || TYPOGRAPHY_SUGGESTIONS[rawData.vibe as BrandVibe2026] || { headline: 'Montserrat', body: 'Open Sans' },
            tagline_sugerido: rawData.tagline_sugerido || 'Descubre tu nuevo lugar favorito',
            tono_copywriting: rawData.tono_copywriting || 'profesional',
            descripcion_visual: rawData.descripcion_visual
        };

        // Construir BrandData compatible
        const brandData: BrandData = {
            name: rawData.nombre_negocio || 'Tu Negocio',
            businessType: rawData.tipo_negocio || 'negocio',
            niche: rawData.nicho_especifico,
            tagline: rawData.tagline_sugerido,
            description: rawData.descripcion_ambiente || '',
            colors: {
                primary: identity.palette.color_principal,
                secondary: identity.palette.color_superficie.replace('rgba', 'hsl').split(',')[0] + ')',
                accent: identity.palette.color_acento
            },
            typography: identity.fonts.headline,
            style: identity.vibe,
            targetAudience: rawData.publico_objetivo
        };

        return {
            success: true,
            identity,
            brandData
        };

    } catch (error) {
        console.error('[BrandDNA] Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
}

// ─────────────────────────────────────────────────────────────
// DATOS MOCK
// ─────────────────────────────────────────────────────────────

/**
 * Genera datos mock con variabilidad para testing
 */
export function getMockBrandDNA(): BrandDNAResponse {
    const mockVariants = [
        // Variante 1: Bar de playa
        {
            identity: {
                vibe: 'Chiringuito-Moderno' as BrandVibe2026,
                palette: {
                    color_principal: '#0ea5e9',
                    color_acento: '#fbbf24',
                    color_superficie: 'rgba(14, 165, 233, 0.1)',
                    gradiente_sugerido: 'linear-gradient(135deg, #0ea5e9, #06b6d4)'
                },
                fonts: { headline: 'Montserrat', body: 'Open Sans' },
                tagline_sugerido: 'Sol, brisa y los mejores cócteles',
                tono_copywriting: 'casual' as const
            },
            brandData: {
                name: 'Chiringuito La Ola',
                businessType: 'bar',
                niche: 'Bar de playa con cócteles',
                tagline: 'Sol, brisa y los mejores cócteles',
                description: 'Un espacio fresco y relajado junto al mar con decoración mediterránea y ambiente chill-out.',
                colors: { primary: '#0ea5e9', secondary: '#e0f2fe', accent: '#fbbf24' },
                typography: 'Montserrat',
                style: 'Chiringuito-Moderno',
                targetAudience: 'Turistas y locales 25-45 años'
            }
        },
        // Variante 2: Peluquería urbana
        {
            identity: {
                vibe: 'Urban-Tech' as BrandVibe2026,
                palette: {
                    color_principal: '#18181b',
                    color_acento: '#a855f7',
                    color_superficie: 'rgba(24, 24, 27, 0.1)',
                    gradiente_sugerido: 'linear-gradient(135deg, #18181b, #3f3f46)'
                },
                fonts: { headline: 'Space Grotesk', body: 'Inter' },
                tagline_sugerido: 'Tu estilo, nuestra pasión',
                tono_copywriting: 'premium' as const
            },
            brandData: {
                name: 'Urban Cuts Studio',
                businessType: 'peluquería',
                niche: 'Barbería urbana premium',
                tagline: 'Tu estilo, nuestra pasión',
                description: 'Estudio de cortes moderno con estética industrial y servicio personalizado.',
                colors: { primary: '#18181b', secondary: '#f4f4f5', accent: '#a855f7' },
                typography: 'Space Grotesk',
                style: 'Urban-Tech',
                targetAudience: 'Hombres jóvenes 18-40 años'
            }
        },
        // Variante 3: Restaurante italiano
        {
            identity: {
                vibe: 'Mediterranean-Gourmet' as BrandVibe2026,
                palette: {
                    color_principal: '#b91c1c',
                    color_acento: '#16a34a',
                    color_superficie: 'rgba(185, 28, 28, 0.08)',
                    gradiente_sugerido: 'linear-gradient(135deg, #b91c1c, #dc2626)'
                },
                fonts: { headline: 'Playfair Display', body: 'Lora' },
                tagline_sugerido: 'Auténticos sabores de Italia en tu mesa',
                tono_copywriting: 'profesional' as const
            },
            brandData: {
                name: 'Trattoria Bella Vista',
                businessType: 'restaurante',
                niche: 'Restaurante italiano tradicional',
                tagline: 'Auténticos sabores de Italia en tu mesa',
                description: 'Trattoria familiar con recetas tradicionales, pasta fresca y ambiente acogedor.',
                colors: { primary: '#b91c1c', secondary: '#fef2f2', accent: '#16a34a' },
                typography: 'Playfair Display',
                style: 'Mediterranean-Gourmet',
                targetAudience: 'Familias y parejas 30-60 años'
            }
        }
    ];

    // Seleccionar variante aleatoria para test de variabilidad
    const variant = mockVariants[Math.floor(Math.random() * mockVariants.length)];

    return {
        success: true,
        identity: variant.identity,
        brandData: variant.brandData as BrandData
    };
}

/**
 * Genera paleta cromática a partir de un color principal
 */
export function generateChromaticPalette(primaryHex: string): ChromaticPalette {
    // Extraer RGB del hex
    const hex = primaryHex.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Generar color de acento (complementario simplificado)
    const accentR = 255 - r;
    const accentG = 255 - g;
    const accentB = 255 - b;
    const accentHex = `#${accentR.toString(16).padStart(2, '0')}${accentG.toString(16).padStart(2, '0')}${accentB.toString(16).padStart(2, '0')}`;

    // Generar color de superficie (principal con baja opacidad)
    const superficieRgba = `rgba(${r}, ${g}, ${b}, 0.1)`;

    // Generar gradiente (principal a versión más clara)
    const lighterR = Math.min(255, r + 40);
    const lighterG = Math.min(255, g + 40);
    const lighterB = Math.min(255, b + 40);
    const lighterHex = `#${lighterR.toString(16).padStart(2, '0')}${lighterG.toString(16).padStart(2, '0')}${lighterB.toString(16).padStart(2, '0')}`;

    return {
        color_principal: primaryHex,
        color_acento: accentHex,
        color_superficie: superficieRgba,
        gradiente_sugerido: `linear-gradient(135deg, ${primaryHex}, ${lighterHex})`
    };
}

/**
 * Obtiene par tipográfico sugerido por vibe
 */
export function getTypographyForVibe(vibe: BrandVibe2026): TypographyPair {
    return TYPOGRAPHY_SUGGESTIONS[vibe] || { headline: 'Montserrat', body: 'Open Sans' };
}
