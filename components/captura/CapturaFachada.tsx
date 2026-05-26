'use client';

/**
 * FOTO FACHADA V2 — Escenario de Ingesta (Fase 1)
 * Motor: Antigravity v.2026 (Gemini 3 Pro)
 * 
 * Componente orquestador que integra el Portal de Ingesta, 
 * Formulario de Activos, Galería y Botón de Inicio.
 */

import { motion } from 'framer-motion';
import PortalIngesta from './PortalIngesta';
import FormularioActivos from './FormularioActivos';
import VistaPreviaGaleria from './VistaPreviaGaleria';
import BotonAnalisis from './BotonAnalisis';

export default function CapturaFachada() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30"
        >
            {/* Fondo Decorativo (Mesh Gradient) */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple-600/10 blur-[100px] rounded-full" />
            </div>

            <main className="relative z-10 pt-20 pb-40">
                {/* 1. Portal de Ingesta (Fachada Principal) */}
                <section className="mb-20">
                    <div className="text-center mb-12 px-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-bold tracking-tighter mb-4"
                        >
                            FOTO <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">FACHADA</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-white/40 text-lg max-w-xl mx-auto"
                        >
                            Inicia el análisis asimilando la arquitectura física de tu negocio
                            para proyectar su gemelo digital.
                        </motion.p>
                    </div>

                    <PortalIngesta />
                </section>

                {/* 2. Galería Dinámica de Activos */}
                <VistaPreviaGaleria />

                {/* 3. Formulario de Activos y Rastro Digital */}
                <FormularioActivos />

                {/* 4. Botón de Acción Principal */}
                <BotonAnalisis />
            </main>

            {/* Footer Minimalista */}
            <footer className="fixed bottom-0 left-0 right-0 p-6 flex justify-between items-center backdrop-blur-md bg-black/20 border-t border-white/5 z-50">
                <div className="flex gap-4">
                    <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
                        ANTIGRAVITY v.2026
                    </div>
                </div>
                <div className="flex gap-4">
                    <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest">
                        FASE 1: ASIMILACIÓN
                    </span>
                </div>
            </footer>
        </motion.div>
    );
}
