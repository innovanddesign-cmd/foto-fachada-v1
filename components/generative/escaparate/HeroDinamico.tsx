"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useTiendaEstado } from '@/store/useTiendaEstado';

export const HeroDinamico = () => {
    const adnMarca = useTiendaEstado((s) => s.adnMarca);
    const imagenSubida = useTiendaEstado((s) => s.imagenSubida);
    const datosEscaparate = useTiendaEstado((s) => s.datosEscaparate);

    const titular = datosEscaparate?.titularPrincipal || "Transformamos tu visión en realidad";
    const subtitulo = datosEscaparate?.subtitulo || "Descubre el poder de un diseño único adaptado a tu negocio.";
    const imagenUrl = imagenSubida?.urlImagen || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200";

    return (
        <div className="relative w-full h-full flex flex-col justify-end p-8 pb-24 overflow-hidden">
            {/* Background Image / Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src={imagenUrl}
                    alt="Fachada"
                    className="w-full h-full object-cover brightness-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-fondo)] via-transparent to-transparent" />
            </div>

            <motion.div
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="relative z-10 space-y-4"
            >
                <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tighter">
                    {titular}
                </h1>
                <p className="text-white/70 text-lg max-w-sm leading-relaxed">
                    {subtitulo}
                </p>
                <div className="pt-4">
                    <button className="bg-[var(--color-primario)] text-white px-8 py-3 rounded-full font-bold shadow-xl hover:scale-105 transition-transform active:scale-95">
                        Empezar ahora
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
