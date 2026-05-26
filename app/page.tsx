"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowRight, Sparkles, Zap, QrCode, BarChart3,
    Palette, Printer, Globe, CheckCircle, Camera,
    Star, ChevronRight
} from "lucide-react";
import { accionesTienda } from "@/store/useTiendaEstado";

const FEATURES = [
    {
        icon: Camera,
        titulo: "Análisis de Fachada con IA",
        desc: "Gemini Vision extrae el ADN visual de tu negocio: colores, estilo, categoría y posicionamiento de marca.",
        color: "from-blue-500 to-cyan-400"
    },
    {
        icon: Globe,
        titulo: "Escaparate Digital en Segundos",
        desc: "Genera una landing page personalizada y lista para publicar con el diseño único de tu negocio.",
        color: "from-purple-500 to-pink-500"
    },
    {
        icon: Printer,
        titulo: "Cartelería Lista para Imprimir",
        desc: "Diseños en A4, A5 y cuadrado con QR de seguimiento. Descarga en alta resolución (300 DPI).",
        color: "from-orange-500 to-amber-400"
    },
    {
        icon: QrCode,
        titulo: "QR con Tracking Inteligente",
        desc: "Cada cartel genera un QR único que registra escaneos, dispositivos y ubicación estimada.",
        color: "from-emerald-500 to-teal-400"
    },
    {
        icon: BarChart3,
        titulo: "Panel de Campañas",
        desc: "Gestiona múltiples campañas (Navidad, Black Friday…) y monitoriza visitas, conversiones y escaneos.",
        color: "from-pink-500 to-rose-400"
    },
    {
        icon: Palette,
        titulo: "Editor Conversacional Zen",
        desc: "Personaliza cada sección de tu escaparate respondiendo preguntas simples. Sin formularios.",
        color: "from-indigo-500 to-violet-400"
    },
];

const PASOS = [
    { num: "01", titulo: "Sube tu fachada", desc: "Foto desde el móvil o escritorio. JPG, PNG, WEBP o HEIC." },
    { num: "02", titulo: "IA analiza tu negocio", desc: "Gemini extrae colores, categoría, servicios y estrategia de marca." },
    { num: "03", titulo: "Revisa tu ADN de marca", desc: "Paleta, arquetipo, océano azul y estrategia de conversión detectados." },
    { num: "04", titulo: "Publica y comparte", desc: "Tu escaparate online + carteles físicos con QR en menos de 2 minutos." },
];

const TESTIMONIALS = [
    { nombre: "Cafetería El Rincón", cat: "Gastronomía", texto: "En 3 minutos tuve mi landing lista y el cartel para la puerta. Mis clientes escanean el QR y piden por WhatsApp directamente.", estrellas: 5 },
    { nombre: "Peluquería Avant", cat: "Estética y Belleza", texto: "La IA detectó exactamente el estilo de mi salón. El diseño generado parece de agencia.", estrellas: 5 },
    { nombre: "Ferretería Torres", cat: "Retail", texto: "Ahora tengo campañas separadas para cada temporada. Super sencillo de gestionar.", estrellas: 5 },
];

export default function Home() {
    const router = useRouter();

    const manejarInicio = () => {
        accionesTienda.reiniciar();
        localStorage.removeItem('foto-fachada-v2-semilla');
        router.push("/create");
    };

    return (
        <div className="min-h-screen overflow-x-hidden">

            {/* ─── HERO ─── */}
            <section className="relative flex flex-col items-center justify-center min-h-[88vh] px-6 py-20 text-center overflow-hidden">
                {/* Glow orbs */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-pink-600/15 rounded-full blur-[100px] pointer-events-none" />

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-bold uppercase tracking-wider mb-8">
                        <Sparkles className="w-3.5 h-3.5" />
                        Impulsado por Google Gemini Vision AI
                    </div>

                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter mb-6 leading-[0.95]">
                        <span className="text-white">Tu fachada,</span><br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
                            reinventada con IA
                        </span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg sm:text-xl text-white/60 mb-10 leading-relaxed">
                        Sube una foto de tu local y obtén en menos de 2 minutos: <strong className="text-white/90">escaparate digital</strong>, <strong className="text-white/90">cartelería imprimible</strong> y <strong className="text-white/90">QR de seguimiento</strong>. Sin diseñadores ni agencias.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <motion.button
                            type="button"
                            onClick={manejarInicio}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="group px-8 py-4 bg-white text-black rounded-2xl font-black text-base hover:bg-gray-100 transition-colors shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2"
                        >
                            <Zap className="w-5 h-5" />
                            Crear mi Escaparate — Gratis
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                        <button
                            type="button"
                            onClick={() => router.push('/dashboard')}
                            className="px-8 py-4 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 transition-all font-semibold text-white/80 text-base"
                        >
                            Ver mi Dashboard
                        </button>
                    </div>

                    <p className="mt-5 text-white/30 text-xs">Sin registro · Sin tarjeta de crédito · Resultados en 2 minutos</p>
                </motion.div>

                {/* Mock screenshot del producto */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="mt-16 w-full max-w-4xl mx-auto"
                >
                    <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)]">
                        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 bg-white/3">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                                <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                            </div>
                            <div className="flex-1 mx-4 bg-white/5 rounded-lg px-3 py-1 text-center">
                                <span className="text-white/30 text-[10px] font-mono">foto-fachada.app/create</span>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: "Campañas Activas", val: "3", color: "text-emerald-400" },
                                { label: "Visitas Totales", val: "1.2K", color: "text-blue-400" },
                                { label: "Escaneos QR", val: "284", color: "text-purple-400" },
                                { label: "Salud de Marca", val: "92%", color: "text-pink-400" },
                            ].map((m) => (
                                <div key={m.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                                    <div className={`text-2xl font-black ${m.color}`}>{m.val}</div>
                                    <div className="text-white/40 text-[10px] font-medium mt-1">{m.label}</div>
                                </div>
                            ))}
                        </div>
                        <div className="px-6 pb-6 grid grid-cols-3 gap-3">
                            {['Cafetería El Rincón', 'Peluquería Avant', 'Ferretería Torres'].map((n, i) => (
                                <div key={n} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
                                    <div className="w-full aspect-video bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl" />
                                    <div className="text-white/70 text-xs font-bold truncate">{n}</div>
                                    <div className={`text-[9px] font-bold px-2 py-0.5 rounded-full w-fit ${i === 0 ? 'bg-emerald-500/20 text-emerald-400' : i === 1 ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                        {i === 0 ? 'EN LÍNEA' : i === 1 ? 'EN LÍNEA' : 'BORRADOR'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* ─── CÓMO FUNCIONA ─── */}
            <section className="px-6 py-24 max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-purple-400 text-xs font-bold uppercase tracking-widest">Proceso</span>
                    <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">De foto a escaparate en 4 pasos</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {PASOS.map((paso, i) => (
                        <motion.div
                            key={paso.num}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="relative p-6 rounded-3xl bg-white/4 border border-white/8 hover:border-white/15 transition-colors group"
                        >
                            <div className="text-4xl font-black text-white/8 group-hover:text-white/15 transition-colors mb-4">{paso.num}</div>
                            <h3 className="text-white font-bold text-base mb-2">{paso.titulo}</h3>
                            <p className="text-white/50 text-sm leading-relaxed">{paso.desc}</p>
                            {i < PASOS.length - 1 && (
                                <ChevronRight className="absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 hidden lg:block" />
                            )}
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ─── FEATURES ─── */}
            <section className="px-6 py-24 max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-pink-400 text-xs font-bold uppercase tracking-widest">Funcionalidades</span>
                    <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">Todo lo que necesita tu negocio local</h2>
                    <p className="text-white/50 mt-3 max-w-xl mx-auto">Herramientas de marketing digital de agencia, accesibles para cualquier tienda o local.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {FEATURES.map((f, i) => {
                        const Icon = f.icon;
                        return (
                            <motion.div
                                key={f.titulo}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.07 }}
                                className="p-6 rounded-3xl bg-white/4 border border-white/8 hover:border-white/15 transition-all group hover:-translate-y-1"
                            >
                                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-white font-bold text-base mb-2">{f.titulo}</h3>
                                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* ─── TESTIMONIALS ─── */}
            <section className="px-6 py-24 max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Testimonios</span>
                    <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">Negocios que ya lo usan</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {TESTIMONIALS.map((t, i) => (
                        <motion.div
                            key={t.nombre}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-6 rounded-3xl bg-white/4 border border-white/8"
                        >
                            <div className="flex gap-0.5 mb-4">
                                {Array.from({ length: t.estrellas }).map((_, j) => (
                                    <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                ))}
                            </div>
                            <p className="text-white/70 text-sm leading-relaxed mb-5 italic">"{t.texto}"</p>
                            <div>
                                <p className="text-white font-bold text-sm">{t.nombre}</p>
                                <p className="text-white/40 text-xs">{t.cat}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ─── CTA FINAL ─── */}
            <section className="px-6 py-24 max-w-3xl mx-auto text-center">
                <div className="p-12 rounded-[2.5rem] bg-gradient-to-br from-purple-500/15 to-pink-500/15 border border-purple-500/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-pink-600/10 pointer-events-none" />
                    <div className="relative">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/60 text-xs mb-6">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            Gratis · Sin registro · Resultados en 2 minutos
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">¿Listo para transformar tu negocio?</h2>
                        <p className="text-white/60 mb-8 max-w-md mx-auto">Únete a los negocios locales que ya tienen su escaparate digital impulsado por IA.</p>
                        <motion.button
                            type="button"
                            onClick={manejarInicio}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="px-10 py-4 bg-white text-black rounded-2xl font-black text-base hover:bg-gray-100 transition-colors shadow-2xl flex items-center gap-2 mx-auto"
                        >
                            <Zap className="w-5 h-5" />
                            Empezar Ahora — Es Gratis
                        </motion.button>
                    </div>
                </div>
            </section>

            {/* ─── FOOTER ─── */}
            <footer className="border-t border-white/5 px-6 py-10">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <span className="text-white font-black text-[10px]">FF</span>
                        </div>
                        <span className="text-white/60 text-sm font-medium">Foto Fachada AI</span>
                    </div>
                    <p className="text-white/25 text-xs font-mono">Motor Antigravity v.2026 · Diseño Aero-Glassmorphism · Impulsado por Gemini</p>
                    <div className="flex gap-4 text-white/30 text-xs">
                        <a href="#" className="hover:text-white/60 transition-colors">Privacidad</a>
                        <a href="#" className="hover:text-white/60 transition-colors">Términos</a>
                        <a href="#" className="hover:text-white/60 transition-colors">Contacto</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
