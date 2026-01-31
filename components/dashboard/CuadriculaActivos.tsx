'use client';

/**
 * FOTO FACHADA V2 — Cuadrícula de Activos (Bento Grid)
 * Motor: Antigravity v.2026 (Gemini 3 Pro)
 * 
 * Bento Grid responsive para mostrar la galería de fachadas.
 * Animaciones stagger children.
 */

import { motion } from 'framer-motion';
import TarjetaFachada from './TarjetaFachada';
import TarjetaCristal from '@/components/ui/TarjetaCristal';
import { Plus } from 'lucide-react';
import type { DatosImagen } from '@/lib/estado/tipos-estado';
import Link from 'next/link';

interface CuadriculaActivosProps {
    activos: DatosImagen[];
}

const contenedorVariantes = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariantes = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 200, damping: 20 }
    }
};

export default function CuadriculaActivos({ activos }: CuadriculaActivosProps) {

    if (activos.length === 0) {
        return (
            <div className="w-full py-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 mb-6 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
                    <span className="text-4xl">📸</span>
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Tu galería está vacía</h3>
                <p className="text-white/50 max-w-xs mb-8">
                    Sube tu primera fachada para comenzar a generar activos digitales.
                </p>
                <Link href="/create">
                    <button className="px-6 py-3 rounded-full bg-white text-black font-semibold hover:scale-105 transition-transform">
                        Comencemos
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <motion.div
            variants={contenedorVariantes}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-24"
        >
            {/* Tarjeta de "Nueva Captura" siempre primero */}
            <motion.div variants={itemVariantes} className="aspect-[4/5] sm:aspect-square">
                <Link href="/create" className="block h-full w-full">
                    <TarjetaCristal
                        interactiva
                        profundidad="oscura"
                        className="h-full flex flex-col items-center justify-center border-dashed border-2 border-white/20 hover:border-white/40 group"
                    >
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:bg-white/20">
                            <Plus className="w-8 h-8 text-white/70" />
                        </div>
                        <span className="text-white/70 font-medium">Nueva Captura</span>
                    </TarjetaCristal>
                </Link>
            </motion.div>

            {/* Lista de Activos */}
            {activos.map((activo, index) => (
                <motion.div key={`${activo.nombreArchivo}-${index}`} variants={itemVariantes}>
                    <TarjetaFachada imagen={activo} />
                </motion.div>
            ))}
        </motion.div>
    );
}
