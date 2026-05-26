"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Download, Pencil, Globe, Pause, FileText, TrendingUp, TrendingDown, Minus, QrCode, Copy, Trash2, Play } from 'lucide-react';
import type { CampañaUsuario } from '@/lib/estado/tipos-estado';

interface Props {
    campaña: CampañaUsuario;
    onVerWeb?: () => void;
    onDescargarCartel?: () => void;
    onEditar?: () => void;
    onEliminar?: () => void;
    onDuplicar?: () => void;
    onCambiarEstado?: (estado: CampañaUsuario['estado']) => void;
}

/**
 * TarjetaCampaña.tsx
 * Cada campaña agrupa su Web y su Cartel QR.
 * Incluye acciones: ver web, editar, duplicar, eliminar, cambiar estado.
 */
export const TarjetaCampaña = ({ campaña, onVerWeb, onDescargarCartel, onEditar, onEliminar, onDuplicar, onCambiarEstado }: Props) => {
    const { nombreCampaña, estado, metricas, fechaCreacion, idCartel } = campaña;

    const estadoConfig = {
        'EN_LINEA': { label: 'En línea', color: 'bg-emerald-500', icon: Globe },
        'PAUSADA':  { label: 'Pausada',  color: 'bg-amber-500',   icon: Pause },
        'BORRADOR': { label: 'Borrador', color: 'bg-zinc-500',    icon: FileText }
    };

    const tendenciaConfig = {
        'CRECIMIENTO': { icon: TrendingUp,   color: 'text-emerald-400' },
        'ESTABLE':     { icon: Minus,        color: 'text-amber-400' },
        'DECLIVE':     { icon: TrendingDown, color: 'text-rose-400' }
    };

    const EstadoInfo = estadoConfig[estado];
    const TendenciaInfo = tendenciaConfig[metricas.tendencia];

    // Siguiente estado al hacer toggle
    const siguienteEstado: CampañaUsuario['estado'] =
        estado === 'EN_LINEA' ? 'PAUSADA' :
        estado === 'PAUSADA'  ? 'EN_LINEA' :
        'EN_LINEA'; // BORRADOR → publicar

    const labelToggle = estado === 'EN_LINEA' ? 'Pausar' : estado === 'PAUSADA' ? 'Reanudar' : 'Publicar';
    const IconoToggle = estado === 'EN_LINEA' ? Pause : Play;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden rounded-3xl bg-zinc-900/80 border border-white/5 backdrop-blur-xl group"
        >
            {/* Header con miniatura */}
            <div className="relative h-40 bg-gradient-to-br from-zinc-800 to-zinc-900 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-36 bg-zinc-800 rounded-xl border border-white/10 shadow-2xl flex items-center justify-center">
                        <span className="text-[8px] font-bold text-white/20 uppercase tracking-wider">Preview</span>
                    </div>
                </div>

                {/* Badge de estado (clicable para toggle) */}
                <div className="absolute top-4 left-4">
                    <button
                        type="button"
                        aria-label={`Estado: ${EstadoInfo.label}. Click para ${labelToggle}`}
                        onClick={() => onCambiarEstado?.(siguienteEstado)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${EstadoInfo.color}/20 border border-current hover:opacity-80 transition-opacity`}
                    >
                        <EstadoInfo.icon size={12} className={EstadoInfo.color.replace('bg-', 'text-')} />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${EstadoInfo.color.replace('bg-', 'text-')}`}>
                            {EstadoInfo.label}
                        </span>
                    </button>
                </div>

                {/* Indicador QR */}
                {idCartel && (
                    <div className="absolute top-4 right-4">
                        <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                            <QrCode size={14} className="text-white/60" />
                        </div>
                    </div>
                )}

                {/* Acciones rápidas (aparecen en hover) */}
                <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <IconButton icon={Copy} label="Duplicar campaña" onClick={onDuplicar} />
                    <IconButton icon={Trash2} label="Eliminar campaña" onClick={onEliminar} danger />
                </div>
            </div>

            {/* Contenido */}
            <div className="p-5 space-y-4">
                {/* Título y tendencia */}
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-white leading-tight truncate">{nombreCampaña}</h3>
                        <p className="text-xs text-white/30 mt-0.5">
                            {new Date(fechaCreacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                    <div className={`flex items-center gap-1 ml-2 shrink-0 ${TendenciaInfo.color}`}>
                        <TendenciaInfo.icon size={16} />
                    </div>
                </div>

                {/* Métricas rápidas */}
                <div className="grid grid-cols-3 gap-3">
                    <MetricaMini label="Visitas"  valor={metricas.visitas} />
                    <MetricaMini label="Clicks"   valor={metricas.conversiones} />
                    <MetricaMini label="Escaneos" valor={metricas.escaneos} />
                </div>

                {/* Barra de salud */}
                <div className="space-y-1">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Salud de Marca</span>
                        <span className="text-xs font-bold text-white">{metricas.puntajeSaludMarca}/100</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${metricas.puntajeSaludMarca}%` }}
                            transition={{ duration: 1, delay: 0.4 }}
                            className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 rounded-full"
                        />
                    </div>
                </div>

                {/* Acciones principales */}
                <div className="flex gap-2 pt-1">
                    <AccionRapida icon={Eye}     label="Ver Web"  onClick={onVerWeb}           disabled={estado === 'BORRADOR'} />
                    <AccionRapida icon={Download} label="Cartel"  onClick={onDescargarCartel}  disabled={!idCartel} />
                    <AccionRapida icon={Pencil}   label="Editar"  onClick={onEditar}           primary />
                </div>
            </div>
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════
// SUBCOMPONENTES
// ═══════════════════════════════════════════════════════════════

const MetricaMini = ({ label, valor }: { label: string; valor: number }) => (
    <div className="text-center p-2 rounded-xl bg-white/5">
        <span className="block text-lg font-black text-white">{valor}</span>
        <span className="text-[8px] font-bold text-white/30 uppercase tracking-wider">{label}</span>
    </div>
);

const IconButton = ({ icon: Icon, label, onClick, danger }: { icon: React.ElementType; label: string; onClick?: () => void; danger?: boolean }) => (
    <button
        type="button"
        aria-label={label}
        onClick={(e) => { e.stopPropagation(); onClick?.(); }}
        className={`w-8 h-8 rounded-lg backdrop-blur-sm flex items-center justify-center transition-colors ${
            danger ? 'bg-rose-500/80 hover:bg-rose-400 text-white' : 'bg-white/10 hover:bg-white/20 text-white/70'
        }`}
    >
        <Icon size={14} />
    </button>
);

interface AccionRapidaProps {
    icon: React.ElementType;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    primary?: boolean;
}

const AccionRapida = ({ icon: Icon, label, onClick, disabled, primary }: AccionRapidaProps) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
            disabled
                ? 'bg-white/5 text-white/20 cursor-not-allowed'
                : primary
                    ? 'bg-blue-500 text-white hover:bg-blue-400'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
        }`}
    >
        <Icon size={13} />
        {label}
    </button>
);
