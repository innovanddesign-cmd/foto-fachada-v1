import { GoogleGenerativeAI } from '@google/generative-ai';
import type { BrandData, LandingLink, LandingPageConfig } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

interface GeneratedLandingDesign {
    config: LandingPageConfig;
    backgroundPrompt: string;
}

/**
 * Genera una configuración de landing page personalizada basada en el análisis de marca
 */
export async function generateLandingPageDesign(
    brandData: BrandData,
    _links: LandingLink[]
): Promise<GeneratedLandingDesign> {
    if (!genAI) {
        // Modo demo: retorna configuración basada en el tipo de negocio
        return generateMockDesign(brandData);
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Eres un diseñador experto de landing pages. Basándote en esta información de marca, genera una configuración de diseño ÚNICA y personalizada.

INFORMACIÓN DE MARCA:
- Nombre: ${brandData.name}
- Tipo de negocio: ${brandData.businessType}
- Nicho: ${brandData.niche || 'General'}
- Estilo: ${brandData.style}
- Colores actuales: 
  - Primario: ${brandData.colors.primary}
  - Secundario: ${brandData.colors.secondary}
  - Acento: ${brandData.colors.accent}
- Descripción: ${brandData.description}

INSTRUCCIONES:
1. Crea una landing page que refleje la ESENCIA única de esta marca
2. Genera un prompt para imagen de fondo que sea coherente con el negocio
3. Escoge colores, fuentes, y estilos de botones que complementen la marca
4. Si es un negocio tropical/divertido: usa ondas, colores vibrantes
5. Si es elegante/premium: usa colores oscuros, tipografía serif
6. Si es tech/moderno: usa gradientes azules, tipografía sans-serif moderna

RESPONDE EN FORMATO JSON (sin markdown, solo el objeto):
{
  "backgroundPrompt": "descripción detallada para generar imagen de fondo, en inglés",
  "backgroundType": "gradient" o "image" o "texture",
  "gradientValue": "valor CSS del gradiente si backgroundType es gradient",
  "headerLayout": "centered" o "left",
  "headerLogoSize": número entre 60-120,
  "headerTitleColor": "color hexadecimal",
  "headerSubtitleColor": "color hexadecimal",
  "buttonStyle": "pill" o "rounded" o "sharp" o "glass",
  "buttonBackground": "color o gradiente CSS",
  "buttonTextColor": "color hexadecimal",
  "buttonBorder": "border CSS opcional",
  "buttonShadow": "box-shadow CSS opcional",
  "separatorTop": "wave" o "none",
  "separatorBottom": "wave" o "none",
  "separatorColor": "color hexadecimal",
  "font": "nombre de fuente de Google Fonts"
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

        // Construir LandingPageConfig
        const config: LandingPageConfig = {
            background: {
                type: aiConfig.backgroundType,
                value: aiConfig.backgroundType === 'gradient'
                    ? aiConfig.gradientValue
                    : '', // Se llenará con imagen generada
            },
            header: {
                layout: aiConfig.headerLayout,
                logoSize: aiConfig.headerLogoSize,
                titleColor: aiConfig.headerTitleColor,
                subtitleColor: aiConfig.headerSubtitleColor,
            },
            buttons: {
                style: aiConfig.buttonStyle,
                background: aiConfig.buttonBackground,
                textColor: aiConfig.buttonTextColor,
                border: aiConfig.buttonBorder,
                shadow: aiConfig.buttonShadow,
            },
            separators: {
                top: aiConfig.separatorTop,
                bottom: aiConfig.separatorBottom,
                color: aiConfig.separatorColor,
            },
            font: aiConfig.font,
        };

        return {
            config,
            backgroundPrompt: aiConfig.backgroundPrompt,
        };
    } catch (error) {
        console.error('Error generando diseño con IA:', error);
        return generateMockDesign(brandData);
    }
}

/**
 * Genera diseño mock basado en reglas simples
 */
function generateMockDesign(brandData: BrandData): GeneratedLandingDesign {
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
            config: {
                background: {
                    type: 'gradient',
                    value: `linear-gradient(135deg, ${brandData.colors.primary} 0%, ${brandData.colors.accent} 100%)`,
                },
                header: {
                    layout: 'centered',
                    logoSize: 100,
                    titleColor: '#FFD700',
                    subtitleColor: '#FFFFFF',
                },
                buttons: {
                    style: 'glass',
                    background: 'rgba(30, 60, 114, 0.8)',
                    textColor: '#ffffff',
                    shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                },
                separators: {
                    top: 'wave',
                    bottom: 'wave',
                    color: '#ffffff',
                },
                font: 'Fredoka One, cursive',
            },
            backgroundPrompt: `vibrant tropical ${businessType} background with palm trees and colorful atmosphere`,
        };
    }

    if (isTech) {
        return {
            config: {
                background: {
                    type: 'gradient',
                    value: 'linear-gradient(180deg, #00c6ff 0%, #0072ff 100%)',
                },
                header: {
                    layout: 'centered',
                    logoSize: 90,
                    titleColor: '#ffffff',
                    subtitleColor: '#e2e8f0',
                },
                buttons: {
                    style: 'sharp',
                    background: '#0f2027',
                    textColor: '#4ade80',
                    border: '1px solid #4ade80',
                },
                separators: {
                    top: 'none',
                    bottom: 'none',
                    color: 'transparent',
                },
                font: 'Rajdhani, sans-serif',
            },
            backgroundPrompt: `modern tech ${businessType} background with blue gradients and digital elements`,
        };
    }

    if (isElegant) {
        return {
            config: {
                background: {
                    type: 'texture',
                    value: 'noise',
                    overlay: 'rgba(0,0,0,0.85)',
                },
                header: {
                    layout: 'centered',
                    logoSize: 85,
                    titleColor: '#ffffff',
                    subtitleColor: '#a0aec0',
                },
                buttons: {
                    style: 'pill',
                    background: 'transparent',
                    textColor: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.8)',
                    shadow: '0 0 15px rgba(255,255,255,0.1)',
                },
                separators: {
                    top: 'none',
                    bottom: 'none',
                    color: 'transparent',
                },
                font: 'Outfit sans-serif',
            },
            backgroundPrompt: `elegant premium ${businessType} background with dark sophisticated atmosphere`,
        };
    }

    // Default: estilo moderno limpio
    return {
        config: {
            background: {
                type: 'gradient',
                value: `linear-gradient(135deg, ${brandData.colors.primary} 0%, ${brandData.colors.secondary} 100%)`,
            },
            header: {
                layout: 'centered',
                logoSize: 80,
                titleColor: '#ffffff',
                subtitleColor: 'rgba(255,255,255,0.9)',
            },
            buttons: {
                style: 'rounded',
                background: brandData.colors.accent,
                textColor: '#ffffff',
                shadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            },
            separators: {
                top: 'none',
                bottom: 'none',
                color: '#ffffff',
            },
            font: 'Inter, sans-serif',
        },
        backgroundPrompt: `professional modern ${businessType} background clean and inviting`,
    };
}
