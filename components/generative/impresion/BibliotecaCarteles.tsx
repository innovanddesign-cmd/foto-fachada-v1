"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import { GeneradorCartel } from './GeneradorCartel';
import { exportarCartel } from '@/lib/impresion/ExportadorPDF';
import {
    Grid,
    Layers,
    Download,
    Printer,
    Maximize2,
    Plus,
    Trash2,
    Copy,
    Layout
} from 'lucide-react';
import { FormatoPoster, CartelGenerado } from '@/lib/estado/tipos-estado';

/**
 * BibliotecaCarteles.tsx
 * Dashboard de gestión de activos físicos y exportación profesional.
 */
export const BibliotecaCarteles = () => {
    const { cartelesGenerados, adnMarca, eliminarCartel, guardarCartel } = useTiendaEstado();
    const [formatoActivo, setFormatoActivo] = useState<FormatoPoster>('A4');
    const [exportando, setExportando] = useState(false);
    const [mostrarPapel, setMostrarPapel] = useState(false);

    if (!adnMarca) return null;

    const handleNuevoCartel = () => {
        const nuevo: CartelGenerado = {
            id: crypto.randomUUID(),
            formato: formatoActivo,
            campana: {
                id: crypto.randomUUID(),
                nombre: `Campaña ${cartelesGenerados.length + 1}`,
                estado: 'BORRADOR',
                fechaCreacion: new Date().toISOString()
            },
            configVisual: {
                fraseImpacto: adnMarca.analisisMarketing?.split('.')[0] || "Nueva Experiencia Digital",
                mostrarIconos: true,
                filtroPapel: mostrarPapel
            }
        };
        guardarCartel(nuevo);
    };

    const handleExportar = async (id: string, formato: 'PNG' | 'PDF') => {
        setExportando(true);
        try {
            await exportarCartel('poster-container', {
                formato,
                nombreArchivo: `cartel-${adnMarca.analisisVision?.nombreSugerido || 'negocio'}`
            });
        } finally {
            setTimeout(() => setExportando(false), 2000);
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#050505] p-6 sm:p-12 text-white">

            {/* Header Estratégico */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-white mb-2">Biblioteca de Activos</h2>
                    <p className="text-white/40 text-sm font-medium uppercase tracking-[0.2em]">Gestión de presencia física y print workflow</p>
                </div>

                <div className="flex gap-4">
                    <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10 backdrop-blur-xl">
                        {(['A4', 'A5', 'SQUARE'] as FormatoPoster[]).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFormatoActivo(f)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${formatoActivo === f ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleNuevoCartel}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl shadow-blue-600/20"
                    >
                        <Plus size={18} />
                        <span className="text-sm">Nuevo Diseño</span>
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">

                {/* Visualizador de Trabajo (Lado Izquierdo) */}
                <div className="xl:col-span-7 flex flex-col items-center">
                    <div className="relative group">
                        {/* El Cartel con su formato dinámico */}
                        <div className="perspective-2000">
                            <motion.div
                                layoutId="poster-preview"
                                className="relative rounded-[2rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]"
                                initial={{ rotateY: -5 }}
                                whileHover={{ rotateY: 0, scale: 1.02 }}
                                transition={{ type: 'spring', stiffness: 100 }}
                            >
                                <GeneradorCartel
                                    formato={formatoActivo}
                                    configVisual={{
                                        fraseImpacto: "", // Usa default del ADN
                                        mostrarIconos: true,
                                        filtroPapel: mostrarPapel
                                    }}
                                />

                                {/* Overlay de Precarga/Exportando */}
                                <AnimatePresence>
                                    {exportando && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-50"
                                        >
                                            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mb-4">
                                                <motion.div
                                                    className="h-full bg-blue-500"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '100%' }}
                                                    transition={{ duration: 1.5 }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Generando PDF Alta Fidelidad...</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </div>

                        {/* Controles Flotantes del Editor */}
                        <div className="absolute top-6 -right-16 flex flex-col gap-4">
                            <button
                                onClick={() => setMostrarPapel(!mostrarPapel)}
                                className={`p-4 rounded-2xl border backdrop-blur-xl transition-all ${mostrarPapel ? 'bg-white border-white text-black' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                    }`}
                                title="Previsualización de Papel"
                            >
                                <Layout size={20} />
                            </button>
                            <button
                                onClick={() => handleExportar('poster-container', 'PDF')}
                                className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl text-white hover:bg-white/10 transition-all"
                                title="Imprimir / Exportar PDF"
                            >
                                <Printer size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Colección de Diseños (Lado Derecho) */}
                <div className="xl:col-span-5 space-y-8">
                    <div className="flex items-center gap-3 text-white/40 mb-4">
                        <Grid size={18} />
                        <h3 className="text-xs font-bold uppercase tracking-widest">Tus Campañas ({cartelesGenerados.length})</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <AnimatePresence>
                            {cartelesGenerados.map((cartel) => (
                                <motion.div
                                    key={cartel.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="aero-cristal p-4 group relative border border-white/5 hover:border-white/20 transition-all"
                                >
                                    <div className="aspect-[3/4] bg-white/5 rounded-xl mb-4 overflow-hidden flex items-center justify-center border border-white/10">
                                        <div className="scale-[0.2] origin-center opacity-40 group-hover:opacity-100 transition-opacity">
                                            <GeneradorCartel formato={cartel.formato} />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-xs font-bold mb-1">{cartel.campana.nombre}</h4>
                                            <span className="text-[8px] text-white/30 uppercase tracking-widest">{cartel.formato} • {cartel.campana.estado}</span>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => eliminarCartel(cartel.id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg">
                                                <Trash2 size={12} />
                                            </button>
                                            <button className="p-1.5 text-white/60 hover:bg-white/10 rounded-lg">
                                                <Copy size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Empty State / Placeholder para Añadir */}
                        {cartelesGenerados.length === 0 && (
                            <div className="col-span-2 py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[2rem] gap-4">
                                <Plus className="text-white/10" size={40} />
                                <p className="text-white/20 text-xs font-bold uppercase tracking-[0.3em]">No hay campañas activas</p>
                            </div>
                        )}
                    </div>

                    {/* Marketing Pack Banner */}
                    <div className="mt-8 p-6 rounded-[2.5rem] bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 backdrop-blur-3xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-3">
                                <Layers className="text-blue-400" />
                                Marketing Pack
                            </h3>
                            <p className="text-white/40 text-[10px] uppercase tracking-widest leading-relaxed mb-6">
                                Exporta todos tus formatos A4, A5 y Square listos para imprenta y redes sociales en un solo archivo.
                            </p>
                            <button className="w-full py-4 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-3">
                                <Download size={16} />
                                Descargar ZIP Profesional
                            </button>
                        </div>
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                            <Download size={120} />
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .perspective-2000 { perspective: 2000px; }
            `}</style>
        </div>
    );
};
