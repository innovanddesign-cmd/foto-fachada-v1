'use client';

/**
 * FOTO FACHADA V2 — Insignia de Estado
 * Motor: Antigravity v.2026 (Gemini 3 Pro)
 * 
 * Badge visual para estados con efecto neón sutil.
 * Diseño Aero-Glassmorphism.
 */

import { motion } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type TipoEstado = 'exito' | 'advertencia' | 'error' | 'info' | 'neutro';

interface InsigniaEstadoProps {
    children: React.ReactNode;
    tipo?: TipoEstado;
    animado?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE ESTILOS
// ═══════════════════════════════════════════════════════════════

const ESTILOS_POR_TIPO: Record<TipoEstado, string> = {
    exito: 'bg-green-500/10 border-green-500/20 text-green-400 shadow-[0_0_10px_-4px_rgba(74,222,128,0.5)]',
    advertencia: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 shadow-[0_0_10px_-4px_rgba(250,204,21,0.5)]',
    error: 'bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_10px_-4px_rgba(248,113,113,0.5)]',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-[0_0_10px_-4px_rgba(96,165,250,0.5)]',
    neutro: 'bg-white/5 border-white/10 text-white/60',
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════

export default function InsigniaEstado({
    children,
    tipo = 'neutro',
    animado = false,
}: InsigniaEstadoProps) {
    const clasesBase = `
    inline-flex items-center px-2.5 py-0.5
    rounded-full border backdrop-blur-md
    text-xs font-medium
  `;

    if (animado) {
        return (
            <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`${clasesBase} ${ESTILOS_POR_TIPO[tipo]}`}
            >
                <span className="relative flex h-2 w-2 mr-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 bg-current`}></span>
                </span>
                {children}
            </motion.span>
        );
    }

    return (
        <span className={`${clasesBase} ${ESTILOS_POR_TIPO[tipo]}`}>
            {children}
        </span>
    );
}
