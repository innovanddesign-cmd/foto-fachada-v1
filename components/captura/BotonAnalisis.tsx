'use client';

/**
 * FOTO FACHADA V2 — Botón de Análisis
 * Botón principal con estados dinámicos y transición a Fase 2.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTiendaEstado, accionesTienda } from '@/store/useTiendaEstado';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';

export default function BotonAnalisis() {
    const [cargando, setCargando] = useState(false);
    const imagenFachada = useTiendaEstado((s) => s.imagenSubida);
    const habilitado = !!imagenFachada;

    const manejarClick = async () => {
        if (!habilitado || cargando) return;

        setCargando(true);
        // Simulación de inicio de análisis
        accionesTienda.iniciarAnalisis();

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Aquí se navegaría a la siguiente fase o se actualizaría el paso
        accionesTienda.establecerPaso('ANALISIS');
        setCargando(false);
    };

    return (
        <div className="flex justify-center py-16 border-t border-white/5 bg-gradient-to-b from-transparent to-white/[0.02]">
            <motion.button
                onClick={manejarClick}
                disabled={!habilitado || cargando}
                whileHover={habilitado ? { scale: 1.02, y: -2 } : {}}
                whileTap={habilitado ? { scale: 0.98 } : {}}
                className={`
                    relative group px-12 py-5 rounded-full overflow-hidden
                    flex items-center gap-3 transition-all duration-500
                    ${habilitado
                        ? 'bg-white text-black shadow-[0_20px_40px_rgba(255,255,255,0.15)] cursor-pointer'
                        : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed opacity-50'}
                `}
            >
                {/* Fondo de brillo (Glow) */}
                <AnimatePresence>
                    {habilitado && !cargando && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-500/20 to-blue-400/20 bg-[length:200%_100%] animate-gradient-slow group-hover:opacity-100 opacity-50 transition-opacity"
                        />
                    )}
                </AnimatePresence>

                {/* Contenido */}
                <span className="relative z-10 font-bold tracking-tight uppercase text-sm">
                    {cargando ? 'ASIMILANDO DATOS' : 'ANALIZAR NEGOCIO'}
                </span>

                <div className="relative z-10">
                    <AnimatePresence mode="wait">
                        {cargando ? (
                            <motion.div
                                key="loader"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                            >
                                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="icon"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center"
                            >
                                {habilitado ? <Sparkles className="w-5 h-5 text-blue-600" /> : <ArrowRight className="w-5 h-5" />}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Shimmer Effect */}
                {habilitado && !cargando && (
                    <motion.div
                        className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
                        animate={{ left: ['-100%', '200%'] }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'linear', delay: 1 }}
                    />
                )}
            </motion.button>
        </div>
    );
}
