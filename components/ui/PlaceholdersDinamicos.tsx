"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, X } from 'lucide-react';
import { useDatoHibrido, triggerSyncFlash } from '@/lib/sync/MotorSincroHibrida';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import type { DatosEscaparateBase } from '@/lib/estado/tipos-estado';

interface Props {
    campo: keyof DatosEscaparateBase;
    elementId: string;
    className?: string;
    as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
    showActions?: boolean;
}

/**
 * PlaceholdersDinámicos.tsx
 * Renderiza contenido híbrido (real o sugerido) con feedback visual.
 * Los datos sugeridos aparecen con opacidad 80% y opción de aceptar.
 */
export const PlaceholderDinamico = ({
    campo,
    elementId,
    className = '',
    as: Tag = 'span',
    showActions = true
}: Props) => {
    const { valor, esReal, esSugerido } = useDatoHibrido(campo);
    const adnMarca = useTiendaEstado((s) => s.adnMarca);

    const handleAceptar = () => {
        const store = useTiendaEstado.getState();
        const { datosEscaparate, regenerarEscaparate } = store;
        if (!datosEscaparate) return;

        // Promover dato sugerido a dato real
        const nuevosReales = {
            ...(datosEscaparate.datosReales || {}),
            [campo]: valor
        };

        regenerarEscaparate({
            ...datosEscaparate,
            datosReales: nuevosReales
        });

        // Efecto visual de confirmación
        triggerSyncFlash(elementId, adnMarca?.paletaColores?.primario || '#3b82f6');
    };

    return (
        <span className="relative inline-block group" id={elementId}>
            <AnimatePresence mode="wait">
                <motion.span
                    key={valor}
                    initial={{ opacity: 0, filter: 'blur(4px)' }}
                    animate={{ opacity: esSugerido ? 0.8 : 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, filter: 'blur(4px)' }}
                    transition={{ duration: 0.4 }}
                >
                    <Tag className={`${className} ${esSugerido ? 'italic' : ''}`}>
                        {valor || 'Sin contenido'}
                    </Tag>
                </motion.span>
            </AnimatePresence>

            {/* Badge IA + Acciones (solo si es sugerido) */}
            {esSugerido && showActions && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute -top-6 left-0 flex items-center gap-1"
                >
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-[9px] font-bold text-purple-300 uppercase tracking-wider">
                        <Sparkles size={10} />
                        Sugerido por IA
                    </span>
                    <button
                        onClick={handleAceptar}
                        className="p-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 transition-colors"
                        title="Aceptar esta sugerencia"
                    >
                        <Check size={12} />
                    </button>
                </motion.div>
            )}
        </span>
    );
};

// ═══════════════════════════════════════════════════════════════
// PLACEHOLDER DE IMAGEN (MEDIA FALLBACK)
// ═══════════════════════════════════════════════════════════════

interface ImagePlaceholderProps {
    keywords?: string[];
    className?: string;
    width?: number;
    height?: number;
}

export const ImagenPlaceholderIA = ({
    keywords = ['business', 'modern'],
    className = '',
    width = 400,
    height = 300
}: ImagePlaceholderProps) => {
    const adnMarca = useTiendaEstado((s) => s.adnMarca);
    const [loaded, setLoaded] = React.useState(false);
    const [error, setError] = React.useState(false);

    // Construir URL de Unsplash con keywords del ADN
    const queryString = keywords.join(',');
    const unsplashUrl = `https://source.unsplash.com/${width}x${height}/?${queryString}`;

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Placeholder de Carga (Cristal Esmerilado) */}
            <AnimatePresence>
                {(!loaded || error) && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                            background: `linear-gradient(135deg, ${adnMarca?.paletaColores?.primario || '#3b82f6'}22, ${adnMarca?.paletaColores?.secundario || '#8b5cf6'}22)`,
                            backdropFilter: 'blur(20px)'
                        }}
                    >
                        <div className="text-center">
                            {adnMarca?.logoExtraido && (
                                <img
                                    src={adnMarca.logoExtraido}
                                    alt="Logo"
                                    className="w-16 h-16 mx-auto mb-3 opacity-30 object-contain"
                                />
                            )}
                            <div className="flex items-center gap-2 text-white/20 text-[10px] font-bold uppercase tracking-widest">
                                <Sparkles size={12} className="animate-pulse" />
                                {error ? 'Imagen no disponible' : 'Cargando...'}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Imagen Real de Unsplash */}
            <img
                src={unsplashUrl}
                alt="Imagen sugerida por IA"
                className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setLoaded(true)}
                onError={() => setError(true)}
            />

            {/* Badge de IA */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur-md text-[8px] font-bold text-white/60 uppercase tracking-wider">
                <Sparkles size={10} />
                Stock Premium
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// WRAPPER PARA CROSS-FADE ENTRE DATOS
// ═══════════════════════════════════════════════════════════════

interface CrossFadeWrapperProps {
    children: React.ReactNode;
    syncKey: string;
}

export const CrossFadeWrapper = ({ children, syncKey }: CrossFadeWrapperProps) => (
    <AnimatePresence mode="wait">
        <motion.div
            key={syncKey}
            initial={{ opacity: 0, filter: 'blur(8px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(8px)' }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
            {children}
        </motion.div>
    </AnimatePresence>
);
