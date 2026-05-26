"use client";

import { useRef, useCallback, useEffect, useState } from 'react';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import type { DatosEscaparate, DatosEscaparateBase } from '@/lib/estado/tipos-estado';

/**
 * MotorSincroHibrida.ts
 * Motor de sincronización con debounce y prioridad de datos.
 * 
 * REGLA DE PRIORIDAD:
 * Si (dato_real) usar dato_real; Sino usar dato_sugerido.
 */

// ═══════════════════════════════════════════════════════════════
// DEBOUNCE HOOK
// ═══════════════════════════════════════════════════════════════

export function useDebouncedCallback<T extends (...args: any[]) => void>(
    callback: T,
    delay: number = 300
): T {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const debouncedFn = useCallback((...args: Parameters<T>) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }, [callback, delay]) as T;

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return debouncedFn;
}

// ═══════════════════════════════════════════════════════════════
// PRIORITY RESOLVER (REAL > SUGGESTED)
// ═══════════════════════════════════════════════════════════════

export function resolverDatoHibrido<K extends keyof DatosEscaparateBase>(
    escaparate: DatosEscaparate | null,
    campo: K
): string {
    if (!escaparate) return '';

    // 1. Prioridad: Dato Real del Usuario
    if (escaparate.datosReales?.[campo]) {
        return escaparate.datosReales[campo]!;
    }

    // 2. Fallback: Dato Sugerido por IA
    if (escaparate.datosSugeridos?.[campo]) {
        return escaparate.datosSugeridos[campo]!;
    }

    // 3. Fallback final: Campos legacy directos
    if (campo === 'titularPrincipal') return escaparate.titularPrincipal || '';
    if (campo === 'subtitulo') return escaparate.subtitulo || '';

    return '';
}

/**
 * Hook para obtener un valor híbrido con indicador de origen.
 */
export function useDatoHibrido<K extends keyof DatosEscaparateBase>(campo: K): {
    valor: string;
    esReal: boolean;
    esSugerido: boolean;
} {
    const escaparate = useTiendaEstado((s) => s.datosEscaparate);

    const esReal = Boolean(escaparate?.datosReales?.[campo]);
    const esSugerido = Boolean(!esReal && escaparate?.datosSugeridos?.[campo]);

    return {
        valor: resolverDatoHibrido(escaparate, campo),
        esReal,
        esSugerido
    };
}

// ═══════════════════════════════════════════════════════════════
// MICRO-DESTELLO FEEDBACK (CSS CLASS INJECTION)
// ═══════════════════════════════════════════════════════════════

/**
 * Inyecta una clase CSS temporal en un elemento para mostrar un "destello" de sincronización.
 */
export function triggerSyncFlash(elementId: string, colorHex: string = '#3b82f6'): void {
    const el = document.getElementById(elementId);
    if (!el) return;

    // Crear keyframe dinámico
    const styleId = 'sync-flash-style';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
    }

    styleEl.textContent = `
        @keyframes syncFlash {
            0% { box-shadow: 0 0 0 0 ${colorHex}66; }
            50% { box-shadow: 0 0 20px 4px ${colorHex}66; }
            100% { box-shadow: 0 0 0 0 ${colorHex}00; }
        }
        .sync-destello {
            animation: syncFlash 0.6s ease-out;
        }
    `;

    el.classList.add('sync-destello', 'relative');

    // Limpiar después de la animación
    setTimeout(() => {
        el.classList.remove('sync-destello');
    }, 600);
}

// ═══════════════════════════════════════════════════════════════
// GENERADOR DE CONTENIDO DE EMERGENCIA (PLACEHOLDER IA)
// ═══════════════════════════════════════════════════════════════

interface PlaceholderConfig {
    categoriaSugerida: string;
    nombreNegocio?: string;
}

export function generarPlaceholderIA(campo: keyof DatosEscaparateBase, config: PlaceholderConfig): string {
    const { categoriaSugerida, nombreNegocio = "Tu Negocio" } = config;
    const cat = categoriaSugerida.toLowerCase();

    const PLACEHOLDERS: Record<keyof DatosEscaparateBase, Record<string, string>> = {
        titularPrincipal: {
            gimnasio: "Transforma tu cuerpo, eleva tu mente",
            restaurante: "Sabor artesanal en cada bocado",
            peluqueria: "El arte del estilo, hecho para ti",
            tienda: "Calidad premium, precios honestos",
            default: `Bienvenido a ${nombreNegocio}`
        },
        subtitulo: {
            gimnasio: "Más de 10 años transformando vidas",
            restaurante: "Cocina de mercado con alma mediterránea",
            peluqueria: "Expertos en colorimetría y diseño capilar",
            tienda: "Todo lo que necesitas, en un solo lugar",
            default: "Tu destino de confianza en la ciudad"
        },
        descripcionValor: {
            default: "Descubre por qué miles de clientes nos eligen cada día. Ofrecemos una experiencia única diseñada para superar tus expectativas."
        },
        ctaPrincipal: {
            gimnasio: "Reservar Clase de Prueba",
            restaurante: "Ver Menú del Día",
            peluqueria: "Pedir Cita Online",
            tienda: "Ver Catálogo Completo",
            default: "Descubrir Más"
        },
        horario: {
            default: "L-V: 9:00-20:00 | S: 10:00-14:00"
        },
        telefono: {
            default: "+34 600 000 000"
        }
    };

    const campoPlaceholders = PLACEHOLDERS[campo];

    // Buscar coincidencia de categoría
    for (const key of Object.keys(campoPlaceholders)) {
        if (key !== 'default' && cat.includes(key)) {
            return campoPlaceholders[key];
        }
    }

    return campoPlaceholders.default || '';
}

// ═══════════════════════════════════════════════════════════════
// INICIALIZADOR DE PLACEHOLDERS EN STORE
// ═══════════════════════════════════════════════════════════════

export function inicializarPlaceholdersIA(): void {
    const store = useTiendaEstado.getState();
    const { adnMarca, datosEscaparate } = store;

    if (!adnMarca || !datosEscaparate) return;

    const config: PlaceholderConfig = {
        categoriaSugerida: adnMarca.analisisVision?.categoriaSugerida || 'General',
        nombreNegocio: adnMarca.analisisVision?.nombreSugerido
    };

    const sugeridos: Partial<DatosEscaparateBase> = {
        titularPrincipal: generarPlaceholderIA('titularPrincipal', config),
        subtitulo: generarPlaceholderIA('subtitulo', config),
        descripcionValor: generarPlaceholderIA('descripcionValor', config),
        ctaPrincipal: generarPlaceholderIA('ctaPrincipal', config),
        horario: generarPlaceholderIA('horario', config),
        telefono: generarPlaceholderIA('telefono', config),
    };

    store.regenerarEscaparate({
        ...datosEscaparate,
        datosSugeridos: sugeridos
    });
}
