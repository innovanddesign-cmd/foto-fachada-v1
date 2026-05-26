"use client";

import React, { useEffect } from 'react';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import { MotorEscaparate } from '@/components/generative/MotorEscaparate';
import { useGenerarTema } from '@/lib/hooks/useGenerarTema';
import type { DatosEscaparate, AdnMarca } from '@/lib/estado/tipos-estado';
import { motion } from 'framer-motion';

interface Props {
    slug: string;
    datosIniciales: {
        adn: AdnMarca;
        escaparate: DatosEscaparate;
    };
}

/**
 * VisorEscaparate: Componente wrapper para hidratar el store con datos del servidor.
 * Usado en vistas públicas donde los datos vienen de props (SSR/ISR).
 */
export const VisorEscaparate = ({ slug, datosIniciales }: Props) => {
    useGenerarTema();

    useEffect(() => {
        useTiendaEstado.setState({
            adnMarca: datosIniciales.adn,
            datosEscaparate: datosIniciales.escaparate,
            pasoActual: 'DESPLIEGUE',
            seccionResaltada: null,
            indicePreguntaActual: -1
        });
    }, [datosIniciales]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-black">
            <MotorEscaparate />
            <div className="fixed bottom-4 right-4 z-50">
                <div className="bg-black/20 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-[10px] text-white/40 font-bold uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Powered by Foto Fachada AI
                </div>
            </div>
        </motion.div>
    );
};
