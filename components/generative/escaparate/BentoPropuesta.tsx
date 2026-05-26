"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useTiendaEstado } from '@/store/useTiendaEstado';

export const BentoPropuesta = () => {
    const adnMarca = useTiendaEstado((s) => s.adnMarca);

    // Datos por defecto si no existen en el ADN
    const items = [
        {
            titulo: "Esencia Única",
            descripcion: adnMarca?.ambiente || "Diseño que respira la identidad de tu marca.",
            clase: "col-span-2 row-span-1",
            icon: "✨"
        },
        {
            titulo: "Estrategia",
            descripcion: "Enfoque basado en análisis de mercado.",
            clase: "col-span-1 row-span-2",
            icon: "📊"
        },
        {
            titulo: "Tecnología",
            descripcion: "Renderizado de última generación.",
            clase: "col-span-1 row-span-1",
            icon: "🚀"
        }
    ];

    return (
        <div className="w-full h-full p-6 flex flex-col justify-center gap-6">
            <div className="space-y-2">
                <span className="text-[var(--color-primario)] text-xs font-bold uppercase tracking-widest">ADN de Marca</span>
                <h2 className="text-3xl font-bold">Nuestra Propuesta</h2>
            </div>

            <div className="grid grid-cols-2 grid-rows-2 gap-4 h-[60%]">
                {items.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        viewport={{ once: true }}
                        className={`${item.clase} bg-[var(--glass-superficie)] backdrop-blur-md rounded-3xl p-6 border border-white/10 flex flex-col justify-between shadow-xl`}
                    >
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                            <h3 className="font-bold text-white/90 text-sm mb-1">{item.titulo}</h3>
                            <p className="text-white/50 text-xs leading-tight">{item.descripcion}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
