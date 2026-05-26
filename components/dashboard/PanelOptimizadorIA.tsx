"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import { Lightbulb, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import type { InsightIA, CampañaUsuario } from '@/lib/estado/tipos-estado';

/**
 * PanelOptimizadorIA.tsx
 * Muestra consejos inteligentes para mejorar la conversión.
 * Detecta patrones en los datos (ej: muchos escaneos, pocas ventas).
 */

interface Props {
    campaña: CampañaUsuario;
}

export const PanelOptimizadorIA = ({ campaña }: Props) => {
    const generarInsights = useTiendaEstado((s) => s.generarInsights);
    const insights = useTiendaEstado((s) => s.insightsIA);

    // Generar insights al montar si no hay
    useEffect(() => {
        if (insights.length === 0) {
            generarInsights(campaña.id);
        }
    }, [campaña.id, generarInsights, insights.length]);

    const getIcono = (tipo: InsightIA['tipo']) => {
        switch (tipo) {
            case 'CONSEJO': return <Lightbulb className="text-amber-400" size={18} />;
            case 'OPORTUNIDAD': return <TrendingUp className="text-emerald-400" size={18} />;
            case 'ALERTA': return <AlertTriangle className="text-rose-400" size={18} />;
        }
    };

    return (
        <div className="bg-zinc-900/50 rounded-3xl border border-white/5 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                    <Lightbulb size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Optimizador IA</h3>
                    <p className="text-xs text-white/40">Sugerencias para aumentar conversión</p>
                </div>
            </div>

            <div className="space-y-4">
                <AnimatePresence>
                    {insights.map((insight, idx) => (
                        <motion.div
                            key={insight.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group"
                        >
                            <div className="flex gap-4">
                                <div className="mt-1">{getIcono(insight.tipo)}</div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm text-white mb-1">{insight.titulo}</h4>
                                    <p className="text-xs text-white/60 leading-relaxed mb-3">
                                        {insight.descripcion}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${insight.impactoEstimado === 'ALTO' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                                                insight.impactoEstimado === 'MEDIO' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' :
                                                    'border-blue-500/30 text-blue-400 bg-blue-500/10'
                                            }`}>
                                            IMPACTO {insight.impactoEstimado}
                                        </span>

                                        {insight.accionSugerida && (
                                            <button className="flex items-center gap-1 text-[10px] font-bold text-white hover:text-purple-400 transition-colors uppercase tracking-wider">
                                                {insight.accionSugerida.label}
                                                <ArrowRight size={12} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {insights.length === 0 && (
                    <div className="text-center py-8 text-white/20 text-sm">
                        Analizando datos de rendimiento...
                    </div>
                )}
            </div>
        </div>
    );
};
