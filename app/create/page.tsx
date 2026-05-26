'use client';

/**
 * FOTO FACHADA V2 — Página de Creación
 * Motor: Antigravity v.2026 (Gemini 3 Pro)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import { guardarCampañaEnStore } from '@/lib/campañas/GestionCampañas';

// Componentes de Fase
import CapturaFachada from '@/components/captura/CapturaFachada';
import { AnalizadorADN } from '@/components/generative/AnalizadorADN';
import { VistaResultados } from '@/components/generative/VistaResultados';
import { PreviewCartel } from '@/components/generative/impresion/PreviewCartel';
import { BibliotecaCarteles } from '@/components/generative/impresion/BibliotecaCarteles';
import { EditorConversacional } from '@/components/generative/EditorConversacional';
import { SmartphoneMockup } from '@/components/ui/SmartphoneMockup';
import { EscaparateInmersivo } from '@/components/generative/EscaparateInmersivo';
import { DashboardPrincipal } from '@/components/dashboard/DashboardPrincipal';

export default function PaginaCrear() {
    const router = useRouter();

    // Estado Global
    const pasoActual = useTiendaEstado((s) => s.pasoActual);
    const imagenSubida = useTiendaEstado((s) => s.imagenSubida);
    const adnMarca = useTiendaEstado((s) => s.adnMarca);

    // Acciones
    const establecerPaso = useTiendaEstado((s) => s.establecerPaso);
    const guardarImagenCapturada = useTiendaEstado((s) => s.guardarImagenCapturada);
    const iniciarAnalisis = useTiendaEstado((s) => s.iniciarAnalisis);

    // Modal para nombrar campaña al guardar
    const [modalNombre, setModalNombre] = useState(false);
    const [nombreCampaña, setNombreCampaña] = useState('');
    const campañaGuardadaRef = useRef(false);

    // Persistencia y Seguridad: Forzar captura si no hay imagen
    useEffect(() => {
        if (!imagenSubida && pasoActual !== 'CAPTURA') {
            establecerPaso('CAPTURA');
        }
    }, [imagenSubida, pasoActual, establecerPaso]);

    // Auto-guardar campaña al llegar al dashboard (una sola vez por flujo)
    useEffect(() => {
        if (pasoActual === 'DASHBOARD' && !campañaGuardadaRef.current && adnMarca) {
            campañaGuardadaRef.current = true;
            const nombreSugerido = adnMarca.analisisVision?.nombreSugerido || 'Mi Negocio';
            setNombreCampaña(`${nombreSugerido} — ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`);
            setModalNombre(true);
        }
        // Resetear al volver a captura (nuevo flujo)
        if (pasoActual === 'CAPTURA') {
            campañaGuardadaRef.current = false;
        }
    }, [pasoActual, adnMarca]);

    const handleGuardarCampaña = useCallback(() => {
        guardarCampañaEnStore(nombreCampaña.trim() || undefined);
        setModalNombre(false);
    }, [nombreCampaña]);

    // Manejador de Ingesta
    const manejarConfirmacion = useCallback((datosImagen: any) => {
        guardarImagenCapturada(datosImagen);
        iniciarAnalisis();
    }, [guardarImagenCapturada, iniciarAnalisis]);

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-12 relative overflow-hidden bg-[#050505]">
            {/* Fondo Aero-Mesh */}
            <div className="mesh-bg fixed inset-0 opacity-30" />

            <div className="relative z-10 w-full max-w-6xl">

                {/* Stepper de Progreso */}
                <StepperFlujo pasoActual={pasoActual} />

                {/* Renderizado Dinámico de Pasos */}
                <div className="transition-all duration-700 ease-in-out">
                    {pasoActual === 'CAPTURA' && (
                        <CapturaFachada />
                    )}

                    {pasoActual === 'ANALISIS' && (
                        <AnalizadorADN />
                    )}

                    {pasoActual === 'ESCAPARATE' && adnMarca && (
                        <VistaResultados
                            adn={adnMarca}
                            onContinuar={() => establecerPaso('CONFIGURACION')}
                            onReiniciar={() => {
                                useTiendaEstado.getState().reiniciar();
                                router.push('/');
                            }}
                        />
                    )}

                    {pasoActual === 'CARTELERIA' && (
                        <div className="flex flex-col items-center gap-6">
                            <PreviewCartel />
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => establecerPaso('ESCAPARATE')}
                                    className="px-8 py-3 rounded-full border border-white/10 text-white/40 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                                >
                                    ← Volver
                                </button>
                                <button
                                    type="button"
                                    onClick={() => establecerPaso('BIBLIOTECA_CARTELERIA')}
                                    className="px-8 py-3 rounded-full bg-white text-black hover:scale-105 transition-transform text-xs font-bold uppercase tracking-widest shadow-xl"
                                >
                                    Gestionar Biblioteca →
                                </button>
                            </div>
                        </div>
                    )}

                    {pasoActual === 'BIBLIOTECA_CARTELERIA' && (
                        <BibliotecaCarteles />
                    )}

                    {pasoActual === 'CONFIGURACION' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            {/* Lado Izquierdo: Editor Zen */}
                            <div className="flex justify-center">
                                <EditorConversacional />
                            </div>

                            {/* Lado Derecho: Espejo Real-Time */}
                            <div className="flex justify-center flex-col items-center gap-6">
                                <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">Espejo en Tiempo Real (Fase 5)</div>
                                <SmartphoneMockup>
                                    <EscaparateInmersivo />
                                </SmartphoneMockup>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => establecerPaso('ESCAPARATE')}
                                        className="px-8 py-3 rounded-full border border-white/5 text-white/20 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest"
                                    >
                                        ← Volver al Resumen
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => establecerPaso('DASHBOARD')}
                                        className="px-8 py-3 rounded-full bg-emerald-500 text-white hover:bg-emerald-400 transition-colors text-[10px] font-bold uppercase tracking-widest shadow-xl"
                                    >
                                        Publicar y Gestionar →
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PASO DASHBOARD: Panel de Control (Fase 6) */}
                    {pasoActual === 'DASHBOARD' && (
                        <DashboardPrincipal />
                    )}
                </div>

                {/* Características (Visual solo en Ingesta) */}
                {pasoActual === 'CAPTURA' && (
                    <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 opacity-60">
                        {CARACTERISTICAS.map((car, idx) => (
                            <div key={idx} className="p-6 rounded-[2rem] bg-white/5 border border-white/5 backdrop-blur-md text-center">
                                <div className="text-2xl mb-2">{car.icono}</div>
                                <div className="text-white font-bold text-sm mb-1">{car.titulo}</div>
                                <div className="text-white/40 text-[10px] uppercase tracking-tighter">{car.desc}</div>
                            </div>
                        ))}
                    </div>
                )}

            </div>

            {/* Footer de Sistema */}
            <footer className="fixed bottom-6 left-0 right-0 text-center pointer-events-none opacity-20">
                <span className="text-[10px] font-black tracking-[1em] text-white">FOTO FACHADA ENGINE 2026</span>
            </footer>

            {/* Modal: Nombrar campaña al guardar */}
            {modalNombre && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-sm p-6 rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl space-y-5">
                        <div>
                            <h3 className="text-lg font-bold text-white">¡Campaña lista! Dale un nombre</h3>
                            <p className="text-white/40 text-sm mt-1">
                                Puedes llamarla "Navidad 2026", "Black Friday" o lo que quieras.
                            </p>
                        </div>
                        <input
                            type="text"
                            value={nombreCampaña}
                            onChange={(e) => setNombreCampaña(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGuardarCampaña()}
                            placeholder="Ej: Campaña Verano 2026"
                            autoFocus
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                        />
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => { guardarCampañaEnStore(); setModalNombre(false); }}
                                className="flex-1 py-3 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-colors text-sm font-bold"
                            >
                                Omitir
                            </button>
                            <button
                                type="button"
                                onClick={handleGuardarCampaña}
                                className="flex-1 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-400 transition-colors text-sm font-bold"
                            >
                                Guardar campaña
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

// ─── STEPPER DE FLUJO ─────────────────────────────────────────
const PASOS_FLUJO = [
    { id: 'CAPTURA', label: 'Foto', short: '1' },
    { id: 'ANALISIS', label: 'Análisis IA', short: '2' },
    { id: 'ESCAPARATE', label: 'Resultados', short: '3' },
    { id: 'CARTELERIA', label: 'Cartel', short: '4' },
    { id: 'CONFIGURACION', label: 'Editor', short: '5' },
    { id: 'DASHBOARD', label: 'Publicar', short: '6' },
] as const;

function StepperFlujo({ pasoActual }: { pasoActual: string }) {
    const idxActual = PASOS_FLUJO.findIndex(
        (p) => p.id === pasoActual || (pasoActual === 'BIBLIOTECA_CARTELERIA' && p.id === 'CARTELERIA')
    );

    return (
        <div className="flex items-center justify-center mb-10">
            <div className="flex items-center gap-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-3 py-2">
                {PASOS_FLUJO.map((paso, i) => {
                    const completado = i < idxActual;
                    const activo = i === idxActual;
                    return (
                        <div key={paso.id} className="flex items-center">
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                                activo ? 'bg-white/10 text-white' :
                                completado ? 'text-white/50' : 'text-white/20'
                            }`}>
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black ${
                                    completado ? 'bg-emerald-500 text-white' :
                                    activo ? 'bg-white text-black' : 'bg-white/10 text-white/30'
                                }`}>
                                    {completado ? '✓' : paso.short}
                                </div>
                                <span className={`text-[10px] font-bold hidden sm:block ${activo ? 'text-white' : ''}`}>
                                    {paso.label}
                                </span>
                            </div>
                            {i < PASOS_FLUJO.length - 1 && (
                                <div className={`w-4 h-px mx-1 ${i < idxActual ? 'bg-emerald-500/50' : 'bg-white/10'}`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const CARACTERISTICAS = [
    { icono: '⚡', titulo: 'Ultra Rápido', desc: 'Análisis en milisegundos' },
    { icono: '🎯', titulo: 'Precisión IA', desc: 'Extracción de ADN visual' },
    { icono: '✨', titulo: 'Generativo', desc: 'Diseños únicos por negocio' }
];
