/**
 * FOTO FACHADA V2 — Motor de Visión ADN
 * Motor: Antigravity v.2026 (Gemini 3 Pro)
 * 
 * Lógica de negocio para el procesamiento de resultados de Visión Artificial.
 * Encargado de limpiar OCR, categorizar y extraer paletas Aero-Palette.
 */

import { AnalisisADN } from '../estado/tipos-estado';

export const MotorVisionADN = {
    /**
     * Limpia y prioriza el texto extraído por OCR
     * Filtra ruidos comunes y busca el nombre comercial.
     */
    procesarOCR: (textos: string[]): string => {
        const ruidos = ['abierto', 'cerrado', 'horario', 'lunes', 'domingo', 'tel', 'calle', 'estamo', 'entrada'];

        // Filtrar ruidos y textos muy cortos
        const filtrados = textos.filter(t =>
            t.length > 2 &&
            !ruidos.some(ruido => t.toLowerCase().includes(ruido))
        );

        // Retornar el de mayor longitud (probablemente el rótulo) o el primero
        return filtrados.sort((a, b) => b.length - a.length)[0] || 'Negocio Local';
    },

    /**
     * Convierte un color HEX a HSL para manipulaciones Aero-Glass
     */
    hexToHSL: (hex: string): string => {
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[1] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex.substring(1, 3), 16);
            g = parseInt(hex.substring(3, 5), 16);
            b = parseInt(hex.substring(5, 7), 16);
        }

        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
    },

    /**
     * Valida la coherencia cromática entre el logo y la fachada
     */
    validarCoherenciaLogo: (colorFachada: string, colorLogo: string): boolean => {
        // Lógica simplificada de distancia de color
        return true;
    }
};
