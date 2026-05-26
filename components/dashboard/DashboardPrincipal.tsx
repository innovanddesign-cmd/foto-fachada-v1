"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import { calcularResumenGlobal } from '@/lib/campañas/GestionCampañas';
import { AnillosActividad } from './AnillosActividad';
import { TarjetaCampaña } from './TarjetaCampaña';
import { PanelOptimizadorIA } from './PanelOptimizadorIA';
import { BotonMagnetico } from '@/components/ui/BotonMagnetico';
import { Plus, Sparkles, BarChart3, ArrowLeft } from 'lucide-react';
import type { CampañaUsuario } from '@/lib/estado/tipos-estado';

/**
 * DashboardPrincipal.tsx
 * Centro de comando con gestión real de campañas (CRUD completo).
 * Campañas persisten en el store entre sesiones del flujo de creación.
 */
export const DashboardPrincipal = () => {
    const establecerPaso = useTiendaEstado((s) => s.establecerPaso);
    const campañas = useTiendaEstado((s) => s.campañas);
    const eliminarCampaña = useTiendaEstado((s) => s.eliminarCampaña);
    const duplicarCampaña = useTiendaEstado((s) => s.duplicarCampaña);
    const cambiarEstadoCampaña = useTiendaEstado((s) => s.cambiarEstadoCampaña);

    // Modal: confirmación de borrado
    const [modalEliminar, setModalEliminar] = useState<CampañaUsuario | null>(null);
    // Modal: duplicar con nombre
    const [modalDuplicar, setModalDuplicar] = useState<CampañaUsuario | null>(null);
    const [nombreDuplicado, setNombreDuplicado] = useState('');

    const resumen = calcularResumenGlobal(campañas);

    const handleNuevaCampaña = () => {
        establecerPaso('CAPTURA');
    };

    const handleConfirmarEliminar = () => {
        if (!modalEliminar) return;
        eliminarCampaña(modalEliminar.id);
        setModalEliminar(null);
    };

    const handleConfirmarDuplicar = () => {
        if (!modalDuplicar || !nombreDuplicado.trim()) return;
        duplicarCampaña(modalDuplicar.id, nombreDuplicado.trim());
        setModalDuplicar(null);
        setNombreDuplicado('');
    };

    const handleAbrirDuplicar = (campaña: CampañaUsuario) => {
        setNombreDuplicado(`${campaña.nombreCampaña} (copia)`);
        setModalDuplicar(campaña);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 md:p-10">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Header */}
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            aria-label="Volver al escaparate"
                            onClick={() => establecerPaso('ESCAPARATE')}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">Panel de Control</h1>
                            <p className="text-white/40 text-sm">Gestiona tus campañas digitales</p>
                        </div>
                    </div>
                    <BotonMagnetico
                        onClick={handleNuevaCampaña}
                        variante="primario"
                        className="px-5 py-3 text-sm font-bold"
                    >
                        <Plus size={18} />
                        Nueva Campaña
                    </BotonMagnetico>
                </header>

                {/* Anillos + Métricas globales */}
                <section className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                                <BarChart3 size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Resumen de Actividad</h2>
                                <p className="text-white/40 text-xs">Todas las campañas</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <MetricaGrande valor={resumen.visitasTotales} label="Visitas Totales" color="from-pink-500 to-rose-500" />
                            <MetricaGrande valor={resumen.conversionesTotales} label="Conversiones" color="from-emerald-500 to-green-500" />
                            <MetricaGrande valor={resumen.escaneosTotales} label="Escaneos QR" color="from-blue-500 to-cyan-500" />
                            <MetricaGrande valor={resumen.puntajePromedioSalud} label="Salud Promedio" color="from-amber-500 to-orange-500" suffix="/100" />
                        </div>
                    </div>
                    <div className="flex justify-center py-8">
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-transparent to-blue-500/20 rounded-full blur-3xl" />
                            <AnillosActividad
                                visitas={resumen.visitasTotales}
                                conversiones={resumen.conversionesTotales}
                                ratioConversion={resumen.visitasTotales > 0 ? (resumen.conversionesTotales / resumen.visitasTotales) * 100 : 0}
                            />
                        </motion.div>
                    </div>
                </section>

                {/* Optimizador IA */}
                {campañas.length > 0 && (
                    <section>
                        <PanelOptimizadorIA campaña={campañas[0]} />
                    </section>
                )}

                {/* Grid de Campañas */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Tus Campañas</h2>
                        <span className="text-xs font-bold text-white/30 uppercase tracking-widest">
                            {campañas.length} {campañas.length === 1 ? 'campaña' : 'campañas'}
                        </span>
                    </div>

                    {campañas.length === 0 ? (
                        <EmptyState onCrear={handleNuevaCampaña} />
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence>
                                {campañas.map((campaña, idx) => (
                                    <motion.div
                                        key={campaña.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: idx * 0.07 }}
                                    >
                                        <TarjetaCampaña
                                            campaña={campaña}
                                            onVerWeb={() => campaña.urlPublica && window.open(campaña.urlPublica, '_blank')}
                                            onEditar={() => establecerPaso('CONFIGURACION')}
                                            onEliminar={() => setModalEliminar(campaña)}
                                            onDuplicar={() => handleAbrirDuplicar(campaña)}
                                            onCambiarEstado={(estado) => cambiarEstadoCampaña(campaña.id, estado)}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </section>

            </div>

            {/* Modal: Confirmar Eliminación */}
            <AnimatePresence>
                {modalEliminar && (
                    <Modal onCerrar={() => setModalEliminar(null)}>
                        <div className="space-y-5 text-center">
                            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/20 flex items-center justify-center">
                                <span className="text-2xl">🗑️</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">¿Eliminar campaña?</h3>
                                <p className="text-white/40 text-sm mt-1">
                                    Se borrará <span className="text-white font-semibold">"{modalEliminar.nombreCampaña}"</span>. Esta acción no se puede deshacer.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setModalEliminar(null)}
                                    className="flex-1 py-3 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-colors text-sm font-bold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmarEliminar}
                                    className="flex-1 py-3 rounded-xl bg-rose-500 text-white hover:bg-rose-400 transition-colors text-sm font-bold"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>

            {/* Modal: Duplicar con nombre */}
            <AnimatePresence>
                {modalDuplicar && (
                    <Modal onCerrar={() => setModalDuplicar(null)}>
                        <div className="space-y-5">
                            <div>
                                <h3 className="text-lg font-bold text-white">Duplicar campaña</h3>
                                <p className="text-white/40 text-sm mt-1">
                                    Elige un nombre para la nueva campaña. Ideal para Navidad, Black Friday, verano...
                                </p>
                            </div>
                            <input
                                type="text"
                                value={nombreDuplicado}
                                onChange={(e) => setNombreDuplicado(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleConfirmarDuplicar()}
                                placeholder="Ej: Campaña Navidad 2026"
                                autoFocus
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                            />
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setModalDuplicar(null)}
                                    className="flex-1 py-3 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-colors text-sm font-bold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmarDuplicar}
                                    disabled={!nombreDuplicado.trim()}
                                    className="flex-1 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-bold"
                                >
                                    Duplicar
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// SUBCOMPONENTES
// ═══════════════════════════════════════════════════════════════

const MetricaGrande = ({ valor, label, color, suffix = '' }: { valor: number; label: string; color: string; suffix?: string }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-xl">
        <div className={`text-3xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
            {valor.toLocaleString()}{suffix}
        </div>
        <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">{label}</div>
    </motion.div>
);

const EmptyState = ({ onCrear }: { onCrear: () => void }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 px-10 rounded-3xl bg-zinc-900/50 border border-dashed border-white/10">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Sin campañas todavía</h3>
        <p className="text-white/40 text-sm mb-8 max-w-md mx-auto">
            Crea tu primera campaña subiendo una foto de tu fachada. La IA generará tu escaparate digital en segundos.
        </p>
        <BotonMagnetico onClick={onCrear} variante="primario" className="px-8 py-4 text-base font-bold">
            <Plus size={18} />
            Crear Primera Campaña
        </BotonMagnetico>
    </motion.div>
);

const Modal = ({ children, onCerrar }: { children: React.ReactNode; onCerrar: () => void }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onCerrar}
    >
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm p-6 rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl"
        >
            {children}
        </motion.div>
    </motion.div>
);
