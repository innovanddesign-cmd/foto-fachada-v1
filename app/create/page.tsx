'use client';

/**
 * FOTO FACHADA V2 — Página de Creación
 * Motor: Antigravity v.2026 (Gemini 3 Pro)
 * 
 * Punto de entrada para el flujo de captura de fachada.
 * Fase 1: Motor de Captura e Ingesta de Activos.
 */

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CapturaFachada from '@/components/captura/CapturaFachada';
import { AnalizadorADN } from '@/components/generative/AnalizadorADN';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import type { DatosImagen } from '@/lib/estado/tipos-estado';

export default function PaginaCrear() {
    const router = useRouter();
    const establecerPaso = useTiendaEstado((s) => s.establecerPaso);
    const guardarImagenCapturada = useTiendaEstado((s) => s.guardarImagenCapturada);
    const iniciarAnalisis = useTiendaEstado((s) => s.iniciarAnalisis);
    const pasoActual = useTiendaEstado((s) => s.pasoActual);
    const imagenSubida = useTiendaEstado((s) => s.imagenSubida);

    // Forzar paso de captura si no hay imagen (evitar saltos por persistencia antigua)
    useEffect(() => {
        if (!imagenSubida) {
            establecerPaso('CAPTURA');
        }
    }, [imagenSubida, establecerPaso]);

    // Manejar confirmación de imagen
    const manejarConfirmacion = useCallback((datosImagen: DatosImagen) => {
        // Guardar en store
        guardarImagenCapturada(datosImagen);

        // Guardar y comenzar análisis
        iniciarAnalisis();
    }, [guardarImagenCapturada, iniciarAnalisis]);

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12">
            {/* Fondo de malla animado */}
            <div className="mesh-bg" />

            {/* Contenido principal */}
            <div className="relative z-10 w-full max-w-4xl">
                {/* Logo / Marca */}
                <div className="text-center mb-12">
                    <div
                        className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full mb-4"
                        style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-sm text-white/70">Motor de Captura Activo</span>
                    </div>
                </div>

                {/* Componente dinámico según el paso */}
                {pasoActual === 'ANALISIS' ? (
                    <AnalizadorADN />
                ) : pasoActual === 'ESCAPARATE' ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 text-center animate-fade-in">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">✨</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">¡Análisis Completado!</h2>
                        <p className="text-white/60 mb-6">Tu ADN de marca ha sido generado exitosamente.</p>
                        <button className="px-6 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform" onClick={() => router.push('/dashboard')}>
                            Ir al Dashboard (Fase 3 Pending)
                        </button>
                    </div>
                ) : (
                    <CapturaFachada
                        alConfirmarImagen={manejarConfirmacion}
                        titulo="Captura tu Fachada"
                        subtitulo="Sube una foto de tu negocio para generar tu presencia digital"
                    />
                )}

                {/* Información adicional */}
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {caracteristicas.map((caracteristica, indice) => (
                        <div
                            key={indice}
                            className="p-5 rounded-3xl text-center"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.08)',
                            }}
                        >
                            <div className="text-3xl mb-3">{caracteristica.icono}</div>
                            <h3 className="text-white font-medium mb-1">{caracteristica.titulo}</h3>
                            <p className="text-sm text-white/50">{caracteristica.descripcion}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pie de página */}
            <footer className="absolute bottom-6 text-center text-white/30 text-sm">
                Foto Fachada V2 • Motor Antigravity v.2026 • Lenguaje de Diseño Aero-Glassmorphism
            </footer>
        </main>
    );
}

// Datos de características
const caracteristicas = [
    {
        icono: '📸',
        titulo: 'Captura Inteligente',
        descripcion: 'Procesamiento automático y optimización de imagen',
    },
    {
        icono: '🤖',
        titulo: 'Análisis con IA',
        descripcion: 'Detección de identidad de marca y colores',
    },
    {
        icono: '🎨',
        titulo: 'Diseño Generativo',
        descripcion: 'Escaparates y carteles personalizados',
    },
];
