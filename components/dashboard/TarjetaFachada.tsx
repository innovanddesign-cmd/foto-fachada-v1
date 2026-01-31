'use client';

/**
 * FOTO FACHADA V2 — Tarjeta de Fachada
 * Motor: Antigravity v.2026 (Gemini 3 Pro)
 * 
 * Tarjeta individual para mostrar una fachada en la galería.
 * Badges de estado, imagen de fondo y acciones.
 */

import { motion } from 'framer-motion';
import { ArrowRight, MoreHorizontal, Clock } from 'lucide-react';
import TarjetaCristal from '@/components/ui/TarjetaCristal';
import InsigniaEstado from '@/components/ui/InsigniaEstado';
import type { DatosImagen } from '@/lib/estado/tipos-estado';

interface TarjetaFachadaProps {
    imagen: DatosImagen;
    estado?: 'pendiente' | 'analizando' | 'listo';
    alSeleccionar?: () => void;
}

export default function TarjetaFachada({
    imagen,
    estado = 'listo',
    alSeleccionar,
}: TarjetaFachadaProps) {

    // Formatear fecha relativa
    const fecha = new Date(imagen.fechaCaptura).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <TarjetaCristal
            interactiva
            onClick={alSeleccionar}
            className="group aspect-[4/5] sm:aspect-square flex flex-col justify-end"
        >
            {/* Imagen de fondo */}
            <div className="absolute inset-0 z-0">
                <img
                    src={imagen.urlImagen}
                    alt={imagen.nombreArchivo}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Gradiente de legibilidad */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>

            {/* Contenido superior (Badges) */}
            <div className="absolute top-4 left-4 z-20 flex gap-2">
                {estado === 'listo' && (
                    <InsigniaEstado tipo="exito" animado>
                        Listo para Análisis
                    </InsigniaEstado>
                )}
                {estado === 'analizando' && (
                    <InsigniaEstado tipo="info" animado>
                        Analizando IA
                    </InsigniaEstado>
                )}
            </div>

            <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            {/* Contenido inferior */}
            <div className="relative z-20 p-5 space-y-1">
                <h3 className="text-white font-medium text-lg leading-tight line-clamp-1 group-hover:text-pink-200 transition-colors">
                    {imagen.nombreArchivo}
                </h3>

                <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-white/60">
                        <Clock className="w-3 h-3 mr-1" />
                        {fecha}
                    </div>

                    <motion.div
                        initial={{ x: -10, opacity: 0 }}
                        whileHover={{ x: 0, opacity: 1 }}
                        className="text-white/80"
                    >
                        <ArrowRight className="w-5 h-5" />
                    </motion.div>
                </div>
            </div>
        </TarjetaCristal>
    );
}
