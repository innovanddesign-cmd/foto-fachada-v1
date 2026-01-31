'use client';

/**
 * FOTO FACHADA V2 — Subida de Logotipo
 * Motor: Antigravity v.2026 (Gemini 3 Pro)
 * 
 * Dropzone para logotipo con soporte SVG y PNG transparente.
 * Diseño Aero-Glassmorphism con preview y fondo damero.
 */

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileImage, AlertCircle } from 'lucide-react';
import type { DatosImagen } from '@/lib/estado/tipos-estado';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface SubidaLogotipoProps {
    /** Logotipo actual */
    logotipo?: DatosImagen | null;
    /** Callback al subir logotipo */
    alSubir: (logotipo: DatosImagen) => void;
    /** Callback al eliminar */
    alEliminar: () => void;
    /** Deshabilitado */
    deshabilitado?: boolean;
}

type EstadoSubida = 'esperando' | 'arrastrando' | 'cargando' | 'error';

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════

const TIPOS_PERMITIDOS = ['image/svg+xml', 'image/png'];
const EXTENSIONES_PERMITIDAS = ['.svg', '.png'];
const LIMITE_BYTES = 5 * 1024 * 1024; // 5MB

// ═══════════════════════════════════════════════════════════════
// ANIMACIONES
// ═══════════════════════════════════════════════════════════════

const resorteElastico = {
    type: 'spring' as const,
    stiffness: 300,
    damping: 20,
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════

export default function SubidaLogotipo({
    logotipo,
    alSubir,
    alEliminar,
    deshabilitado = false,
}: SubidaLogotipoProps) {
    const [estado, setEstado] = useState<EstadoSubida>('esperando');
    const [mensajeError, setMensajeError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Validar archivo
    const validarArchivo = useCallback((archivo: File): string | null => {
        if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
            return `Solo se permiten: ${EXTENSIONES_PERMITIDAS.join(', ')}`;
        }
        if (archivo.size > LIMITE_BYTES) {
            return 'El archivo excede el límite de 5MB';
        }
        return null;
    }, []);

    // Procesar archivo
    const procesarArchivo = useCallback(async (archivo: File) => {
        const error = validarArchivo(archivo);
        if (error) {
            setEstado('error');
            setMensajeError(error);
            return;
        }

        setEstado('cargando');
        setMensajeError('');

        try {
            // Convertir a Base64
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(archivo);
            });

            // Crear datos de imagen
            const datosLogotipo: DatosImagen = {
                urlImagen: base64,
                nombreArchivo: archivo.name,
                tipoMime: archivo.type as 'image/png' | 'image/jpeg' | 'image/webp',
                tamanoBytes: archivo.size,
                dimensiones: {
                    ancho: 0,
                    alto: 0
                },
                fechaCaptura: new Date().toISOString(),
            };

            alSubir(datosLogotipo);
            setEstado('esperando');
        } catch (err) {
            console.error('[SubidaLogotipo] Error al procesar:', err);
            setEstado('error');
            setMensajeError('Error al procesar el archivo');
        }
    }, [validarArchivo, alSubir]);

    // Handlers de eventos
    const manejarDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!deshabilitado) setEstado('arrastrando');
    }, [deshabilitado]);

    const manejarDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setEstado('esperando');
    }, []);

    const manejarDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (deshabilitado) return;

        const archivo = e.dataTransfer.files[0];
        if (archivo) procesarArchivo(archivo);
    }, [deshabilitado, procesarArchivo]);

    const manejarClickInput = useCallback(() => {
        if (!deshabilitado) inputRef.current?.click();
    }, [deshabilitado]);

    const manejarCambioInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const archivo = e.target.files?.[0];
        if (archivo) procesarArchivo(archivo);
    }, [procesarArchivo]);

    // Estilos según estado
    const estilosFondo = {
        esperando: 'bg-white/5',
        arrastrando: 'bg-white/15',
        cargando: 'bg-white/10',
        error: 'bg-red-500/10',
    };

    const estilosBorde = {
        esperando: 'border-white/15',
        arrastrando: 'border-white/40',
        cargando: 'border-white/20',
        error: 'border-red-500/40',
    };

    // Si hay logotipo, mostrar preview
    if (logotipo) {
        return (
            <div className="w-full">
                <label className="block mb-2 text-sm text-white/70">
                    <FileImage className="inline w-4 h-4 mr-2" />
                    Logotipo
                </label>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={resorteElastico}
                    className="relative p-4 rounded-2xl bg-white/5 border border-white/15"
                >
                    {/* Fondo damero para transparencia */}
                    <div
                        className="w-full h-24 rounded-xl flex items-center justify-center overflow-hidden"
                        style={{
                            backgroundImage: `
                linear-gradient(45deg, #333 25%, transparent 25%),
                linear-gradient(-45deg, #333 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #333 75%),
                linear-gradient(-45deg, transparent 75%, #333 75%)
              `,
                            backgroundSize: '16px 16px',
                            backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                            backgroundColor: '#444',
                        }}
                    >
                        <img
                            src={logotipo.urlImagen}
                            alt="Logotipo"
                            className="max-h-20 max-w-full object-contain"
                        />
                    </div>

                    {/* Info del archivo */}
                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-white/60 truncate max-w-[60%]">
                            {logotipo.nombreArchivo}
                        </span>
                        <button
                            onClick={alEliminar}
                            className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors"
                        >
                            <X className="w-4 h-4 text-red-400" />
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Dropzone vacío
    return (
        <div className="w-full">
            <label className="block mb-2 text-sm text-white/70">
                <FileImage className="inline w-4 h-4 mr-2" />
                Logotipo (opcional)
            </label>

            <motion.div
                onDragOver={manejarDragOver}
                onDragLeave={manejarDragLeave}
                onDrop={manejarDrop}
                onClick={manejarClickInput}
                whileHover={!deshabilitado ? { scale: 1.01 } : {}}
                whileTap={!deshabilitado ? { scale: 0.99 } : {}}
                className={`
          relative p-6
          ${estilosFondo[estado]}
          border-2 border-dashed ${estilosBorde[estado]}
          rounded-2xl
          cursor-pointer
          transition-all duration-200
          ${deshabilitado ? 'opacity-50 cursor-not-allowed' : ''}
        `}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={EXTENSIONES_PERMITIDAS.join(',')}
                    onChange={manejarCambioInput}
                    className="hidden"
                    disabled={deshabilitado}
                />

                <div className="flex flex-col items-center text-center">
                    <motion.div
                        animate={{
                            y: estado === 'arrastrando' ? -5 : 0,
                            scale: estado === 'arrastrando' ? 1.1 : 1,
                        }}
                        transition={resorteElastico}
                    >
                        {estado === 'error' ? (
                            <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
                        ) : (
                            <Upload className="w-8 h-8 text-white/40 mb-2" />
                        )}
                    </motion.div>

                    <p className="text-sm text-white/60">
                        {estado === 'arrastrando' ? 'Suelta aquí' : 'Subir SVG o PNG'}
                    </p>
                    <p className="text-xs text-white/40 mt-1">Máximo 5MB</p>

                    <AnimatePresence>
                        {estado === 'error' && mensajeError && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="mt-2 text-sm text-red-400"
                            >
                                {mensajeError}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
