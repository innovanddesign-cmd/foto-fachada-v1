import { BASIC_FEATURES } from './catalog';
import type { BasicFeatureId, PremiumFeatureId } from './catalog';

export interface AIAnalysisResult {
    identity: {
        name: string;
        description: string;
        category: string;
        confidence: number;
    };
    design: {
        colors: string[];
        typography: string;
        style: string;
    };
    market: {
        niche: string;
        target_audience: string;
        location_detected: string;
    };
    strategy: {
        pitch: string;
        selected_basic: BasicFeatureId[];
        selected_premium: PremiumFeatureId;
        premium_locked: boolean;
    };
}

export const simulateAnalysis = async (imageUrl: string): Promise<AIAnalysisResult> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    return {
        identity: {
            name: "Café Aroma de Barrio",
            description: "Cafetería artesanal con enfoque en desayunos saludables y café de especialidad.",
            category: "Hostelería / Cafetería",
            confidence: 0.94
        },
        design: {
            colors: ["#3E2723", "#D7CCC8", "#8D6E63"],
            typography: "Modern Serif & Sans",
            style: "Minimalista Rústico"
        },
        market: {
            niche: "Desayunos Saludables",
            target_audience: "Jóvenes profesionales y vecinos de la zona (25-45 años)",
            location_detected: "Madrid, Centro"
        },
        strategy: {
            pitch: "Tu fachada transmite calidez pero le falta visibilidad digital. Con una web que muestre tu menú de desayunos y un sistema de reservas simple, podrías aumentar tus visitas de fin de semana un 40%.",
            selected_basic: ["digital_menu", "whatsapp_direct", "social_wall"], // IDs of basic features
            selected_premium: "smart_bookings",
            premium_locked: true
        }
    };
};
