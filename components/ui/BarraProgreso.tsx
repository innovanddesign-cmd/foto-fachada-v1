'use client';

/**
 * FOTO FACHADA V2 — Barra de Progreso Animada
 * Motor: Antigravity v.2026 (Gemini 3 Pro)
 * 
 * Barra de progreso con transición suave 0-100% usando Framer Motion.
 * Diseño Aero-Glassmorphism.
 */

import { motion } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type EstadoProgreso = 'inactiva' | 'cargando' | 'completada' | 'error';

interface BarraProgresoProps {
    /** Porcentaje de progreso (0-100) */
    progreso: number;
    /** Estado visual de la barra */
    estado?: EstadoProgreso;
    /** Mostrar porcentaje como texto */
    mostrarTexto?: boolean;
    /** Altura de la barra en píxeles */
    altura?: number;
    /** Clases CSS adicionales */
    className?: string;
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE ANIMACIÓN
// ═══════════════════════════════════════════════════════════════

const transicionSpring = {
    type: 'spring' as const,
    stiffness: 100,
    damping: 20,
    mass: 0.8,
};

const coloresPorEstado: Record<EstadoProgreso, string> = {
    inactiva: 'rgba(255, 255, 255, 0.2)',
    cargando: 'linear-gradient(90deg, hsl(220, 90%, 56%) 0%, hsl(280, 80%, 60%) 100%)',
    completada: 'linear-gradient(90deg, hsl(142, 76%, 36%) 0%, hsl(142, 76%, 50%) 100%)',
    error: 'linear-gradient(90deg, hsl(0, 84%, 60%) 0%, hsl(0, 84%, 70%) 100%)',
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════

export default function BarraProgreso({
    progreso,
    estado = 'cargando',
    mostrarTexto = false,
    altura = 8,
    className = '',
}: BarraProgresoProps) {
    const progresoNormalizado = Math.min(100, Math.max(0, progreso));

    return (
        <div className={`relative w-full ${className}`}>
            {/* Contenedor de la barra */}
            <div
                className="relative w-full overflow-hidden rounded-full"
                style={{
                    height: altura,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
            >
                {/* Barra de progreso animada */}
                <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progresoNormalizado}%` }}
                    transition={transicionSpring}
                    style={{
                        background: coloresPorEstado[estado],
                    }}
                />

                {/* Efecto de brillo móvil durante carga */}
                {estado === 'cargando' && progresoNormalizado > 0 && progresoNormalizado < 100 && (
                    <motion.div
                        className="absolute inset-y-0 w-20 rounded-full"
                        initial={{ left: '-20%' }}
                        animate={{ left: '100%' }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        style={{
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                        }}
                    />
                )}
            </div>

            {/* Texto de porcentaje */}
            {mostrarTexto && (
                <motion.div
                    className="mt-2 text-center text-sm text-white/70"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <motion.span
                        key={progresoNormalizado}
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={transicionSpring}
                    >
                        {progresoNormalizado}%
                    </motion.span>
                    {estado === 'completada' && (
                        <span className="ml-2 text-green-400">✓</span>
                    )}
                    {estado === 'error' && (
                        <span className="ml-2 text-red-400">✗</span>
                    )}
                </motion.div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// VARIANTE COMPACTA
// ═══════════════════════════════════════════════════════════════

export function BarraProgresoCompacta({
    progreso,
    estado = 'cargando',
}: Pick<BarraProgresoProps, 'progreso' | 'estado'>) {
    return (
        <BarraProgreso
            progreso={progreso}
            estado={estado}
            altura={4}
            mostrarTexto={false}
            className="opacity-80"
        />
    );
}
