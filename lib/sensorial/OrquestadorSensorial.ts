"use client";

import { create } from 'zustand';

/**
 * OrquestadorSensorial.ts
 * Sistema centralizado de gestión de audio y hápticos.
 * Diseño "Aero-Sonic" con volumen sutil y respeto a preferencias de usuario.
 */

type TipoSonido = 'SUCCESS' | 'SELECT' | 'ERROR' | 'NAVIGATION' | 'HOVER';

interface EstadoSensorial {
    volumen: number; // 0.0 a 1.0
    silenciado: boolean;
    setVolumen: (v: number) => void;
    toggleSilencio: () => void;
    reproducir: (tipo: TipoSonido) => void;
    vibrar: (patron: 'LIGERO' | 'MEDIO' | 'PESADO' | 'ERROR') => void;
}

// Mapa de recursos de audio (Placeholders o rutas locales)
const SOUND_MAP: Record<TipoSonido, string> = {
    SUCCESS: '/sounds/success_pop.mp3',
    SELECT: '/sounds/tick_select.mp3',
    ERROR: '/sounds/error_hum.mp3',
    NAVIGATION: '/sounds/navigation_swoosh.mp3',
    HOVER: '/sounds/hover_soft.mp3'
};

export const useOrquestadorSensorial = create<EstadoSensorial>((set, get) => ({
    volumen: 0.2, // Default 20% (Low profile)
    silenciado: false,

    setVolumen: (v) => set({ volumen: Math.max(0, Math.min(1, v)) }),

    toggleSilencio: () => set((s) => ({ silenciado: !s.silenciado })),

    reproducir: (tipo) => {
        const { volumen, silenciado } = get();
        if (silenciado || typeof window === 'undefined') return;

        // Crear instancia de audio
        const audio = new Audio(SOUND_MAP[tipo]);
        audio.volume = volumen;

        // Pitch variation para "naturalidad" (humanización)
        // Variación sutil de ±5% en velocidad para evitar efecto robótico
        audio.playbackRate = 0.95 + Math.random() * 0.1;

        audio.play().catch(() => {
            // Ignorar errores de autoplay (común en navegadores sin interacción previa)
        });
    },

    vibrar: (patron) => {
        if (typeof window === 'undefined' || !navigator.vibrate) return;

        switch (patron) {
            case 'LIGERO':
                navigator.vibrate(10); // Feedback táctil sutil (click)
                break;
            case 'MEDIO':
                navigator.vibrate(40); // Acción completada
                break;
            case 'PESADO':
                navigator.vibrate([20, 50, 20]); // Evento importante
                break;
            case 'ERROR':
                navigator.vibrate([50, 100, 50, 100]); // Alerta
                break;
        }
    }
}));
