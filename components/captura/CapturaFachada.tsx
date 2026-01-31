'use client';

/**
 * FOTO FACHADA V2 — Componente de Captura de Fachada
 * Motor: Antigravity v.2026 (Gemini 3 Pro)
 * 
 * Componente principal de la Fase 1: Motor de Captura e Ingesta de Activos.
 * Integra ZonaArrastre y VistaPrevia con sistema de estado.
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ZonaArrastre from './ZonaArrastre';
import VistaPrevia from './VistaPrevia';
import BarraProgreso from '@/components/ui/BarraProgreso';
import { validarArchivoCompleto, crearDatosImagen } from '@/lib/activos/validadores';
import { procesarImagen, archivoABase64 } from '@/lib/activos/ProcesadorActivos';
import type { DatosImagen } from '@/lib/estado/tipos-estado';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface PropiedadesCapturaFachada {
    /** Callback cuando se confirma la imagen */
    alConfirmarImagen?: (datos: DatosImagen) => void;
    /** Título personalizado */
    titulo?: string;
    /** Subtítulo personalizado */
    subtitulo?: string;
    /** Clase CSS adicional */
    claseAdicional?: string;
}

type EstadoCaptura = 'esperando' | 'procesando' | 'completado' | 'error';

interface MensajeEstado {
    tipo: 'exito' | 'error' | 'advertencia' | 'informacion';
    texto: string;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTES DE ANIMACIÓN
// ═══════════════════════════════════════════════════════════════

const resorteTransicion = {
    type: 'spring',
    stiffness: 300,
    damping: 25,
};

const variantesFadeIn = {
    oculto: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    salida: { opacity: 0, y: -20 },
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════

export default function CapturaFachada({
    alConfirmarImagen,
    titulo = 'Captura tu Fachada',
    subtitulo = 'Sube una foto de tu negocio y crearemos tu presencia digital',
    claseAdicional = '',
}: PropiedadesCapturaFachada) {
    const [estadoCaptura, setEstadoCaptura] = useState<EstadoCaptura>('esperando');
    const [imagenCapturada, setImagenCapturada] = useState<DatosImagen | null>(null);
    const [mensajeEstado, setMensajeEstado] = useState<MensajeEstado | null>(null);
    const [progresoCompresion, setProgresoCompresion] = useState(0);

    // Limpiar mensaje después de un tiempo
    const mostrarMensaje = useCallback((mensaje: MensajeEstado, duracion = 5000) => {
        setMensajeEstado(mensaje);
        setTimeout(() => setMensajeEstado(null), duracion);
    }, []);

    // Procesar archivo soltado
    const procesarArchivo = useCallback(async (archivo: File) => {
        setEstadoCaptura('procesando');
        setProgresoCompresion(10);

        try {
            // Paso 1: Convertir a base64 para vista previa inicial
            const urlBase64 = await archivoABase64(archivo);
            setProgresoCompresion(30);

            // Paso 2: Validar archivo
            const resultadoValidacion = await validarArchivoCompleto(archivo, urlBase64);
            setProgresoCompresion(50);

            if (!resultadoValidacion.esValido) {
                mostrarMensaje({
                    tipo: 'error',
                    texto: resultadoValidacion.errores.join(' '),
                });
                setEstadoCaptura('error');
                setTimeout(() => setEstadoCaptura('esperando'), 2000);
                return;
            }

            // Mostrar advertencias si las hay
            if (resultadoValidacion.advertencias.length > 0) {
                mostrarMensaje({
                    tipo: 'advertencia',
                    texto: resultadoValidacion.advertencias.join(' '),
                });
            }

            // Paso 3: Procesar y optimizar imagen
            setProgresoCompresion(70);
            const resultadoProcesamiento = await procesarImagen(urlBase64, {
                anchoMaximo: 1920,
                calidad: 0.85,
            });
            setProgresoCompresion(90);

            // Paso 4: Crear datos de imagen
            const datosImagen = await crearDatosImagen(archivo, resultadoProcesamiento.urlProcesada);

            // Actualizar dimensiones con las finales post-procesamiento
            datosImagen.dimensiones = resultadoProcesamiento.dimensionesFinales;
            datosImagen.tamanoBytes = resultadoProcesamiento.tamanoFinalBytes;

            setProgresoCompresion(100);
            setImagenCapturada(datosImagen);
            setEstadoCaptura('completado');

            mostrarMensaje({
                tipo: 'exito',
                texto: '¡Imagen capturada y optimizada correctamente!',
            });

        } catch (error) {
            console.error('[CapturaFachada] Error al procesar:', error);
            mostrarMensaje({
                tipo: 'error',
                texto: 'Error al procesar la imagen. Intenta de nuevo.',
            });
            setEstadoCaptura('error');
            setTimeout(() => setEstadoCaptura('esperando'), 2000);
        }
    }, [mostrarMensaje]);

    // Manejar error de zona de arrastre
    const manejarError = useCallback((mensaje: string) => {
        mostrarMensaje({ tipo: 'error', texto: mensaje });
    }, [mostrarMensaje]);

    // Eliminar imagen capturada
    const eliminarImagen = useCallback(() => {
        setImagenCapturada(null);
        setEstadoCaptura('esperando');
        mostrarMensaje({
            tipo: 'informacion',
            texto: 'Imagen eliminada. Puedes subir una nueva.',
        });
    }, [mostrarMensaje]);

    // Confirmar y pasar al siguiente paso
    const confirmarImagen = useCallback(() => {
        if (imagenCapturada && alConfirmarImagen) {
            alConfirmarImagen(imagenCapturada);
        }
    }, [imagenCapturada, alConfirmarImagen]);

    return (
        <div className={`w-full max-w-2xl mx-auto ${claseAdicional}`}>
            {/* Encabezado */}
            <motion.div
                className="text-center mb-8"
                variants={variantesFadeIn}
                initial="oculto"
                animate="visible"
                transition={resorteTransicion}
            >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                    {titulo}
                </h2>
                <p className="text-lg text-white/60">
                    {subtitulo}
                </p>
            </motion.div>

            {/* Mensajes de estado */}
            <AnimatePresence mode="wait">
                {mensajeEstado && (
                    <motion.div
                        key="mensaje"
                        className={`
              mb-6 px-5 py-4 rounded-2xl flex items-center gap-3
              ${mensajeEstado.tipo === 'exito' ? 'bg-green-500/20 border border-green-500/30' : ''}
              ${mensajeEstado.tipo === 'error' ? 'bg-red-500/20 border border-red-500/30' : ''}
              ${mensajeEstado.tipo === 'advertencia' ? 'bg-yellow-500/20 border border-yellow-500/30' : ''}
              ${mensajeEstado.tipo === 'informacion' ? 'bg-blue-500/20 border border-blue-500/30' : ''}
            `}
                        style={{ borderRadius: '24px' }}
                        variants={variantesFadeIn}
                        initial="oculto"
                        animate="visible"
                        exit="salida"
                        transition={resorteTransicion}
                    >
                        {/* Icono */}
                        <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
              ${mensajeEstado.tipo === 'exito' ? 'bg-green-500/30 text-green-400' : ''}
              ${mensajeEstado.tipo === 'error' ? 'bg-red-500/30 text-red-400' : ''}
              ${mensajeEstado.tipo === 'advertencia' ? 'bg-yellow-500/30 text-yellow-400' : ''}
              ${mensajeEstado.tipo === 'informacion' ? 'bg-blue-500/30 text-blue-400' : ''}
            `}>
                            {mensajeEstado.tipo === 'exito' && (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                            {mensajeEstado.tipo === 'error' && (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                            {mensajeEstado.tipo === 'advertencia' && (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            )}
                            {mensajeEstado.tipo === 'informacion' && (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </div>

                        {/* Texto */}
                        <span className={`
              text-sm
              ${mensajeEstado.tipo === 'exito' ? 'text-green-300' : ''}
              ${mensajeEstado.tipo === 'error' ? 'text-red-300' : ''}
              ${mensajeEstado.tipo === 'advertencia' ? 'text-yellow-300' : ''}
              ${mensajeEstado.tipo === 'informacion' ? 'text-blue-300' : ''}
            `}>
                            {mensajeEstado.texto}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Barra de progreso durante procesamiento */}
            <AnimatePresence>
                {estadoCaptura === 'procesando' && (
                    <motion.div
                        className="mb-6"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <BarraProgreso
                            progreso={progresoCompresion}
                            estado="cargando"
                            mostrarTexto={true}
                        />
                        <p className="text-sm text-white/50 text-center mt-2">
                            Procesando imagen...
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Área principal */}
            <AnimatePresence mode="wait">
                {estadoCaptura === 'esperando' || estadoCaptura === 'error' ? (
                    <motion.div
                        key="zona-arrastre"
                        variants={variantesFadeIn}
                        initial="oculto"
                        animate="visible"
                        exit="salida"
                        transition={resorteTransicion}
                    >
                        <ZonaArrastre
                            alSoltarArchivo={procesarArchivo}
                            alError={manejarError}
                            deshabilitado={estadoCaptura === 'error'}
                        />
                    </motion.div>
                ) : estadoCaptura === 'completado' && imagenCapturada ? (
                    <motion.div
                        key="vista-previa"
                        variants={variantesFadeIn}
                        initial="oculto"
                        animate="visible"
                        exit="salida"
                        transition={resorteTransicion}
                    >
                        <VistaPrevia
                            datosImagen={imagenCapturada}
                            alEliminar={eliminarImagen}
                            alConfirmar={confirmarImagen}
                            mostrarControles={true}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="procesando"
                        className="min-h-[320px] flex items-center justify-center"
                        variants={variantesFadeIn}
                        initial="oculto"
                        animate="visible"
                        exit="salida"
                    >
                        <div className="text-center">
                            <motion.div
                                className="w-16 h-16 mx-auto mb-4 border-4 border-white/20 border-t-blue-400 rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                            <p className="text-white/60">Procesando imagen...</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Indicador de pasos */}
            <motion.div
                className="mt-8 flex items-center justify-center gap-2"
                variants={variantesFadeIn}
                initial="oculto"
                animate="visible"
                transition={{ ...resorteTransicion, delay: 0.2 }}
            >
                {['Captura', 'Análisis', 'Escaparate'].map((paso, indice) => (
                    <div key={paso} className="flex items-center gap-2">
                        <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${indice === 0
                                ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                                : 'bg-white/10 text-white/40 border border-white/10'}
            `}>
                            {indice + 1}
                        </div>
                        <span className={`text-sm hidden sm:inline ${indice === 0 ? 'text-white' : 'text-white/40'}`}>
                            {paso}
                        </span>
                        {indice < 2 && (
                            <div className="w-8 h-px bg-white/20 mx-1" />
                        )}
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
