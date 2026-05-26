"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useTiendaEstado } from '@/store/useTiendaEstado';

export const AccionMarketing = () => {
    const adnMarca = useTiendaEstado((s) => s.adnMarca);

    const estrategia = adnMarca?.estrategiaPrincipal || 'LEAD_MAGNET';

    const contenido = {
        OFERTA_FLASH: {
            titulo: "¡Oferta de Apertura!",
            subtitulo: "Aprovecha un 20% de descuento en tu primera visita.",
            cta: "Obtener Cupón"
        },
        CITA_PREVIA: {
            titulo: "Reserva tu Espacio",
            subtitulo: "Atención personalizada para tus necesidades específicas.",
            cta: "Pedir Cita"
        },
        LEAD_MAGNET: {
            titulo: "Únete a la Comunidad",
            subtitulo: "Recibe consejos exclusivos y novedades antes que nadie.",
            cta: "Suscribirme"
        }
    }[estrategia] || {
        titulo: "Impulsa tu Negocio",
        subtitulo: "La solución definitiva para tu presencia digital.",
        cta: "Contactar"
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="w-full rounded-[40px] bg-gradient-to-br from-[var(--color-primario)] to-[var(--color-secundario)] p-10 text-center shadow-2xl relative overflow-hidden"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl" />

                <div className="relative z-10 space-y-6">
                    <h2 className="text-3xl font-bold text-white tracking-tight">
                        {contenido.titulo}
                    </h2>
                    <p className="text-white/80 text-base leading-relaxed">
                        {contenido.subtitulo}
                    </p>
                    <button className="bg-white text-[var(--color-primario)] px-10 py-4 rounded-full font-black uppercase text-xs tracking-widest shadow-xl hover:bg-zinc-100 transition-colors">
                        {contenido.cta}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
