'use client';

/**
 * FOTO FACHADA V2 — Vista Previa de Imagen
 * Motor: Antigravity v.2026 (Gemini 3 Pro)
 * 
 * Visualizador de imagen capturada con efecto cristal.
 * Diseño Aero-Glassmorphism con bordes rounded-5xl.
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DatosImagen } from '@/lib/estado/tipos-estado';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface PropiedadesVistaPrevia {
    /** Datos de la imagen a mostrar */
    datosImagen: DatosImagen;
    /** Callback para eliminar imagen */
    alEliminar?: () => void;
    /** Callback para confirmar imagen */
    alConfirmar?: () => void;
    /** Mostrar controles de acción */
    mostrarControles?: boolean;
    /** Clase CSS adicional */
    claseAdicional?: string;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTES DE ANIMACIÓN
// ═══════════════════════════════════════════════════════════════

const resorteEntrada = {
    type: 'spring',
    stiffness: 300,
    damping: 25,
    mass: 0.8,
};

const variantesContenedor = {
    oculto: {
        opacity: 0,
        scale: 0.9,
        y: 20,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
    },
    salida: {
        opacity: 0,
        scale: 0.95,
        y: -10,
    },
};

const variantesBoton = {
    reposo: { scale: 1 },
    hover: { scale: 1.05 },
    presionado: { scale: 0.95 },
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════

export default function VistaPrevia({
    datosImagen,
    alEliminar,
    alConfirmar,
    mostrarControles = true,
    claseAdicional = '',
}: PropiedadesVistaPrevia) {
    const [zoomActivo, setZoomActivo] = useState(false);
    const [cargando, setCargando] = useState(true);

    // Formatear tamaño de archivo
    const formatearTamano = useCallback((bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }, []);

    // Manejar carga de imagen
    const manejarCargaImagen = useCallback(() => {
        setCargando(false);
    }, []);

    return (
        <motion.div
            className={`relative overflow-hidden ${claseAdicional}`}
            style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                borderRadius: '48px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: `
          0 2px 8px rgba(0,0,0,0.08),
          0 8px 24px rgba(0,0,0,0.12),
          0 24px 48px rgba(0,0,0,0.16),
          0 48px 96px rgba(0,0,0,0.24)
        `,
            }}
            variants={variantesContenedor}
            initial="oculto"
            animate="visible"
            exit="salida"
            transition={resorteEntrada}
        >
            {/* Contenedor de imagen */}
            <div
                className="relative aspect-video overflow-hidden cursor-zoom-in"
                onClick={() => setZoomActivo(!zoomActivo)}
                style={{ borderRadius: '44px 44px 0 0' }}
            >
                {/* Indicador de carga */}
                <AnimatePresence>
                    {cargando && (
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center bg-black/40"
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.div
                                className="w-12 h-12 border-4 border-white/20 border-t-blue-400 rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Imagen */}
                <motion.img
                    src={datosImagen.urlImagen}
                    alt="Vista previa de fachada"
                    className="w-full h-full object-cover"
                    onLoad={manejarCargaImagen}
                    animate={{
                        scale: zoomActivo ? 1.5 : 1,
                    }}
                    transition={resorteEntrada}
                    style={{
                        transformOrigin: 'center center',
                    }}
                />

                {/* Overlay de gradiente */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.6) 100%)',
                    }}
                />

                {/* Indicador de zoom */}
                <motion.div
                    className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <span className="text-xs text-white/80">
                        {zoomActivo ? 'Clic para alejar' : 'Clic para acercar'}
                    </span>
                </motion.div>
            </div>

            {/* Panel de información */}
            <div className="p-6">
                {/* Información del archivo */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium truncate">
                            {datosImagen.nombreArchivo}
                        </h4>
                        <p className="text-sm text-white/50 mt-1">
                            {datosImagen.dimensiones.ancho} × {datosImagen.dimensiones.alto}px
                            <span className="mx-2">•</span>
                            {formatearTamano(datosImagen.tamanoBytes)}
                        </p>
                    </div>

                    {/* Badge de formato */}
                    <span
                        className="px-3 py-1 text-xs font-medium rounded-full ml-4"
                        style={{
                            background: 'linear-gradient(135deg, rgba(99, 179, 237, 0.2) 0%, rgba(99, 179, 237, 0.1) 100%)',
                            color: '#63B3ED',
                            border: '1px solid rgba(99, 179, 237, 0.3)',
                        }}
                    >
                        {datosImagen.tipoMime.split('/')[1].toUpperCase()}
                    </span>
                </div>

                {/* Controles de acción */}
                {mostrarControles && (
                    <div className="flex gap-3">
                        {/* Botón eliminar */}
                        {alEliminar && (
                            <motion.button
                                type="button"
                                onClick={alEliminar}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl
                           bg-red-500/10 border border-red-500/20 text-red-400
                           hover:bg-red-500/20 transition-colors"
                                variants={variantesBoton}
                                initial="reposo"
                                whileHover="hover"
                                whileTap="presionado"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                                <span className="font-medium">Eliminar</span>
                            </motion.button>
                        )}

                        {/* Botón confirmar */}
                        {alConfirmar && (
                            <motion.button
                                type="button"
                                onClick={alConfirmar}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl
                           text-white font-medium"
                                style={{
                                    background: 'linear-gradient(135deg, #4299E1 0%, #805AD5 100%)',
                                    boxShadow: '0 4px 16px rgba(66, 153, 225, 0.3)',
                                }}
                                variants={variantesBoton}
                                initial="reposo"
                                whileHover="hover"
                                whileTap="presionado"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <span>Continuar</span>
                            </motion.button>
                        )}
                    </div>
                )}
            </div>

            {/* Borde luminoso superior */}
            <div
                className="absolute top-0 left-8 right-8 h-px pointer-events-none"
                style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                }}
            />
        </motion.div>
    );
}
