'use client';

/**
 * FOTO FACHADA V2 — Barra de Navegación Inferior
 * Motor: Antigravity v.2026 (Gemini 3 Pro)
 * 
 * Navegación mobile-first fija en la parte inferior.
 * Efecto backdrop-blur intenso y estados focus neón.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Grid, Settings, HelpCircle } from 'lucide-react';

export default function BarraNavegacionInferior() {
    const rutaActual = usePathname();

    const itemsNavegacion = [
        { ruta: '/', icono: Home, etiqueta: 'Inicio' },
        { ruta: '/dashboard', icono: Grid, etiqueta: 'Mis Fachadas' },
        { ruta: '/ajustes', icono: Settings, etiqueta: 'Ajustes' }, // Ruta placeholder por ahora
        { ruta: '/soporte', icono: HelpCircle, etiqueta: 'Soporte' }, // Ruta placeholder por ahora
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:hidden">
            <div className="
        mx-auto max-w-md
        flex items-center justify-around
        bg-black/60 backdrop-blur-xl
        border border-white/10
        rounded-2xl shadow-lg shadow-black/50
        overflow-hidden
      ">
                {itemsNavegacion.map((item) => {
                    const esActivo = rutaActual === item.ruta;

                    return (
                        <Link
                            key={item.ruta}
                            href={item.ruta}
                            className="relative flex-1 flex flex-col items-center justify-center py-3 focus:outline-none focus-visible:bg-white/5"
                        >
                            {esActivo && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute inset-0 bg-white/10"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}

                            <item.icono
                                className={`w-6 h-6 mb-1 z-10 transition-colors ${esActivo ? 'text-white' : 'text-white/50'}`}
                            />
                            <span className={`text-[10px] z-10 font-medium ${esActivo ? 'text-white' : 'text-white/50'}`}>
                                {item.etiqueta}
                            </span>

                            {esActivo && (
                                <motion.div
                                    className="absolute bottom-0 w-8 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-full shadow-[0_0_10px_var(--color-primario)]"
                                    layoutId="nav-indicator"
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
