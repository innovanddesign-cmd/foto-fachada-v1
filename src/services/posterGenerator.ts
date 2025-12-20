import { GoogleGenerativeAI } from '@google/generative-ai';
import type { BrandData } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface PosterConfig {
    layout: 'modern' | 'classic' | 'bold' | 'minimal';
    background: {
        type: 'gradient' | 'image' | 'texture' | 'solid';
        value: string;
        overlay?: string;
    };
    title: {
        text: string;
        fontSize: number;
        color: string;
        font: string;
        shadow?: string;
    };
    subtitle: {
        text: string;
        color: string;
    };
    callToAction: {
        text: string;
        background: string;
        textColor: string;
    };
    qrSection: {
        backgroundColor: string;
        borderColor: string;
        label: string;
    };
    footer: {
        text: string;
        color: string;
    };
}

/**
 * Genera una configuración de poster profesional basada en el análisis de marca
 */
export async function generatePosterDesign(
    brandData: BrandData,
    landingUrl: string
): Promise<PosterConfig> {
    if (!genAI) {
        // Modo demo: retorna configuración basada en el tipo de negocio
        return generateMockPosterDesign(brandData);
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Eres un diseñador gráfico profesional experto en carteles promocionales. Basándote en esta información de marca, genera una configuración para un CARTEL IMPRIMIBLE profesional.

INFORMACIÓN DE MARCA:
- Nombre: ${brandData.name}
- Tipo de negocio: ${brandData.businessType}
- Nicho: ${brandData.niche || 'General'}
- Estilo: ${brandData.style}
- Colores:
  - Primario: ${brandData.colors.primary}
  - Secundario: ${brandData.colors.secondary}
  - Acento: ${brandData.colors.accent}

INSTRUCCIONES:
1. Crea un título LLAMATIVO y CREATIVO para el cartel (ej: "¡Saborea el Paraíso!" para restaurante)
2. Genera un subtítulo descriptivo
3. Escribe un call-to-action persuasivo relacionado con escanear el QR
4. Define un layout apropiado (modern/classic/bold/minimal)
5. Crea una paleta de colores coherente con la marca
6. El cartel debe verse PROFESIONAL, como hecho por un diseñador gráfico

RESPONDE EN FORMATO JSON (sin markdown, solo el objeto):
{
  "layout": "modern" | "classic" | "bold" | "minimal",
  "backgroundType": "gradient" | "solid" | "texture",
  "backgroundValue": "valor CSS del fondo",
  "backgroundOverlay": "overlay opcional rgba",
  "titleText": "título creativo del cartel",
  "titleFontSize": número entre 48-72,
  "titleColor": "color hexadecimal",
  "titleFont": "fuente de Google Fonts",
  "titleShadow": "text-shadow CSS opcional",
  "subtitleText": "subtítulo descriptivo",
  "subtitleColor": "color hexadecimal",
  "ctaText": "call to action para escanear QR",
  "ctaBackground": "color o gradiente CSS",
  "ctaTextColor": "color hexadecimal",
  "qrBackgroundColor": "color hexadecimal para fondo del QR",
  "qrBorderColor": "color hexadecimal para borde",
  "qrLabel": "texto que aparece junto al QR",
  "footerText": "texto del footer",
  "footerColor": "color hexadecimal"
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parsear respuesta JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No se pudo parsear respuesta JSON');
        }

        const aiConfig = JSON.parse(jsonMatch[0]);

        // Construir PosterConfig
        const config: PosterConfig = {
            layout: aiConfig.layout,
            background: {
                type: aiConfig.backgroundType,
                value: aiConfig.backgroundValue,
                overlay: aiConfig.backgroundOverlay,
            },
            title: {
                text: aiConfig.titleText,
                fontSize: aiConfig.titleFontSize,
                color: aiConfig.titleColor,
                font: aiConfig.titleFont,
                shadow: aiConfig.titleShadow,
            },
            subtitle: {
                text: aiConfig.subtitleText,
                color: aiConfig.subtitleColor,
            },
            callToAction: {
                text: aiConfig.ctaText,
                background: aiConfig.ctaBackground,
                textColor: aiConfig.ctaTextColor,
            },
            qrSection: {
                backgroundColor: aiConfig.qrBackgroundColor,
                borderColor: aiConfig.qrBorderColor,
                label: aiConfig.qrLabel,
            },
            footer: {
                text: aiConfig.footerText,
                color: aiConfig.footerColor,
            },
        };

        return config;
    } catch (error) {
        console.error('Error generando poster con IA:', error);
        return generateMockPosterDesign(brandData);
    }
}

/**
 * Genera poster mock basado en reglas simples
 */
function generateMockPosterDesign(brandData: BrandData): PosterConfig {
    const businessType = brandData.businessType.toLowerCase();
    const style = brandData.style.toLowerCase();

    // Detectar tipo de negocio
    const isTropical = businessType.includes('bar') ||
        businessType.includes('restaurante') ||
        style.includes('tropical') ||
        style.includes('vibrante');

    const isTech = businessType.includes('tech') ||
        businessType.includes('software') ||
        style.includes('moderno') ||
        style.includes('digital');

    const isElegant = style.includes('elegante') ||
        style.includes('premium') ||
        style.includes('sofisticado');

    if (isTropical) {
        return {
            layout: 'bold',
            background: {
                type: 'gradient',
                value: `linear-gradient(135deg, ${brandData.colors.primary} 0%, ${brandData.colors.accent} 100%)`,
            },
            title: {
                text: `¡Descubre ${brandData.name}!`,
                fontSize: 64,
                color: '#FFFFFF',
                font: 'Fredoka One, cursive',
                shadow: '0 4px 20px rgba(0,0,0,0.3)',
            },
            subtitle: {
                text: `Tu ${brandData.businessType.toLowerCase()} favorito`,
                color: '#FFFFFF',
            },
            callToAction: {
                text: 'Escanea y Descubre Nuestro Menú',
                background: 'rgba(0,0,0,0.7)',
                textColor: '#FFD700',
            },
            qrSection: {
                backgroundColor: '#FFFFFF',
                borderColor: brandData.colors.accent,
                label: 'Escanea Aquí',
            },
            footer: {
                text: 'Síguenos en redes sociales',
                color: 'rgba(255,255,255,0.8)',
            },
        };
    }

    if (isTech) {
        return {
            layout: 'modern',
            background: {
                type: 'gradient',
                value: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
            },
            title: {
                text: `${brandData.name}`,
                fontSize: 56,
                color: '#4ade80',
                font: 'Rajdhani, sans-serif',
                shadow: '0 0 30px rgba(74, 222, 128, 0.5)',
            },
            subtitle: {
                text: 'El Futuro es Ahora',
                color: '#94a3b8',
            },
            callToAction: {
                text: 'Escanea para Más Información',
                background: 'linear-gradient(90deg, #4ade80 0%, #22d3ee 100%)',
                textColor: '#0f172a',
            },
            qrSection: {
                backgroundColor: '#FFFFFF',
                borderColor: '#4ade80',
                label: 'Código QR',
            },
            footer: {
                text: 'Innovación · Tecnología · Futuro',
                color: '#64748b',
            },
        };
    }

    if (isElegant) {
        return {
            layout: 'classic',
            background: {
                type: 'solid',
                value: '#1a1a1a',
            },
            title: {
                text: brandData.name,
                fontSize: 60,
                color: '#d4af37',
                font: 'Playfair Display, serif',
                shadow: '0 2px 10px rgba(212, 175, 55, 0.3)',
            },
            subtitle: {
                text: 'Experiencia Premium',
                color: '#c0c0c0',
            },
            callToAction: {
                text: 'Explora Nuestra Excelencia',
                background: 'transparent',
                textColor: '#d4af37',
            },
            qrSection: {
                backgroundColor: '#FFFFFF',
                borderColor: '#d4af37',
                label: 'Acceso Digital',
            },
            footer: {
                text: 'Elegancia · Calidad · Distinción',
                color: '#808080',
            },
        };
    }

    // Default: estilo moderno
    return {
        layout: 'modern',
        background: {
            type: 'gradient',
            value: `linear-gradient(135deg, ${brandData.colors.primary} 0%, ${brandData.colors.secondary} 100%)`,
        },
        title: {
            text: `¡Visita ${brandData.name}!`,
            fontSize: 58,
            color: '#FFFFFF',
            font: 'Inter, sans-serif',
            shadow: '0 4px 15px rgba(0,0,0,0.2)',
        },
        subtitle: {
            text: brandData.businessType,
            color: 'rgba(255,255,255,0.9)',
        },
        callToAction: {
            text: 'Escanea el Código QR',
            background: brandData.colors.accent,
            textColor: '#FFFFFF',
        },
        qrSection: {
            backgroundColor: '#FFFFFF',
            borderColor: brandData.colors.accent,
            label: 'Escanea',
        },
        footer: {
            text: 'Síguenos en redes',
            color: 'rgba(255,255,255,0.7)',
        },
    };
}
