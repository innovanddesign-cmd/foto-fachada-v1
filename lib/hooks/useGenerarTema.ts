"use client";

import { useEffect, useMemo } from 'react';
import { useAdnMarca } from '@/store/useTiendaEstado';

/**
 * Hook useGenerarTema
 * Convierte el ADN de marca en variables CSS inyectadas en el DOM.
 * Maneja la paleta de colores y la configuración visual Aero-Glass.
 */
export const useGenerarTema = () => {
    const adnMarca = useAdnMarca();

    const tema = useMemo(() => {
        if (!adnMarca) return null;

        const { paletaColores, estiloTipografico } = adnMarca;

        return {
            '--color-primario': paletaColores.primario,
            '--color-secundario': paletaColores.secundario,
            '--color-acento': paletaColores.acento,
            '--color-fondo': paletaColores.fondo,
            '--glass-superficie': paletaColores.superficieGlass || 'rgba(255, 255, 255, 0.05)',
            '--fuente-familia': obtenerFamiliaFuente(estiloTipografico),
        };
    }, [adnMarca]);

    useEffect(() => {
        if (!tema) return;

        const root = document.documentElement;
        Object.entries(tema).forEach(([propiedad, valor]) => {
            root.style.setProperty(propiedad, valor);
        });

        // Limpieza opcional (depende de si queremos que el tema persista fuera del componente)
        return () => {
            // No limpiamos para evitar saltos visuales durante la navegación
        };
    }, [tema]);

    return tema;
};

/**
 * Mapea el estilo tipográfico del ADN a una familia de fuentes real.
 * En una fase posterior se integrará con Google Fonts.
 */
function obtenerFamiliaFuente(estilo: string | undefined): string {
    switch (estilo) {
        case 'SANS_GEOMETRICA':
            return "'Inter', 'Outfit', sans-serif";
        case 'SERIF_ELEGANTE':
            return "'Playfair Display', serif";
        case 'MANUSCRITA':
            return "'Caveat', cursive";
        case 'TECH_MONO':
            return "'JetBrains Mono', monospace";
        default:
            return "'Inter', sans-serif";
    }
}
