"use client";

import React, { useMemo, useEffect } from 'react';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import { useGenerarTema } from '@/lib/hooks/useGenerarTema';
import { NavbarPro } from './escaparate/NavbarPro';
import { motion, AnimatePresence } from 'framer-motion';

// Importación diferida de secciones
import { HeroPro } from './escaparate/HeroPro';
import { BentoValor } from './escaparate/BentoValor';
import { AccionMarketingCore } from './escaparate/AccionMarketingCore';
import { FooterNegocio } from './escaparate/FooterNegocio';

// Secciones Especializadas (Reales)
import { GaleriaMasonry } from './escaparate/GaleriaMasonry';

// Secciones especializadas por categoría que reutilizan componentes base
const MenuDigital = () => {
    const adn = useTiendaEstado((s) => s.adnMarca);
    return (
        <div className="w-full h-full p-8 flex flex-col gap-6 bg-[var(--color-fondo)]">
            <div className="space-y-1">
                <span className="text-[var(--color-acento)] text-[10px] font-black uppercase tracking-widest">Carta Digital</span>
                <h2 className="text-3xl font-bold text-white tracking-tighter">Nuestro Menú</h2>
            </div>
            <div className="flex-1 grid grid-cols-1 gap-3 overflow-y-auto">
                {(adn?.inteligenciaMarketing?.serviciosDetectados || ['Plato del día', 'Menú degustación', 'Carta de vinos']).map((plato, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                        className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                        <div>
                            <h3 className="text-white font-bold text-sm">{plato}</h3>
                            <p className="text-white/40 text-[10px]">Preparación artesanal</p>
                        </div>
                        <span className="text-[var(--color-acento)] font-black text-sm">Consultar</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const ReservaCitas = () => (
    <div className="w-full h-full p-8 flex flex-col items-center justify-center gap-6 bg-[var(--color-fondo)]">
        <div className="text-center space-y-2">
            <span className="text-[var(--color-primario)] text-[10px] font-black uppercase tracking-widest">Agenda Online</span>
            <h2 className="text-3xl font-bold text-white tracking-tighter">Reserva tu Cita</h2>
            <p className="text-white/40 text-sm max-w-xs">Selecciona día y hora. Confirmación instantánea.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dia) => (
                <motion.div key={dia} whileHover={{ scale: 1.05 }}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-center cursor-pointer hover:bg-[var(--color-primario)]/20 transition-colors">
                    <span className="text-white/60 text-xs font-bold">{dia}</span>
                </motion.div>
            ))}
        </div>
        <button type="button" className="mt-4 px-8 py-3 bg-[var(--color-primario)] text-white rounded-full font-bold text-sm shadow-xl hover:scale-105 transition-transform">
            Confirmar Reserva
        </button>
    </div>
);

/**
 * MotorEscaparate: El compilador de interfaz dinámico.
 */
export const MotorEscaparate = () => {
    // 1. Estado Global
    const adnMarca = useTiendaEstado((s) => s.adnMarca);
    const analizando = useTiendaEstado((s) => s.analizando);
    const seccionResaltada = useTiendaEstado((s) => s.seccionResaltada);

    // 2. Lógica de Selección de Secciones
    const secciones = useMemo(() => {
        if (!adnMarca) return [];

        const categoria = adnMarca.analisisVision?.categoriaSugerida || "General";

        // Estructura Base: Navbar -> Hero -> Bento -> Marketing -> Footer
        const base = [
            { id: 'hero-pro', componente: HeroPro },
            { id: 'bento-valor', componente: BentoValor },
        ];

        // Inyección por Categoría
        if (categoria.includes("Retail") || categoria.includes("Tienda")) {
            base.push({ id: 'especial-retail', componente: GaleriaMasonry });
        } else if (categoria.includes("Salud") || categoria.includes("Bienestar")) {
            base.push({ id: 'especial-salud', componente: ReservaCitas });
        } else if (categoria.includes("Gastronomía") || categoria.includes("Restaurante")) {
            base.push({ id: 'especial-gastro', componente: MenuDigital });
        }

        base.push({ id: 'conversion-core', componente: AccionMarketingCore });
        base.push({ id: 'footer-negocio', componente: FooterNegocio });

        return base;
    }, [adnMarca]);

    // Efecto para hacer scroll a la sección resaltada
    useEffect(() => {
        if (seccionResaltada) {
            const element = document.getElementById(`section-${seccionResaltada}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [seccionResaltada]);

    if (analizando) {
        return <SkeletonEscaparate />;
    }

    if (!adnMarca) return null;

    return (
        <div className="relative w-full h-full bg-[var(--color-fondo, #050505)] text-white overflow-hidden">

            <NavbarPro />

            {/* Contenedor de Secciones con Snap Scroll */}
            <main className="relative z-10 h-full overflow-y-auto snap-y snap-mandatory scroll-smooth pb-20">
                {secciones.map((sec) => {
                    const Component = sec.componente;
                    const isResaltada = sec.id === seccionResaltada;

                    return (
                        <section
                            key={sec.id}
                            id={`section-${sec.id}`}
                            className={`w-full h-full snap-start snap-always shrink-0 transition-all duration-700 relative ${isResaltada ? 'scale-[0.98] z-20' : 'z-10'
                                }`}
                        >
                            {/* Glow de Resaltado */}
                            {isResaltada && adnMarca.paletaColores && (
                                <motion.div
                                    layoutId="glow-focus"
                                    className="absolute inset-0 border-4 shadow-[0_0_50px_rgba(255,255,255,0.1)] pointer-events-none rounded-[2.5rem] animate-pulse"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{ borderColor: adnMarca.paletaColores.primario }}
                                />
                            )}
                            <Component />
                        </section>
                    );
                })}
            </main>
        </div>
    );
};

/**
 * Estado Skeleton / Construcción
 */
const SkeletonEscaparate = () => {
    return (
        <div className="w-full h-full bg-[#050505] flex flex-col items-center justify-center p-8 gap-6">
            <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-full max-w-sm aspect-[9/16] border border-white/5 rounded-3xl bg-zinc-900/50 relative overflow-hidden"
            >
                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-48 h-10 bg-white/5 rounded-full" />
                <div className="absolute top-48 left-8 right-8 h-24 bg-white/5 rounded-2xl" />
                <div className="absolute bottom-12 left-8 right-8 h-64 bg-white/5 rounded-2xl" />
            </motion.div>
            <span className="text-white/40 text-xs font-mono tracking-widest uppercase">Ensamblando Interfaz...</span>
        </div>
    );
};
