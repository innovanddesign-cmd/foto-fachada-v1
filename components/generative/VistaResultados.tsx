"use client";

import { motion } from "framer-motion";
import { AdnMarca } from "@/lib/estado/tipos-estado";
import { useTiendaEstado } from "@/store/useTiendaEstado";
import { PieChart, Palette as PaletteIcon, Type, Target, Info, Sparkles, Building2 } from "lucide-react";

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
            className="w-full max-w-5xl mx-auto space-y-8 p-1 sm:p-4"
        >
            {/* Header / Summary */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm mb-4">
                    <Sparkles className="w-4 h-4" />
                    Análisis de Estrategia Senior Completado
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Tu ADN de Marca Digital</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Panel Central: Análisis de Marketing (2 Cols) */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="aero-cristal-profundo p-6 sm:p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Info className="w-24 h-24" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <Building2 className="w-6 h-6 text-cyan-400" />
                            Análisis del Negocio
                        </h3>
                        <p className="text-white/80 leading-relaxed text-lg mb-6">
                            {adn.analisisMarketing}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
                            <div>
                                <h4 className="text-cyan-400 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Target className="w-4 h-4" />
                                    Público Objetivo
                                </h4>
                                <p className="text-white/60 text-sm">{adn.publicoObjetivo}</p>
                            </div>
                            <div>
                                <h4 className="text-purple-400 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <PieChart className="w-4 h-4" />
                                    Contexto de Mercado
                                </h4>
                                <p className="text-white/60 text-sm">{adn.contextoMercado}</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Identidad Visual (1 Col) */}
                <div className="space-y-6">
                    <section className="aero-cristal p-6 sm:p-8">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                            <PaletteIcon className="w-5 h-5 text-pink-400" />
                            Identidad Visual
                        </h3>

                        {/* Logo Extracción Placeholder */}
                        <div className="mb-8 flex flex-col items-center">
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

                        {/* Paleta de Colores */}
                        <div className="space-y-4">
                            <span className="text-xs text-white/40 uppercase tracking-tighter">Paleta Corporativa</span>
                            <div className="flex gap-2">
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

                        {/* Tipografía */}
                        <div className="mt-8">
                            <span className="text-xs text-white/40 uppercase tracking-tighter">Tipografía Recomendada</span>
                            <div className="mt-2 flex items-center gap-3">
                                <Type className="w-5 h-5 text-white/60" />
                                <span className={`text-xl font-medium text-white ${adn.estiloTipografico === 'SERIF_ELEGANTE' ? 'font-serif' : 'font-sans'}`}>
                                    {adn.estiloTipografico.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    </section>

                    <button
                        onClick={onContinuar}
                        className="w-full py-5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl font-bold text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                    >
                        Continuar al Escaparate
                        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    </button>
                    <p className="text-center text-white/30 text-[10px]">
                        FASE 2: ADN DE MARCA • MOTOR ANTIGRAVITY
                    </p>
                </div>

            </div>
        </motion.div>
    );
};
