import { GoogleGenerativeAI } from '@google/generative-ai';
import type { BrandData, MarketingStrategy, LandingLink, StrategyGenerationResponse, LinksGenerationResponse } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Generates personalized marketing strategies based on brand data and context
 */
import { generateStrategiesFromBackend } from './backendService';

/**
 * Generates personalized marketing strategies based on brand data and context
 */
export async function generateMarketingStrategies(
    brandData: BrandData,
    location?: string,
    season?: string
): Promise<StrategyGenerationResponse> {
    console.log('Generating strategies...');
    // Check if we are in a production environment where backend might be unreachable (localhost)
    // Check if we are in a production environment where backend might be unreachable (localhost)
    const isProductionWithoutBackend = window.location.hostname !== 'localhost' && !import.meta.env.VITE_API_URL;

    try {
        // 1. Try Backend First (Skip if we know it will fail because it points to localhost in prod)
        if (!isProductionWithoutBackend) {
            console.log('Attempting to generate strategies from backend...');
            try {
                const backendResult = await generateStrategiesFromBackend(brandData, location, season);
                if (backendResult.success && backendResult.strategies && backendResult.strategies.length > 0) {
                    return backendResult;
                }
                console.warn('Backend generation failed:', backendResult.error);
            } catch (backendError) {
                console.warn('Backend unavailable or failed. Trying client-side fallback...', backendError);
            }
        } else {
            console.log('Production environment detected without dedicated backend URL. Skipping backend call.');
        }

        // 2. Fallback to Client-Side Gemini (if API Key exists)
        // IMPORTANT: This must run if:
        // a) Backend was skipped (isProductionWithoutBackend)
        // b) Backend was tried but failed (caught exception)
        // c) Backend returned success=false
        if (genAI) {
            console.log('Falling back to Client-Side Gemini generation...');
            try {
                const fallbackResult = await generateStrategiesClientSide(brandData, location, season);
                if (!fallbackResult.success) {
                    console.error('Client-side generation failed:', fallbackResult.error);
                }
                return fallbackResult;
            } catch (e) {
                console.error('UNCAUGHT Client-side exception:', e);
                throw e;
            }
        } else {
            console.warn('No Gemini API key found for client-side fallback');
        }

        // 3. Fallback to Mock Data (if no API Key)
        console.log('No API key found and backend failed, using mock strategies');
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
        return {
            success: true,
            strategies: getMockStrategies()
        };

    } catch (error) {
        console.error('Error generating strategies:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al generar estrategias'
        };
    }
}

/**
 * Client-side strategy generation using Gemini
 */
async function generateStrategiesClientSide(
    brandData: BrandData,
    location: string = 'España',
    season: string = 'General'
): Promise<StrategyGenerationResponse> {
    try {
        if (!genAI) throw new Error('No API Key');
        // Use gemini-2.5-flash to match other working services
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash'
        });

        const prompt = `
        Act as a Marketing Expert. Generate 3 unique marketing strategies for this business.
        
        Business Name: ${brandData.name}
        Business Type: ${brandData.businessType}
        Style: ${brandData.style}
        Context: ${season}, ${location}

        Return a JSON object with this exact schema:
        {
            "strategies": [
                {
                    "id": "str_1",
                    "title": "Strategy Title",
                    "description": "Clear description",
                    "reasoning": "Why this works",
                    "tactics": ["Tactic 1", "Tactic 2", "Tactic 3"],
                    "seasonalContext": "${season}",
                    "locationContext": "${location}"
                }
            ]
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse JSON
        let json;
        try {
            json = JSON.parse(text);
        } catch (e) {
            // Fallback for markdown JSON
            const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
            json = JSON.parse(cleaned);
        }

        if (!json.strategies || !Array.isArray(json.strategies)) {
            throw new Error('Invalid JSON structure');
        }

        return {
            success: true,
            strategies: json.strategies
        };
    } catch (error) {
        console.error('Client-side strategy generation failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Client-side error'
        };
    }
}

/**
 * Generates landing page links based on brand and strategies
 */
export async function generateLandingLinks(
    brandData: BrandData,
    strategies: MarketingStrategy[]
): Promise<LinksGenerationResponse> {
    try {
        if (!genAI) {
            console.log('No API key found, using mock links');
            return {
                success: true,
                links: getMockLinks()
            };
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const strategyTitles = strategies.map(s => s.title).join(', ');

        const prompt = `Basándote en este negocio y sus estrategias de marketing, genera 5 enlaces/funcionalidades para su landing page.

NEGOCIO:
- Nombre: ${brandData.name}
- Tipo: ${brandData.businessType}
- Nicho: ${brandData.niche || 'General'}
- Público: ${brandData.targetAudience}

ESTRATEGIAS DEFINIDAS:
${strategyTitles}

Genera 5 enlaces/funcionalidades que:
1. Sean coherentes con las estrategias de marketing
2. Generen engagement y conversión
3. Sean útiles para el cliente final
4. Incluyan al menos 1 elemento de gamificación/interactivo
5. Incluyan elementos necesarios (contacto, ubicación, etc)

Responde SOLO con JSON array:
[
  {
    "id": "link-1",
    "name": "Nombre del enlace/funcionalidad",
    "emoji": "🎰",
    "description": "Descripción de qué hace y cómo beneficia al negocio",
    "type": "gamification|reservation|menu|contact|social|promo|info",
    "engagement": "low|medium|high|very-high",
    "conversion": "low|medium|high|very-high",
    "isPremium": false
  }
]

TIPOS DISPONIBLES:
- gamification: Ruletas, juegos, retos
- reservation: Reservas, citas
- menu: Menús, catálogos, precios
- contact: WhatsApp, llamadas, email
- social: Redes sociales, reseñas
- promo: Ofertas, cupones, descuentos
- info: Horarios, ubicación, sobre nosotros

Asegúrate de que los enlaces sean ESPECÍFICOS para ${brandData.businessType}.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        const links: LandingLink[] = JSON.parse(cleanedText).map((link: LandingLink) => ({
            ...link,
            regenerateCount: 0
        }));

        return {
            success: true,
            links
        };

    } catch (error) {
        console.error('Error generating links:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al generar enlaces'
        };
    }
}

/**
 * Regenerates a single link
 */
export async function regenerateSingleLink(
    brandData: BrandData,
    currentLink: LandingLink,
    otherLinks: LandingLink[]
): Promise<LandingLink | null> {
    try {
        if (!genAI) return null;
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const existingNames = otherLinks.map(l => l.name).join(', ');

        const prompt = `El usuario quiere regenerar un enlace para su landing page de ${brandData.businessType}.

ENLACE ACTUAL A REGENERAR:
- Nombre: ${currentLink.name}
- Tipo: ${currentLink.type}
- Descripción: ${currentLink.description}

OTROS ENLACES YA EXISTENTES (no repetir):
${existingNames}

NEGOCIO:
- Tipo: ${brandData.businessType}
- Nicho: ${brandData.niche || 'General'}

Genera UN SOLO enlace alternativo diferente, manteniendo el mismo tipo (${currentLink.type}).
Debe ser creativo y diferente al actual.

Responde SOLO con JSON:
{
  "id": "${currentLink.id}",
  "name": "Nuevo nombre del enlace",
  "emoji": "🎯",
  "description": "Nueva descripción",
  "type": "${currentLink.type}",
  "engagement": "low|medium|high|very-high",
  "conversion": "low|medium|high|very-high",
  "isPremium": false
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        const newLink: LandingLink = JSON.parse(cleanedText);

        return {
            ...newLink,
            regenerateCount: currentLink.regenerateCount + 1
        };

    } catch (error) {
        console.error('Error regenerating link:', error);
        return null;
    }
}

// function determineSeasonalContext removed because unused

/**
 * Mock data for testing
 */
export function getMockStrategies(): MarketingStrategy[] {
    return [
        {
            id: 'strategy-1',
            title: '🎰 Gamificación Nocturna',
            description: 'Implementar una ruleta diaria digital donde los clientes pueden ganar premios instantáneos al escanear el QR.',
            reasoning: 'Un bar de zona universitaria necesita viralidad y engagement constante. La gamificación genera FOMO y visitas recurrentes.',
            tactics: [
                'Ruleta con premios: chupito gratis, 2x1, entrada VIP',
                'Ranking semanal de "jugadores" con premio al top 3',
                'Compartir resultado en redes = giro extra'
            ],
            seasonalContext: 'Perfecto para época de exámenes: los estudiantes buscan desconectar',
            locationContext: 'Zona universitaria = alta densidad de público objetivo'
        },
        {
            id: 'strategy-2',
            title: '📅 Calendario de Eventos Épicos',
            description: 'Crear un calendario interactivo con fiestas temáticas semanales que generen expectativa.',
            reasoning: 'Los eventos crean comunidad y dan razones para volver. Cada noche debe tener algo especial.',
            tactics: [
                'Lunes: Karaoke Battle con premios',
                'Miércoles: DJ Session universitaria',
                'Viernes: Fiesta temática mensual'
            ],
            seasonalContext: 'Eventos especiales para Navidad, Fin de Año, Halloween',
            locationContext: 'Adaptar horarios al calendario universitario'
        },
        {
            id: 'strategy-3',
            title: '🏆 Club de Fidelización VIP',
            description: 'Sistema de puntos y niveles que premie a los clientes más fieles con beneficios exclusivos.',
            reasoning: 'Retener un cliente es más barato que captar uno nuevo. Los universitarios repiten sitios donde se sienten especiales.',
            tactics: [
                'Nivel Bronce/Plata/Oro con beneficios crecientes',
                'Puntos por cada consumición',
                'Cumpleaños: chupito gratis + entrada VIP'
            ],
            seasonalContext: 'Puntos dobles en temporada baja',
            locationContext: 'Premios extra para grupos de más de 5'
        }
    ];
}

export function getMockLinks(): LandingLink[] {
    return [
        {
            id: 'link-1',
            name: 'Ruleta de la Suerte',
            emoji: '🎰',
            description: 'Gira cada día y gana premios instantáneos: chupitos, 2x1, descuentos',
            type: 'gamification',
            engagement: 'very-high',
            conversion: 'very-high',
            isPremium: false,
            regenerateCount: 0
        },
        {
            id: 'link-2',
            name: 'Calendario de Fiestas',
            emoji: '🎉',
            description: 'Descubre todas las fiestas temáticas, DJ sessions y eventos especiales',
            type: 'info',
            engagement: 'high',
            conversion: 'high',
            isPremium: false,
            regenerateCount: 0
        },
        {
            id: 'link-3',
            name: 'Top 10 del Mes',
            emoji: '🏆',
            description: 'Ranking de clientes VIP con premios exclusivos: rondas gratis, entrada preferente',
            type: 'gamification',
            engagement: 'very-high',
            conversion: 'medium',
            isPremium: true,
            regenerateCount: 0
        },
        {
            id: 'link-4',
            name: 'Reservar Mesa VIP',
            emoji: '🍾',
            description: 'Asegura tu mesa para noches especiales. Reserva con botella incluida',
            type: 'reservation',
            engagement: 'medium',
            conversion: 'very-high',
            isPremium: false,
            regenerateCount: 0
        },
        {
            id: 'link-5',
            name: 'Contacto WhatsApp',
            emoji: '📱',
            description: 'Escríbenos para reservas, cumpleaños y eventos privados',
            type: 'contact',
            engagement: 'medium',
            conversion: 'high',
            isPremium: false,
            regenerateCount: 0
        }
    ];
}
