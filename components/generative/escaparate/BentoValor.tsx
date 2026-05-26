"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import { Home, Star, Users, Clock, ShieldCheck } from 'lucide-react';

/**
 * Componente: BentoValor.tsx
 * Cuadrícula de valor asimétrica estilo Apple/Google.
 * Mapea datos críticos del ADN para generar confianza inmediata.
 */
export const BentoValor = () => {
    const adnMarca = useTiendaEstado((s) => s.adnMarca);
    const imagenSubida = useTiendaEstado((s) => s.imagenSubida);
    const marketing = adnMarca?.inteligenciaMarketing;

    // Lógica de Fallback para servicios y diferenciales
    const diferencial = adnMarca?.analisisMarketing?.slice(0, 60) + "..." || "Excelencia artesanal y atención premium personalizada.";
    const servicioEstrella = marketing?.serviciosDetectados?.[0] || "Servicio Premium";

    return (
        <div className="w-full h-full p-6 flex flex-col justify-center gap-4 bg-[var(--color-fondo)]">

            <div className="mb-4">
                <motion.span
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="text-[var(--color-primario)] text-[10px] font-black uppercase tracking-[0.3em]"
                >
                    Nuestra Identidad
                </motion.span>
                <h2 className="text-3xl font-bold text-white tracking-tighter">Propuesta de Valor</h2>
            </div>

            {/* Layout Bento Grid Asimétrico */}
            <div className="grid grid-cols-2 grid-rows-4 gap-3 h-[70%]">

                {/* 1. Celda Grande - Diferencial visual */}
                <motion.div
                    {...animacionEntrada(0)}
                    className="col-span-2 row-span-2 relative overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl group"
                >
                    <img
                        src={imagenSubida?.urlImagen}
                        alt="Fachada Analizada"
                        className="absolute inset-0 w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="w-4 h-4 text-[var(--color-acento)]" />
                            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Diferencial IA</span>
                        </div>
                        <p className="text-white text-sm font-medium leading-tight">
                            {diferencial}
                        </p>
                    </div>
                </motion.div>

                {/* 2. Celda Media - Servicio Estrella */}
                <motion.div
                    {...animacionEntrada(0.1)}
                    className="col-span-1 row-span-2 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 p-5 flex flex-col justify-between group hover:bg-white/10 transition-colors"
                >
                    <div className="w-10 h-10 rounded-2xl bg-[var(--color-primario)]/20 flex items-center justify-center">
                        <Star className="w-5 h-5 text-[var(--color-primario)]" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm mb-1">{servicioEstrella}</h3>
                        <p className="text-white/40 text-[10px] leading-snug">
                            Especialistas en ofrecer lo mejor en la zona.
                        </p>
                    </div>
                </motion.div>

                {/* 3. Celda Pequeña - Social Proof */}
                <motion.div
                    {...animacionEntrada(0.2)}
                    className="col-span-1 row-span-1 bg-[var(--color-acento)]/10 backdrop-blur-xl rounded-[2rem] border border-[var(--color-acento)]/20 p-5 flex flex-col justify-center items-center gap-1 group overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-[var(--color-acento)] opacity-0 group-hover:opacity-5 transition-opacity" />
                    <Users className="w-4 h-4 text-[var(--color-acento)] mb-1" />
                    <span className="text-white font-black text-xs">VERIFICADO</span>
                    <span className="text-white/40 text-[8px] font-mono tracking-tighter">DIGITAL TRUST 2026</span>
                </motion.div>

                {/* 4. Celda Pequeña - Horario/Info */}
                <motion.div
                    {...animacionEntrada(0.3)}
                    className="col-span-1 row-span-1 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 p-5 flex flex-col justify-center gap-1"
                >
                    <div className="flex items-center gap-2 text-emerald-400">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Abierto</span>
                    </div>
                    <span className="text-white/40 text-[8px] font-medium italic">Visítanos hoy mismo</span>
                </motion.div>

            </div>
        </div>
    );
};

// Helper de Animación
const animacionEntrada = (delay: number) => ({
    initial: { opacity: 0, y: 20, scale: 0.95 },
    whileInView: { opacity: 1, y: 0, scale: 1 },
    viewport: { once: true },
    transition: { delay, duration: 0.6, ease: "easeOut" }
});
