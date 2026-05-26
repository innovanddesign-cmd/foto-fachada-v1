"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import { resolverDatoHibrido } from '@/lib/sync/MotorSincroHibrida';

/**
 * Componente: HeroPro.tsx
 * La sección de entrada principal con estética Aero-Glass 2026.
 * Incluye cabecera líquida, fondo dinámico y CTA magnético.
 * V2: Integración con Motor Sincro Híbrida para datos real/sugerido.
 */
export const HeroPro = () => {
    const adnMarca = useTiendaEstado((s) => s.adnMarca);
    const imagenSubida = useTiendaEstado((s) => s.imagenSubida);
    const datosEscaparate = useTiendaEstado((s) => s.datosEscaparate);
    const seccionResaltada = useTiendaEstado((s) => s.seccionResaltada);

    // Resolución Híbrida: Real > Sugerido > Default
    const titular = resolverDatoHibrido(datosEscaparate, 'titularPrincipal') || "Experiencia Digital Única";
    const subtitulo = resolverDatoHibrido(datosEscaparate, 'subtitulo') || "Diseño generativo que respira la esencia de tu negocio.";
    const categoria = adnMarca?.analisisVision?.categoriaSugerida || "Comercio Excelencia";
    const nombreNegocio = adnMarca?.analisisVision?.nombreSugerido || "Tu Marca";

    // Split headline for reveal animation
    const palabrasTitular = useMemo(() => titular.split(" "), [titular]);

    // ¿Estamos siendo editados en el Editor Zen?
    const isHighlighted = seccionResaltada === 'hero-pro';

    return (
        <div className="relative w-full h-full flex flex-col justify-end p-8 pb-20 overflow-hidden select-none">

            {/* 1. Fondo Mesh Gradient Dinámico (Efecto Fluido) */}
            <div className="absolute inset-0 z-0">
                <MeshBackground />
                <img
                    src={imagenSubida?.urlImagen}
                    alt="Fachada"
                    className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay scale-110 blur-[1px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-fondo)] via-[var(--color-fondo)]/40 to-transparent" />
            </div>

            {/* 2. Contenido Informativo */}
            <div className="relative z-10 space-y-6">

                {/* Badge de Categoría + Ubicación */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-acento)] animate-pulse" />
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest font-mono">
                        {categoria} • Local Certificado
                    </span>
                </motion.div>

                {/* Titular con Efecto Liquid (Blur Reveal) */}
                <h1 className="text-4xl sm:text-5xl font-black text-white leading-[0.95] tracking-tighter">
                    {palabrasTitular.map((palabra, idx) => (
                        <motion.span
                            key={idx}
                            initial={{ opacity: 0, filter: 'blur(10px)', y: 10 }}
                            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.8, ease: "easeOut" }}
                            className="inline-block mr-3"
                        >
                            {palabra}
                        </motion.span>
                    ))}
                </h1>

                {/* Subtítulo Desvanecido */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-white/50 text-base max-w-[280px] leading-relaxed font-medium"
                >
                    {subtitulo}
                </motion.p>

                {/* CTA Magnético con Breathing Glow */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.2, type: 'spring' }}
                    className="pt-4"
                >
                    <button className="group relative">
                        <div className="absolute inset-0 bg-[var(--color-primario)] rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity animate-[pulse_3s_infinite]" />
                        <div className="relative bg-[var(--color-primario)] text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl border border-white/10 backdrop-blur-sm active:scale-95 transition-all">
                            Descubrir {nombreNegocio}
                        </div>
                    </button>

                    {/* Indicador de Scroll Suave */}
                    <div className="mt-12 flex justify-center opacity-30">
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-px h-8 bg-gradient-to-b from-white to-transparent"
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

/**
 * Fondo Mesh Gradient Dinámico utilizando animaciones CSS.
 */
const MeshBackground = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50 blur-[100px]">
            <motion.div
                animate={{
                    x: [-20, 20, -20],
                    y: [-20, 20, -20],
                    scale: [1, 1.2, 1]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 -left-1/4 w-[150%] h-full bg-[var(--color-primario)] rounded-full opacity-40 mix-blend-screen"
            />
            <motion.div
                animate={{
                    x: [20, -20, 20],
                    y: [20, -20, 20],
                    scale: [1.2, 1, 1.2]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-[20%] -right-1/4 w-[150%] h-full bg-[var(--color-secundario)] rounded-full opacity-40 mix-blend-screen"
            />
        </div>
    );
};
