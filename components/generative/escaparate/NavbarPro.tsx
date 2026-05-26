"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useTiendaEstado } from '@/store/useTiendaEstado';

export const NavbarPro = () => {
    const adnMarca = useTiendaEstado((s) => s.adnMarca);
    const analizando = useTiendaEstado((s) => s.analizando);

    if (analizando || !adnMarca) return null;

    return (
        <motion.nav
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
        >
            <div className="bg-[var(--glass-superficie)] backdrop-blur-[30px] border border-white/10 rounded-full px-6 py-3 flex items-center justify-between shadow-2xl">
                {/* Logo / Nombre */}
                <div className="flex items-center gap-2">
                    {adnMarca.logoExtraido ? (
                        <img
                            src={adnMarca.logoExtraido}
                            alt="Logo"
                            className="w-8 h-8 rounded-full object-cover border border-white/20"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primario)] to-[var(--color-secundario)]" />
                    )}
                    <span className="font-bold text-white text-sm tracking-tight truncate max-w-[120px]">
                        {/* Placeholder para nombre del negocio */}
                        {adnMarca.analisisVision?.nombreSugerido || "Mi Negocio"}
                    </span>
                </div>

                {/* Acciones Rápidas */}
                <div className="flex items-center gap-4">
                    <button className="text-white/70 hover:text-white transition-colors text-xs font-medium">
                        Inicio
                    </button>
                    <button className="bg-[var(--color-primario)] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg hover:brightness-110 transition-all">
                        Contactar
                    </button>
                </div>
            </div>
        </motion.nav>
    );
};
