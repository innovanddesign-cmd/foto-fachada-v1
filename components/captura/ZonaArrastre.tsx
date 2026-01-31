'use client';

/**
 * FOTO FACHADA V2 — Zona de Arrastre
 * Motor: Antigravity v.2026 (Gemini 3 Pro)
 * 
 * Área interactiva de drag & drop con animaciones elásticas.
 * Diseño Aero-Glassmorphism.
 */

import { useState, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type EstadoArrastre = 'reposo' | 'sobre' | 'aceptado' | 'rechazado';

interface PropiedadesZonaArrastre {
    /** Callback cuando se suelta un archivo válido */
    alSoltarArchivo: (archivo: File) => void;
    /** Callback cuando hay un error */
    alError?: (mensaje: string) => void;
    /** Estado deshabilitado */
    deshabilitado?: boolean;
    /** Clase CSS adicional */
    claseAdicional?: string;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTES DE ANIMACIÓN (FÍSICAS ELÁSTICAS)
// ═══════════════════════════════════════════════════════════════

const resorteElastico = {
    type: 'spring',
    stiffness: 400,
    damping: 25,
    mass: 1,
};

const resorteRebote = {
    type: 'spring',
    stiffness: 300,
    damping: 15,
    mass: 0.8,
};

// ═══════════════════════════════════════════════════════════════
// VARIANTES DE ANIMACIÓN
// ═══════════════════════════════════════════════════════════════

const variantesContenedor = {
    reposo: {
        scale: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.12)',
    },
    sobre: {
        scale: 1.02,
        borderColor: 'rgba(99, 179, 237, 0.6)',
        boxShadow: '0 8px 24px rgba(99, 179, 237, 0.2), 0 24px 48px rgba(99, 179, 237, 0.15)',
    },
    aceptado: {
        scale: 1.05,
        borderColor: 'rgba(72, 187, 120, 0.8)',
        boxShadow: '0 8px 24px rgba(72, 187, 120, 0.3), 0 24px 48px rgba(72, 187, 120, 0.2)',
    },
    rechazado: {
        scale: 0.98,
        borderColor: 'rgba(245, 101, 101, 0.8)',
        boxShadow: '0 2px 8px rgba(245, 101, 101, 0.3)',
        x: [0, -10, 10, -10, 10, 0],
    },
};

const variantesIcono = {
    reposo: { y: 0, rotate: 0 },
    sobre: { y: -8, rotate: 5 },
    aceptado: { y: -12, rotate: 0, scale: 1.1 },
    rechazado: { y: 0, rotate: 0, scale: 0.9 },
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════

export default function ZonaArrastre({
    alSoltarArchivo,
    alError,
    deshabilitado = false,
    claseAdicional = '',
}: PropiedadesZonaArrastre) {
    const [estadoActual, setEstadoActual] = useState<EstadoArrastre>('reposo');

    // Validar si el archivo es válido
    const esArchivoValido = useCallback((archivo: File): boolean => {
        const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
        return tiposPermitidos.includes(archivo.type);
    }, []);

    // Manejar arrastre sobre la zona
    const manejarArrastreEntrada = useCallback((evento: DragEvent<HTMLDivElement>) => {
        evento.preventDefault();
        evento.stopPropagation();
        if (deshabilitado) return;

        const items = evento.dataTransfer.items;
        if (items.length > 0) {
            const tipo = items[0].type;
            const esValido = ['image/jpeg', 'image/png', 'image/webp'].includes(tipo);
            setEstadoActual(esValido ? 'sobre' : 'rechazado');
        } else {
            setEstadoActual('sobre');
        }
    }, [deshabilitado]);

    // Manejar salida del arrastre
    const manejarArrastreSalida = useCallback((evento: DragEvent<HTMLDivElement>) => {
        evento.preventDefault();
        evento.stopPropagation();
        setEstadoActual('reposo');
    }, []);

    // Prevenir comportamiento por defecto
    const manejarArrastreEncima = useCallback((evento: DragEvent<HTMLDivElement>) => {
        evento.preventDefault();
        evento.stopPropagation();
    }, []);

    // Manejar soltar archivo
    const manejarSoltar = useCallback((evento: DragEvent<HTMLDivElement>) => {
        evento.preventDefault();
        evento.stopPropagation();

        if (deshabilitado) return;

        const archivos = evento.dataTransfer.files;
        if (archivos.length === 0) {
            setEstadoActual('reposo');
            return;
        }

        const archivo = archivos[0];
        if (esArchivoValido(archivo)) {
            setEstadoActual('aceptado');
            setTimeout(() => {
                alSoltarArchivo(archivo);
                setEstadoActual('reposo');
            }, 300);
        } else {
            setEstadoActual('rechazado');
            alError?.('Formato no válido. Usa JPG, PNG o WEBP.');
            setTimeout(() => setEstadoActual('reposo'), 1000);
        }
    }, [deshabilitado, esArchivoValido, alSoltarArchivo, alError]);

    // Manejar selección por input
    const manejarSeleccionArchivo = useCallback((evento: ChangeEvent<HTMLInputElement>) => {
        const archivos = evento.target.files;
        if (!archivos || archivos.length === 0) return;

        const archivo = archivos[0];
        if (esArchivoValido(archivo)) {
            setEstadoActual('aceptado');
            setTimeout(() => {
                alSoltarArchivo(archivo);
                setEstadoActual('reposo');
            }, 300);
        } else {
            setEstadoActual('rechazado');
            alError?.('Formato no válido. Usa JPG, PNG o WEBP.');
            setTimeout(() => setEstadoActual('reposo'), 1000);
        }

        // Limpiar input para permitir reselección
        evento.target.value = '';
    }, [esArchivoValido, alSoltarArchivo, alError]);

    return (
        <motion.div
            className={`
        relative overflow-hidden cursor-pointer
        w-full min-h-[320px] p-8
        flex flex-col items-center justify-center gap-6
        border-2 border-dashed
        transition-colors
        ${deshabilitado ? 'opacity-50 cursor-not-allowed' : ''}
        ${claseAdicional}
      `}
            style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                borderRadius: '40px',
            }}
            variants={variantesContenedor}
            animate={estadoActual}
            transition={resorteElastico}
            onDragEnter={manejarArrastreEntrada}
            onDragLeave={manejarArrastreSalida}
            onDragOver={manejarArrastreEncima}
            onDrop={manejarSoltar}
        >
            {/* Input oculto para selección por clic */}
            <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={manejarSeleccionArchivo}
                disabled={deshabilitado}
                aria-label="Seleccionar imagen de fachada"
            />

            {/* Icono animado */}
            <motion.div
                variants={variantesIcono}
                animate={estadoActual}
                transition={resorteRebote}
                className="relative"
            >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400/30 to-purple-500/30 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {estadoActual === 'aceptado' ? (
                            <motion.svg
                                key="check"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={resorteRebote}
                                className="w-10 h-10 text-green-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </motion.svg>
                        ) : estadoActual === 'rechazado' ? (
                            <motion.svg
                                key="x"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={resorteRebote}
                                className="w-10 h-10 text-red-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </motion.svg>
                        ) : (
                            <motion.svg
                                key="upload"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={resorteRebote}
                                className="w-10 h-10 text-blue-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </motion.svg>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Texto principal */}
            <div className="text-center">
                <motion.h3
                    className="text-xl font-semibold text-white mb-2"
                    animate={{
                        color: estadoActual === 'aceptado' ? '#68D391' :
                            estadoActual === 'rechazado' ? '#FC8181' : '#FFFFFF',
                    }}
                >
                    {estadoActual === 'sobre' && 'Suelta la imagen aquí'}
                    {estadoActual === 'aceptado' && '¡Imagen capturada!'}
                    {estadoActual === 'rechazado' && 'Formato no válido'}
                    {estadoActual === 'reposo' && 'Arrastra una foto de tu fachada'}
                </motion.h3>

                <p className="text-sm text-white/60">
                    {estadoActual === 'reposo' && (
                        <>o <span className="text-blue-400 underline">haz clic para seleccionar</span></>
                    )}
                    {estadoActual === 'rechazado' && 'Formatos aceptados: JPG, PNG, WEBP'}
                </p>
            </div>

            {/* Indicadores de formato */}
            <div className="flex gap-2 mt-2">
                {['JPG', 'PNG', 'WEBP'].map((formato) => (
                    <span
                        key={formato}
                        className="px-3 py-1 text-xs rounded-full bg-white/10 text-white/50"
                    >
                        {formato}
                    </span>
                ))}
            </div>

            {/* Efecto de brillo en hover */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)',
                }}
                animate={{
                    opacity: estadoActual === 'sobre' ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
            />
        </motion.div>
    );
}
