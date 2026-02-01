"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Calendar, Download, CheckCircle2, ChevronRight, Gift } from "lucide-react";
import confetti from "canvas-confetti";
import { useTiendaEstado } from "@/store/useTiendaEstado";

interface AccionMarketingCoreProps {
    estrategia?: 'OFERTA_FLASH' | 'CITA_PREVIA' | 'LEAD_MAGNET';
    colores: {
        primario: string;
        acento: string;
    };
}

export const AccionMarketingCore = ({ estrategia = 'CITA_PREVIA', colores }: AccionMarketingCoreProps) => {
    const [completado, setCompletado] = useState(false);

    // Inyectamos estado global para comunicar con la Dynamic Island (simulado por ahora)
    const setAnalizando = useTiendaEstado((s) => s.iniciarAnalisis); // Usando una función existente como "trigger" temporal o podríamos añadir una acción específica

    const activarExito = () => {
        setCompletado(true);

        // Confetti Sutil
        const count = 200;
        const defaults = {
            origin: { y: 0.7 },
            colors: [colores.primario, colores.acento, "#ffffff"]
        };

        function fire(particleRatio: number, opts: any) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
    };

    if (completado) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full py-16 px-6 text-center"
            >
                <div className="inline-flex items-center justify-center p-4 bg-green-500/20 text-green-400 rounded-full mb-6 ring-1 ring-green-500/40 shadow-[0_0_30px_-5px_rgba(74,222,128,0.3)]">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">¡Acción Confirmada!</h3>
                <p className="text-white/60">Revisa tu correo o WhatsApp para los siguientes pasos.</p>
            </motion.div>
        );
    }

    return (
        <section className="w-full py-16 px-6">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-xl p-8 md:p-12"
            >
                {/* Fondo Decorativo */}
                <div
                    className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none"
                    style={{ background: colores.primario }}
                />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">

                    {/* Contenido / Copy */}
                    <div className="flex-1 text-center md:text-left space-y-4">
                        {estrategia === 'OFERTA_FLASH' && (
                            <>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold uppercase tracking-wider mb-2">
                                    <Clock className="w-3 h-3" /> Tiempo Limitado
                                </div>
                                <h3 className="text-3xl font-black text-white leading-tight">
                                    50% OFF en tu Primera Visita
                                </h3>
                                <p className="text-white/70 text-lg">
                                    Esta oferta expira en <span className="text-white font-mono font-bold">04:59</span> minutos. ¡No la dejes pasar!
                                </p>
                            </>
                        )}

                        {estrategia === 'CITA_PREVIA' && (
                            <>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
                                    <Calendar className="w-3 h-3" /> Agenda Online
                                </div>
                                <h3 className="text-3xl font-black text-white leading-tight">
                                    Reserva tu Espacio VIP
                                </h3>
                                <p className="text-white/70 text-lg">
                                    Selecciona tu horario preferido y evita esperas innecesarias.
                                </p>
                            </>
                        )}

                        {estrategia === 'LEAD_MAGNET' && (
                            <>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
                                    <Gift className="w-3 h-3" /> Recurso Gratuito
                                </div>
                                <h3 className="text-3xl font-black text-white leading-tight">
                                    Catálogo de Tendencias 2026
                                </h3>
                                <p className="text-white/70 text-lg">
                                    Descarga nuestra guía exclusiva de estilos y productos premium.
                                </p>
                            </>
                        )}
                    </div>

                    {/* Acción / Formulario */}
                    <div className="w-full md:w-auto min-w-[300px]">
                        <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                            {estrategia === 'OFERTA_FLASH' && (
                                <button
                                    onClick={activarExito}
                                    className="w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                    style={{ background: colores.acento }}
                                >
                                    Reclamar Cupón
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            )}

                            {estrategia === 'CITA_PREVIA' && (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Tu Nombre"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                                    />
                                    <input
                                        type="date"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/70 focus:outline-none focus:border-white/30"
                                    />
                                    <button
                                        onClick={activarExito}
                                        className="w-full py-3 rounded-xl font-bold text-white bg-white/10 hover:bg-white/20 border border-white/10 transition-all mt-2"
                                    >
                                        Ver Disponibilidad
                                    </button>
                                </div>
                            )}

                            {estrategia === 'LEAD_MAGNET' && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 mb-4 p-3 bg-white/5 rounded-lg">
                                        <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center">
                                            <Download className="w-5 h-5 text-white/50" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-white text-sm font-bold">Guía_2026.pdf</p>
                                            <p className="text-white/40 text-xs">2.4 MB</p>
                                        </div>
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="tu@email.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                                    />
                                    <button
                                        onClick={activarExito}
                                        className="w-full py-3 rounded-xl font-bold text-black"
                                        style={{ background: colores.acento }}
                                    >
                                        Enviar y Descargar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </motion.div>
        </section>
    );
};
