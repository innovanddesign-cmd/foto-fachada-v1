"use client";

import { motion } from "framer-motion";
import { AdnMarca } from "@/lib/estado/tipos-estado";
import { useTiendaEstado } from "@/store/useTiendaEstado";
import { PieChart, Palette as PaletteIcon, Type, Target, Info, Sparkles, Building2, Printer } from "lucide-react";
import { MotorEscaparate } from "./MotorEscaparate";
import { SmartphoneMockup } from "@/components/ui/SmartphoneMockup";

interface Props {
    adn: AdnMarca;
    onContinuar: () => void;
    onReiniciar: () => void;
}

export const VistaResultados = ({ adn, onContinuar, onReiniciar }: Props) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-7xl mx-auto space-y-8 p-1 sm:p-4 pb-20"
        >
            {/* Header / Summary */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm mb-4">
                    <Sparkles className="w-4 h-4" />
                    Asimilación de ADN con IA Completada
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-2 leading-tight">
                    {adn.analisisVision?.nombreSugerido || "Tu Negocio"}
                </h2>
                <p className="text-white/40 font-medium tracking-widest uppercase text-xs">
                    {adn.analisisVision?.categoriaSugerida || "Comercio Local"}
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">

                {/* Panel Izquierdo: Análisis Strategico (7 Cols) */}
                <div className="xl:col-span-7 space-y-8">
                    <section className="aero-cristal-profundo p-6 sm:p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Info className="w-24 h-24" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <Building2 className="w-6 h-6 text-cyan-400" />
                            Análisis Estratégico
                        </h3>
                        <p className="text-white/80 leading-relaxed text-lg mb-6">
                            {adn.analisisMarketing}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
                            <div>
                                <h4 className="text-cyan-400 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Target className="w-4 h-4" />
                                    Objetivo Detectado
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {adn.analisisVision?.objetosDetectados.map(obj => (
                                        <span key={obj} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/60">
                                            {obj}
                                        </span>
                                    )) || <p className="text-white/60 text-sm">Escaneando...</p>}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-purple-400 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <PieChart className="w-4 h-4" />
                                    Confianza de IA
                                </h4>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(adn.analisisVision?.confianzaAnalisis || 0) * 100}%` }}
                                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                    />
                                </div>
                                <p className="text-white/30 text-[10px] mt-1 font-mono uppercase">
                                    Precision: {((adn.analisisVision?.confianzaAnalisis || 0) * 100).toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <motion.section
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="aero-cristal p-6 border-l-4 border-blue-500"
                        >
                            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Radar Océano Azul
                            </h4>
                            <p className="text-sm text-white/70 italic">
                                "{adn.inteligenciaMarketing?.gapDeMercado}"
                            </p>
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="aero-cristal p-6 border-l-4 border-purple-500"
                        >
                            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                Servicios Detectados
                            </h4>
                            <ul className="grid grid-cols-2 gap-2">
                                {adn.inteligenciaMarketing?.serviciosDetectados.map(sv => (
                                    <li key={sv} className="text-[10px] text-white/50 flex items-center gap-1">
                                        <div className="w-1 h-1 bg-purple-500 rounded-full" />
                                        {sv}
                                    </li>
                                ))}
                            </ul>
                        </motion.section>
                    </div>

                    {/* Identidad Visual */}
                    <section className="aero-cristal p-6 sm:p-8">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                            <PaletteIcon className="w-5 h-5 text-pink-400" />
                            Identidad Visual
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col items-center justify-center bg-white/5 rounded-3xl p-6 border border-white/10">
                                <span className="text-xs text-white/40 mb-3 uppercase tracking-tighter">Logotipo Extraído</span>
                                <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center p-4 shadow-2xl">
                                    {adn.logoExtraido ? (
                                        <img src={adn.logoExtraido} alt="Logo" className="max-w-full max-h-full object-contain" />
                                    ) : (
                                        <div className="text-black/20 text-center text-[10px] font-bold">
                                            LOGO SIMULADO<br />SCANNED
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <span className="text-xs text-white/40 uppercase tracking-tighter">Paleta Corporativa</span>
                                    <div className="flex gap-2 mt-2">
                                        {Object.entries(adn.paletaColores).map(([key, color]) => (
                                            <div
                                                key={key}
                                                className="h-10 flex-1 rounded-xl border border-white/10 shadow-lg"
                                                style={{ backgroundColor: color }}
                                                title={key}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-xs text-white/40 uppercase tracking-tighter">Tipografía Recomendada</span>
                                    <div className="mt-2 flex items-center gap-3">
                                        <Type className="w-5 h-5 text-white/60" />
                                        <span className={`text-xl font-medium text-white ${adn.estiloTipografico === 'SERIF_ELEGANTE' ? 'font-serif' : 'font-sans'}`}>
                                            {adn.estiloTipografico.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="flex gap-4">
                        <button
                            onClick={onReiniciar}
                            className="flex-1 py-4 px-6 rounded-2xl border border-white/10 text-white/60 font-bold hover:bg-white/5 transition-all text-sm"
                        >
                            Escanear de nuevo
                        </button>

                        {/* Nuevo Botón: Fase 4 Cartelería */}
                        <button
                            onClick={() => {
                                useTiendaEstado.getState().establecerPaso('CARTELERIA');
                            }}
                            className="flex-1 py-4 px-6 rounded-2xl bg-zinc-800 border border-white/10 text-white font-bold hover:bg-zinc-700 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <Printer className="w-4 h-4" />
                            Cartelería
                        </button>

                        <button
                            onClick={onContinuar}
                            className="flex-[2] py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-bold text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group text-sm"
                        >
                            Despliegue Digital
                            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Panel Derecho: Smartphone Mockup (5 Cols) */}
                <div className="xl:col-span-5 sticky top-8">
                    <div className="text-center mb-6">
                        <h3 className="text-sm font-bold text-white/40 uppercase tracking-[0.3em]">Vista Previa en Vivo</h3>
                    </div>

                    <div className="flex justify-center scale-90 sm:scale-100 origin-top">
                        <SmartphoneMockup isPublicView={false}>
                            <MotorEscaparate />
                        </SmartphoneMockup>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};
