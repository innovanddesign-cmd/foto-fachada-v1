import { GoogleGenerativeAI } from '@google/generative-ai';
import type { BrandData, MarketingStrategy, LandingLink, StrategyGenerationResponse, LinksGenerationResponse } from '../types';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

/**
 * Generates personalized marketing strategies based on brand data and context
 */
export async function generateMarketingStrategies(
    brandData: BrandData,
    location?: string,
    season?: string
): Promise<StrategyGenerationResponse> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const currentMonth = new Date().toLocaleString('es-ES', { month: 'long' });
        const seasonContext = season || determineSeasonalContext();

        const prompt = `Eres un experto en marketing digital para negocios locales. Analiza este negocio y genera estrategias de marketing personalizadas.

DATOS DEL NEGOCIO:
- Nombre: ${brandData.name}
- Tipo: ${brandData.businessType}
- Nicho: ${brandData.niche || 'General'}
- Estilo: ${brandData.style}
- Público objetivo: ${brandData.targetAudience || 'General'}
- Descripción: ${brandData.description}

CONTEXTO:
- Mes actual: ${currentMonth}
- Temporada/Evento: ${seasonContext}
- Ubicación: ${location || 'España'}

Genera 3 estrategias de marketing ÚNICAS y PERSONALIZADAS para este negocio específico. 
Cada estrategia debe ser creativa, accionable y adaptada al tipo de negocio y su contexto.

Responde SOLO con un JSON array con este formato:
[
  {
    "id": "strategy-1",
    "title": "Título de la estrategia",
    "description": "Descripción detallada de la estrategia",
    "reasoning": "Por qué esta estrategia es perfecta para este negocio",
    "tactics": ["Táctica específica 1", "Táctica específica 2", "Táctica específica 3"],
    "seasonalContext": "Cómo se adapta a la temporada actual",
    "locationContext": "Cómo se adapta al contexto local"
  }
]

IMPORTANTE:
- Las estrategias deben ser ESPECÍFICAS para ${brandData.businessType}, no genéricas
- Considera el público ${brandData.targetAudience}
- Aprovecha la temporada ${seasonContext}
- Sé creativo y propón ideas que generen engagement real`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        const strategies: MarketingStrategy[] = JSON.parse(cleanedText);

        return {
            success: true,
            strategies
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
 * Generates landing page links based on brand and strategies
 */
export async function generateLandingLinks(
    brandData: BrandData,
    strategies: MarketingStrategy[]
): Promise<LinksGenerationResponse> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

/**
 * Determines seasonal context based on current date
 */
function determineSeasonalContext(): string {
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();

    // Check specific events first
    if (month === 11 && day >= 20) return 'Navidad';
    if (month === 10 && day >= 20 && day <= 30) return 'Black Friday';
    if (month === 1 && day === 14) return 'San Valentín';
    if (month === 9 && day === 31) return 'Halloween';

    // Seasonal
    if (month >= 5 && month <= 8) return 'Verano';
    if (month >= 9 && month <= 11) return 'Otoño';
    if (month >= 0 && month <= 2) return 'Invierno';
    return 'Primavera';
}

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
