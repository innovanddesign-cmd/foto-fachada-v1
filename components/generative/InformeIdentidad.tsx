'use client';

/**
 * FOTO FACHADA V2 — Informe de Identidad (Revisión Maestra)
 * Motor: Antigravity v.2026 (Gemini 3 Pro)
 * 
 * Interfaz de validación de ADN de marca que permite al usuario
 * revisar y corregir los hallazgos de la IA antes del despliegue.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Palette, Type, Layout, Target,
    MessageCircle, Building2, CheckCircle2,
    AlertCircle, Upload, Edit3, Sparkles, Save
} from 'lucide-react';
import { useTiendaEstado, accionesTienda } from '@/store/useTiendaEstado';
import { AdnMarca } from '@/lib/estado/tipos-estado';
import UploaderLogotipo from '../captura/UploaderLogotipo';

interface Props {
    adn: AdnMarca;
    onConfirmar: () => void;
}

export default function InformeIdentidad({ adn, onConfirmar }: Props) {
    const imagenFachada = useTiendaEstado((s) => s.imagenSubida);
    const [editando, setEditando] = useState<string | null>(null);
    const [confirmando, setConfirmando] = useState(false);

    // Handlers para edición en tiempo real
    const actualizarCampo = (campo: string, valor: any) => {
        if (campo.includes('.')) {
            const [parent, child] = campo.split('.');
            accionesTienda.actualizarAdn({
                [parent]: {
                    ...(adn as any)[parent],
                    [child]: valor
                }
            });
        } else {
            accionesTienda.actualizarAdn({ [campo]: valor });
        }
    };

    const actualizarNombreIA = (valor: string) => {
        actualizarCampo('analisisVision.nombreSugerido', valor);
    };

    const actualizarBio = (valor: string) => {
        actualizarCampo('analisisMarketing', valor);
    };

    // Variantes de animación Apple-style
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
    };

    const manejarConfirmacion = () => {
        setConfirmando(true);
        setTimeout(() => {
            onConfirmar();
        }, 2000); // 2 segundos para el efecto de show
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-6xl mx-auto space-y-12 pb-32 px-4"
        >
            {/* Cabecera */}
            <motion.header variants={itemVariants} className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                    <Sparkles className="w-3 h-3" />
                    Identity Master-File v2.3
                </div>
                <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white">
                    Revisión de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">Identidad Digital</span>
                </h2>
                <div className="flex items-center justify-center gap-4 text-white/40">
                    <Building2 className="w-5 h-5" />
                    <input
                        value={adn.analisisVision?.nombreSugerido || ""}
                        onChange={(e) => actualizarNombreIA(e.target.value)}
                        className="bg-transparent border-b border-white/10 focus:border-blue-500 outline-none text-2xl md:text-3xl font-bold text-white text-center min-w-[300px] transition-colors"
                        placeholder="Nombre comercial"
                    />
                </div>
            </motion.header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* COLUMNA IZQUIERDA: VISUAL ADN (5 COLS) */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-8">
                    <motion.section variants={itemVariants} className="aero-cristal-profundo p-8 group">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-3">
                            <Palette className="w-5 h-5 text-blue-400" />
                            01. Espejo Visual
                        </h3>

                        {/* Paleta de Colores */}
                        <div className="space-y-8">
                            <div className="grid grid-cols-4 gap-4">
                                {Object.entries(adn.paletaColores).filter(([k]) => k !== 'superficieGlass' && !k.endsWith('HSL')).map(([key, color]) => (
                                    <div key={key} className="flex flex-col items-center gap-2">
                                        <motion.div
                                            whileHover={{ scale: 1.1, boxShadow: `0 0 20px ${color}44` }}
                                            className="w-full aspect-square rounded-2xl shadow-2xl border border-white/10 cursor-pointer"
                                            style={{ backgroundColor: color }}
                                        />
                                        <span className="text-[10px] font-mono text-white/30 uppercase">{key}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Tipografía Suggestion */}
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 hover:border-blue-500/30 transition-colors">
                                <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Estilo Tipográfico</span>
                                <p className={`text-2xl md:text-3xl text-white tracking-tight ${adn.estiloTipografico === 'SERIF_ELEGANTE' ? 'font-serif' : 'font-sans'}`}>
                                    {adn.analisisVision?.nombreSugerido || "Excelencia"}
                                </p>
                            </div>
                        </div>

                        {/* Fachada Hotspots Placeholder */}
                        <div className="mt-8 relative rounded-3xl overflow-hidden border border-white/10 aspect-video group">
                            {imagenFachada?.urlImagen ? (
                                <img src={imagenFachada.urlImagen} alt="Fachada" className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700" />
                            ) : (
                                <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                    <Building2 className="w-12 h-12 text-white/10" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                            {/* Hotspots simulados */}
                            <div className="absolute top-[30%] left-[40%] cursor-pointer group/hot">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)]"
                                />
                                <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded bg-blue-500 text-[10px] font-bold text-white uppercase drop-shadow-lg opacity-100 transition-opacity">
                                    Identidad Detectada
                                </div>
                            </div>
                        </div>
                    </motion.section>
                </div>

                {/* COLUMNA DERECHA: ESTRATEGIA Y ASIMILACIÓN (7 COLS) */}
                <div className="lg:col-span-12 xl:col-span-7 space-y-8">

                    {/* Panel Estratégico */}
                    <motion.section variants={itemVariants} className="aero-cristal-profundo p-8">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-3">
                            <Target className="w-5 h-5 text-purple-400" />
                            02. Perfil Estratégico
                        </h3>

                        <div className="space-y-8">
                            {/* Bio de Marca */}
                            <div className="relative group">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Storytelling IA</label>
                                    <Edit3 className="w-3 h-3 text-white/20 group-hover:text-purple-400 transition-colors" />
                                </div>
                                <textarea
                                    value={adn.analisisMarketing}
                                    onChange={(e) => actualizarBio(e.target.value)}
                                    className="w-full bg-transparent border-l-2 border-purple-500/30 pl-6 py-2 text-xl text-white/90 leading-relaxed font-light italic outline-none focus:border-purple-500 transition-all resize-none min-h-[120px]"
                                />
                            </div>

                            {/* Grid de Estrategia */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-colors space-y-2">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Target className="w-4 h-4 text-cyan-400" />
                                        <h4 className="font-bold text-[10px] text-white/40 uppercase tracking-widest">Océano Azul</h4>
                                    </div>
                                    <p className="text-sm text-white/70 italic leading-relaxed">
                                        {adn.inteligenciaMarketing?.gapDeMercado}
                                    </p>
                                </div>
                                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-pink-500/30 transition-colors space-y-2">
                                    <div className="flex items-center gap-3 mb-2">
                                        <MessageCircle className="w-4 h-4 text-pink-400" />
                                        <h4 className="font-bold text-[10px] text-white/40 uppercase tracking-widest">Personalidad</h4>
                                    </div>
                                    <p className="text-sm text-white/70 font-bold uppercase tracking-widest">
                                        {adn.inteligenciaMarketing?.arquetipoMarca}
                                    </p>
                                    <span className="block text-[10px] text-white/30 lowercase">Tono de comunicación {adn.inteligenciaMarketing?.tonoVoz}</span>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* Gestión de Activos (Logo) */}
                    <motion.section variants={itemVariants} className="aero-cristal-profundo p-8">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-3 mb-8">
                            <Layout className="w-5 h-5 text-emerald-400" />
                            03. Activos Críticos
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 items-center">
                            {/* Logo Display area */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-40 h-40 rounded-[2.5rem] bg-white border border-white/10 flex items-center justify-center p-6 shadow-2xl relative overflow-hidden group">
                                    {adn.logoExtraido ? (
                                        <img src={adn.logoExtraido} alt="Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="text-center space-y-2">
                                            <AlertCircle className="w-8 h-8 text-black/20 mx-auto" />
                                            <span className="block text-[8px] font-bold text-black/40 uppercase tracking-tighter">No detectado</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                        <Upload className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Estado: {adn.logoExtraido ? 'Detección OK' : 'Pendiente'}</span>
                            </div>

                            {/* Feedback & Actions */}
                            <div className="space-y-6">
                                {!adn.logoExtraido && (
                                    <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-200 text-xs flex gap-3">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <p>No hemos detectado un logo claro en la fachada. Podemos generar uno minimalista basado en tu ADN o puedes subir el tuyo.</p>
                                    </div>
                                )}
                                <div className="flex flex-col gap-3">
                                    <button className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium text-white/80">
                                        <Upload className="w-4 h-4" /> Subir Logotipo Oficial
                                    </button>
                                    <button className="text-xs text-white/30 hover:text-white/60 transition-colors underline underline-offset-4 decoration-white/10">
                                        Limpiar fondo de logo con IA
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                </div>
            </div>

            {/* BOTÓN DE ACCIÓN FINAL */}
            <motion.div variants={itemVariants} className="flex flex-col items-center gap-6 pt-12">
                <button
                    onClick={manejarConfirmacion}
                    className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_auto] rounded-full font-bold text-xl text-white shadow-[0_0_50px_-10px_rgba(59,130,246,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 animate-gradient-slow overflow-hidden"
                >
                    <span className="relative z-10 flex items-center gap-3">
                        Confirmar Identidad y Crear Escaparate
                        <CheckCircle2 className="w-6 h-6" />
                    </span>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <p className="text-white/20 text-xs uppercase tracking-[0.3em] font-bold">
                    Transicionando a FASE 3: UNIVERSO GENERATIVO
                </p>
            </motion.div>

            {/* Modal de Cierre de Análisis */}
            <AnimatePresence>
                {confirmando && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-8"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="space-y-8"
                        >
                            <div className="relative">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                                    className="w-24 h-24 rounded-full border-t-2 border-blue-500 border-r-2 border-transparent"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-bold tracking-tighter text-white">Sellando ADN Maestro</h3>
                                <p className="text-white/40 text-sm font-mono uppercase tracking-widest">Configurando parámetros del universo visual...</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
