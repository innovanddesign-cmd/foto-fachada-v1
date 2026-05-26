"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLogicaAsistida } from '@/hooks/useLogicaAsistida';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import { useDebouncedCallback, triggerSyncFlash } from '@/lib/sync/MotorSincroHibrida';
import { useOrquestadorSensorial } from '@/lib/sensorial/OrquestadorSensorial';
import { BotonMagnetico } from '@/components/ui/BotonMagnetico';
import { Sparkles, ChevronLeft, Mic, Save, ArrowRight, Maximize2 } from 'lucide-react';

/**
 * EditorConversacional.tsx
 * Interfaz de edición asistida por IA con psicología "Zen".
 * V2: Debounced updates, persistencia de sesión, modo preview.
 */
export const EditorConversacional = () => {
    const {
        preguntaActual,
        indicePreguntaActual,
        responder,
        retroceder,
        progreso
    } = useLogicaAsistida();

    const adnMarca = useTiendaEstado((s) => s.adnMarca);
    const { reproducir, vibrar } = useOrquestadorSensorial();
    const [inputValue, setInputValue] = useState('');
    const [welcomeBack, setWelcomeBack] = useState(false);

    // Verificar si es una sesión retomada
    useEffect(() => {
        const savedIndex = localStorage.getItem('zen-editor-last-step');
        if (savedIndex && parseInt(savedIndex) > 0) {
            setWelcomeBack(true);
            setTimeout(() => setWelcomeBack(false), 4000);
        }
    }, []);

    // Guardar progreso en localStorage
    useEffect(() => {
        localStorage.setItem('zen-editor-last-step', String(indicePreguntaActual));
    }, [indicePreguntaActual]);

    // Sincronizar input cuando cambia la pregunta
    useEffect(() => {
        setInputValue('');
    }, [indicePreguntaActual]);

    // Debounced preview update (300ms)
    const debouncedPreviewUpdate = useDebouncedCallback((valor: string) => {
        if (!preguntaActual) return;
        const elementId = `section-${preguntaActual.seccionId}`;
        triggerSyncFlash(elementId, adnMarca?.paletaColores?.primario || '#3b82f6');
    }, 300);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const valor = e.target.value;
        setInputValue(valor);
        debouncedPreviewUpdate(valor);
    };

    if (!preguntaActual) {
        return (
            <div className="w-full max-w-2xl px-4 flex flex-col items-center justify-center gap-6 py-24">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
                        <Sparkles className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">¡Personalización Completa!</h2>
                    <p className="text-white/40 text-sm">Has configurado todos los elementos de tu escaparate.</p>
                </motion.div>
            </div>
        );
    }

    const handleConfirmar = () => {
        if (inputValue.trim()) {
            responder(inputValue);
            reproducir('SELECT');
            vibrar('LIGERO');
        }
    };

    const handleSugerencia = (sug: string) => {
        setInputValue(sug);
        reproducir('SELECT');
    };

    const handleGuardarYSalir = () => {
        useTiendaEstado.getState().mostrarExito("Progreso guardado");
        useTiendaEstado.getState().establecerPaso('ESCAPARATE');
        reproducir('SUCCESS');
    };

    return (
        <div className="w-full max-w-2xl px-4 flex flex-col gap-8">

            {/* Welcome Back Message */}
            <AnimatePresence>
                {welcomeBack && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center"
                    >
                        <span className="text-purple-300 text-sm">
                            👋 <strong>Hola de nuevo</strong>, nos quedamos configurando tu escaparate...
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 1. Barra de Progreso Etérea */}
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative">
                <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progreso}%` }}
                    transition={{ type: 'spring', stiffness: 50 }}
                />
                <div className="absolute top-4 right-0 text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
                    Paso {indicePreguntaActual + 1} de la Maestría Visual
                </div>
            </div>

            {/* 2. Tarjeta de Pregunta (Foco Único) */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={preguntaActual.id}
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -40, scale: 0.95, filter: 'blur(10px)' }}
                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                    className="aero-cristal p-10 sm:p-14 border border-white/10 relative overflow-hidden group"
                >
                    {/* Fondo Dinámico */}
                    <div
                        className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] group-hover:opacity-100 opacity-50 transition-opacity"
                        style={{ backgroundColor: adnMarca?.paletaColores?.primario || '#3b82f6' }}
                    />

                    <div className="relative z-10 flex flex-col gap-6">
                        <header>
                            <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 text-[9px] font-bold uppercase tracking-widest mb-4">
                                Personalización Estratégica
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-light text-white leading-tight tracking-tight">
                                {preguntaActual.pregunta}
                            </h2>
                        </header>

                        {/* Input Inteligente */}
                        <div className="relative">
                            <textarea
                                value={inputValue}
                                onChange={handleInputChange}
                                placeholder={preguntaActual.placeholder}
                                className="w-full bg-white/5 border-b-2 border-white/10 focus:border-white/40 outline-none p-4 text-xl text-white placeholder:text-white/10 resize-none min-h-[120px] transition-all rounded-xl"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleConfirmar();
                                    }
                                }}
                            />
                            <div className="absolute bottom-4 right-4 flex gap-4 text-white/20">
                                <button className="hover:text-white transition-colors" title="Dictado por Voz">
                                    <Mic size={18} />
                                </button>
                                <BotonMagnetico
                                    onClick={handleConfirmar}
                                    variante="fantasma"
                                    className={`transition-all rounded-full w-12 h-12 flex items-center justify-center ${inputValue ? 'text-blue-400 scale-100' : 'opacity-0 scale-50'}`}
                                >
                                    <ArrowRight size={22} />
                                </BotonMagnetico>
                            </div>
                        </div>

                        {/* Sugerencias IA (Zen Badges) */}
                        {preguntaActual.sugerenciasIA && (
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                                    <Sparkles size={12} />
                                    Mejoras de IA Sugeridas
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {preguntaActual.sugerenciasIA.map((sug, i) => (
                                        <BotonMagnetico
                                            key={i}
                                            onClick={() => handleSugerencia(sug)}
                                            variante="cristal"
                                            className="px-4 py-2 text-xs text-left"
                                        >
                                            {sug}
                                        </BotonMagnetico>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* 3. Navegación Inferior */}
            <footer className="flex justify-between items-center opacity-40 hover:opacity-100 transition-opacity">
                <button
                    onClick={retroceder}
                    disabled={indicePreguntaActual === 0}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest disabled:opacity-0"
                >
                    <ChevronLeft size={16} />
                    Atrás
                </button>

                <div className="flex gap-8 items-center">
                    <button
                        onClick={handleGuardarYSalir}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-blue-400 transition-colors"
                    >
                        <Save size={16} />
                        Guardar y Salir
                    </button>
                    <span className="text-[10px] text-white/20 font-mono">ESTADO: AUTO-GUARDADO</span>
                </div>
            </footer>

            <style jsx>{`
                .aero-cristal {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(50px);
                    border-radius: 3rem;
                }
            `}</style>
        </div>
    );
};
