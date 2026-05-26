/**
 * FOTO FACHADA V2 — Investigador Digital (OSINT & Marketing)
 * Motor: Antigravity v.2026 (Gemini 3 Pro)
 * 
 * Módulo para el análisis semántico de rastro digital y estrategia de mercado.
 */

import { MarketingIntelligence } from '../estado/tipos-estado';

export const InvestigadorDigital = {
    /**
     * Mapea un tono de voz detectado a un arquetipo de marca principal.
     */
    determinarArquetipo: (tono: string, bio: string): string => {
        const biosLower = bio.toLowerCase();

        if (biosLower.includes('revolución') || biosLower.includes('rompe')) return 'El Rebelde';
        if (biosLower.includes('ayuda') || biosLower.includes('cuidamos')) return 'El Cuidador';
        if (biosLower.includes('experto') || biosLower.includes('ciencia')) return 'El Sabio';
        if (biosLower.includes('diversión') || biosLower.includes('disfruta')) return 'El Bufón';
        if (biosLower.includes('magia') || biosLower.includes('transforma')) return 'El Mago';

        return 'El Inocente'; // Default
    },

    /**
     * Analiza el nivel de digitalización basado en la presencia de redes y actividad.
     */
    evaluarDigitalizacion: (hasInsta: boolean, hasTikTok: boolean, hasWeb: boolean): string => {
        const count = [hasInsta, hasTikTok, hasWeb].filter(Boolean).length;
        if (count === 3) return 'AVANZADA';
        if (count === 2) return 'INTERMEDIA';
        return 'INICIAL';
    },

    /**
     * Identifica el "Océano Azul" (Gap de Mercado) simplificado para la demo.
     */
    identificarOceanoAzul: (categoria: string): string => {
        const gaps: Record<string, string> = {
            'Restaurante': 'Experiencia inmersiva digital antes de llegar al local.',
            'Boutique': 'Curaduría personalizada mediante IA en tiempo real.',
            'Cafetería': 'Espacio de co-working tecnológico de alta fidelidad.',
            'Taller': 'Transparencia total mediante seguimiento digital del proceso.'
        };
        return gaps[categoria] || 'Propuesta de valor hiper-personalizada y nativa digital.';
    }
};
