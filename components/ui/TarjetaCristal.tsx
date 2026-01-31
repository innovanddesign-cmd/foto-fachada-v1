'use client';

/**
 * FOTO FACHADA V2 — Tarjeta de Cristal
 * Motor: Antigravity v.2026 (Gemini 3 Pro)
 * 
 * Contenedor base con efecto glassmorphism y focus rings neón.
 */

import { motion, HTMLMotionProps } from 'framer-motion';

interface TarjetaCristalProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode;
    interactiva?: boolean;
    profundidad?: 'ligera' | 'profunda' | 'oscura';
    className?: string;
}

export default function TarjetaCristal({
    children,
    interactiva = false,
    profundidad = 'ligera',
    className = '',
    ...props
}: TarjetaCristalProps) {

    const clasesProfundidad = {
        ligera: 'aero-cristal',
        profunda: 'aero-cristal-profundo',
        oscura: 'aero-cristal-oscuro',
    };

    const clasesInteractivas = interactiva
        ? 'cursor-pointer hover:bg-white/5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 focus-visible:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all'
        : '';

    return (
        <motion.div
            className={`
        relative overflow-hidden
        ${clasesProfundidad[profundidad]}
        ${clasesInteractivas}
        ${className}
      `}
            {...props}
        >
            {/* Brillo especular opcional */}
            <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    background: 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
                }}
            />

            {/* Contenido */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </motion.div>
    );
}
