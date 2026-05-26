"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import { Calendar, Ticket, MessageSquare, Phone, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';

/**
 * Componente: AccionMarketingCore.tsx
 * El motor de conversión final de la landing page.
 * Cambia dinámicamente según la estrategia detectada.
 */
export const AccionMarketingCore = () => {
    const adn = useTiendaEstado((s) => s.adnMarca);
    const mostrarExito = useTiendaEstado((s) => s.mostrarExito);
    const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS'>('IDLE');

    const estrategia = adn?.estrategiaPrincipal || 'LEAD_MAGNET';

    const handleAction = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('LOADING');

        // Simulación de envío
        setTimeout(() => {
            setStatus('SUCCESS');
            mostrarExito(
                estrategia === 'CITA_PREVIA' ? "¡Cita solicitada!" :
                    estrategia === 'OFERTA_FLASH' ? "¡Cupón guardado!" : "¡Mensaje enviado!"
            );
        }, 1500);
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-8 bg-[var(--color-fondo)]">
            <AnimatePresence mode="wait">
                {status === 'SUCCESS' ? (
                    <motion.div
                        key="success"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center space-y-4"
                    >
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">¡Conseguido!</h3>
                        <p className="text-white/50 text-sm">Pronto nos pondremos en contacto contigo.</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="form"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="w-full"
                    >
                        {estrategia === 'CITA_PREVIA' && <ModoReserva onSubmit={handleAction} loading={status === 'LOADING'} />}
                        {estrategia === 'OFERTA_FLASH' && <ModoCupon onSubmit={handleAction} loading={status === 'LOADING'} />}
                        {estrategia === 'LEAD_MAGNET' && <ModoContacto onSubmit={handleAction} loading={status === 'LOADING'} />}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ModoReserva = ({ onSubmit, loading }: { onSubmit: (e: any) => void, loading: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-6">
        <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-purple-500/10 mb-4">
                <Calendar className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Reserva tu Cita</h2>
            <p className="text-white/40 text-xs text-center">Atención personalizada en segundos.</p>
        </div>
        <div className="space-y-3">
            <input type="text" placeholder="Tu Nombre" required className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/20 outline-none focus:ring-1 ring-[var(--color-primario)]" />
            <input type="datetime-local" required className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:ring-1 ring-[var(--color-primario)]" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-[var(--color-primario)] text-white font-black py-4 rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 group">
            {loading ? "Procesando..." : "Confirmar Reserva"}
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </button>
    </form>
);

const ModoCupon = ({ onSubmit, loading }: { onSubmit: (e: any) => void, loading: boolean }) => (
    <div className="space-y-8">
        <div className="relative bg-gradient-to-br from-[var(--color-acento)]/20 to-[var(--color-primario)]/20 border-2 border-dashed border-white/20 rounded-[2.5rem] p-8 overflow-hidden">
            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[var(--color-fondo)] rounded-full -translate-y-1/2" />
            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[var(--color-fondo)] rounded-full -translate-y-1/2" />
            <div className="text-center space-y-4">
                <Ticket className="w-10 h-10 text-[var(--color-acento)] mx-auto" />
                <div>
                    <span className="text-[var(--color-acento)] font-black text-4xl">20% OFF</span>
                    <p className="text-white/60 text-xs mt-1 uppercase tracking-widest font-bold">Oferta de Bienvenida</p>
                </div>
                <div className="bg-white/5 rounded-xl py-2 px-4 inline-block">
                    <span className="text-white/40 font-mono text-[10px]">CADUCA EN: 23:59:59</span>
                </div>
            </div>
        </div>
        <button onClick={onSubmit} disabled={loading} className="w-full bg-white text-black font-black py-5 rounded-[2rem] shadow-2xl active:scale-95 transition-all text-xs uppercase tracking-[0.2em]">
            {loading ? "Generando..." : "Reclamar mi Cupón"}
        </button>
    </div>
);

const ModoContacto = ({ onSubmit, loading }: { onSubmit: (e: any) => void, loading: boolean }) => {
    const datosEscaparate = useTiendaEstado((s) => s.datosEscaparate);
    const adnMarca = useTiendaEstado((s) => s.adnMarca);
    const telefono = (datosEscaparate?.datosReales?.telefono || "").replace(/\s/g, "");
    const nombreNegocio = adnMarca?.analisisVision?.nombreSugerido || "Tu Negocio";
    const whatsappUrl = telefono
        ? `https://wa.me/${telefono}?text=${encodeURIComponent(`Hola ${nombreNegocio}, me gustaría más información.`)}`
        : "#";

    return (
        <div className="space-y-6">
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-white tracking-tight">Estamos para Ayudarte</h2>
                <p className="text-white/40 text-xs">Contacta por tu canal preferido.</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-4 bg-[#25D366]/10 border border-[#25D366]/20 p-5 rounded-2xl hover:bg-[#25D366]/20 transition-colors">
                    <div className="w-10 h-10 bg-[#25D366] rounded-xl flex items-center justify-center"><MessageSquare className="text-white w-5 h-5" /></div>
                    <div className="text-left"><span className="block text-white font-bold text-sm">WhatsApp Directo</span><span className="block text-white/40 text-[10px]">{telefono ? `+${telefono}` : 'Respuesta en minutos'}</span></div>
                </a>
                {telefono && (
                    <a href={`tel:${telefono}`}
                        className="flex items-center gap-4 bg-blue-500/10 border border-blue-500/20 p-5 rounded-2xl hover:bg-blue-500/20 transition-colors">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center"><Phone className="text-white w-5 h-5" /></div>
                        <div className="text-left"><span className="block text-white font-bold text-sm">Llamar Ahora</span><span className="block text-white/40 text-[10px]">+{telefono}</span></div>
                    </a>
                )}
                <button type="button" onClick={onSubmit}
                    className="flex items-center gap-4 bg-zinc-800 border border-white/5 p-5 rounded-2xl hover:bg-zinc-700 transition-colors">
                    <div className="w-10 h-10 bg-zinc-700 rounded-xl flex items-center justify-center"><MapPin className="text-white w-5 h-5" /></div>
                    <div className="text-left"><span className="block text-white font-bold text-sm">Enviar Consulta</span><span className="block text-white/40 text-[10px]">Te respondemos en minutos</span></div>
                </button>
            </div>
        </div>
    );
};
