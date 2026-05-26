'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Plus, LayoutGrid, BarChart3, Settings, HelpCircle,
    Zap, TrendingUp, QrCode, Eye, ChevronRight,
    LayoutDashboard, Sparkles
} from 'lucide-react';
import { useTiendaEstado, accionesTienda } from '@/store/useTiendaEstado';
import { DashboardPrincipal } from '@/components/dashboard/DashboardPrincipal';

const SIDEBAR_ITEMS = [
    { id: 'campañas', label: 'Campañas', icon: LayoutGrid },
    { id: 'analiticas', label: 'Analíticas', icon: BarChart3 },
    { id: 'ajustes', label: 'Ajustes', icon: Settings },
    { id: 'ayuda', label: 'Ayuda', icon: HelpCircle },
];

export default function PaginaDashboard() {
    const router = useRouter();
    const [seccionActiva, setSeccionActiva] = useState('campañas');

    const campañas = useTiendaEstado((s) => s.campañas);
    const adnMarca = useTiendaEstado((s) => s.adnMarca);
    const registroEscaneos = useTiendaEstado((s) => s.registroEscaneos);

    // Métricas globales calculadas
    const visitasTotales = campañas.reduce((acc, c) => acc + (c.metricas?.visitas || 0), 0);
    const escaneosTotales = registroEscaneos.length + campañas.reduce((acc, c) => acc + (c.metricas?.escaneos || 0), 0);
    const conversionesTotales = campañas.reduce((acc, c) => acc + (c.metricas?.conversiones || 0), 0);
    const saludMedia = campañas.length > 0
        ? Math.round(campañas.reduce((acc, c) => acc + (c.metricas?.puntajeSaludMarca || 0), 0) / campañas.length)
        : 0;

    const iniciarNuevo = () => {
        accionesTienda.reiniciar();
        localStorage.removeItem('foto-fachada-v2-semilla');
        router.push('/create');
    };

    return (
        <div className="min-h-screen flex">

            {/* ─── SIDEBAR (Desktop) ─── */}
            <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-white/5 px-3 py-6 sticky top-16 h-[calc(100vh-4rem)]">
                {/* CTA nuevo */}
                <button
                    type="button"
                    onClick={iniciarNuevo}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm shadow-lg hover:opacity-90 transition-opacity mb-6"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Escaparate
                </button>

                {/* Nav items */}
                <nav className="flex flex-col gap-1">
                    {SIDEBAR_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const activo = seccionActiva === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setSeccionActiva(item.id)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${activo
                                    ? 'bg-white/10 text-white'
                                    : 'text-white/50 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {item.label}
                                {item.id === 'campañas' && campañas.length > 0 && (
                                    <span className="ml-auto text-[10px] font-bold bg-white/10 text-white/60 px-1.5 py-0.5 rounded-full">
                                        {campañas.length}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Plan upgrade */}
                <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-purple-400" />
                        <span className="text-white text-xs font-bold">Plan Gratuito</span>
                    </div>
                    <p className="text-white/40 text-[10px] mb-3">Hasta 3 campañas activas. Actualiza para ilimitado.</p>
                    <button type="button" className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold hover:opacity-90 transition-opacity">
                        Actualizar a Pro
                    </button>
                </div>
            </aside>

            {/* ─── CONTENIDO PRINCIPAL ─── */}
            <div className="flex-1 min-w-0">

                {/* Header de página */}
                <div className="sticky top-16 z-30 bg-black/40 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <LayoutDashboard className="w-5 h-5 text-white/40" />
                        <div>
                            <h1 className="text-white font-bold text-base leading-none">Panel de Control</h1>
                            <p className="text-white/40 text-[10px] mt-0.5">
                                {adnMarca?.analisisVision?.nombreSugerido
                                    ? `${adnMarca.analisisVision.nombreSugerido} · `
                                    : ''}{campañas.length} campaña{campañas.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={iniciarNuevo}
                        className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xs"
                    >
                        <Plus className="w-3.5 h-3.5" /> Nuevo
                    </button>
                </div>

                <div className="p-6 max-w-6xl mx-auto space-y-8">

                    {/* ─── MÉTRICAS RESUMEN ─── */}
                    {campañas.length > 0 && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: "Visitas Totales", val: visitasTotales.toLocaleString(), icon: Eye, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", trend: "+12%" },
                                { label: "Escaneos QR", val: escaneosTotales.toLocaleString(), icon: QrCode, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", trend: "+8%" },
                                { label: "Conversiones", val: conversionesTotales.toLocaleString(), icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", trend: "+5%" },
                                { label: "Salud de Marca", val: `${saludMedia}%`, icon: Sparkles, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", trend: "Estable" },
                            ].map((m, i) => {
                                const Icon = m.icon;
                                return (
                                    <motion.div
                                        key={m.label}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.07 }}
                                        className={`p-5 rounded-2xl border ${m.bg}`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className={`w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center ${m.color}`}>
                                                <Icon className={`w-4 h-4 ${m.color}`} />
                                            </div>
                                            <span className="text-white/30 text-[9px] font-bold uppercase tracking-wider">{m.trend}</span>
                                        </div>
                                        <div className={`text-2xl font-black ${m.color}`}>{m.val}</div>
                                        <div className="text-white/40 text-[10px] font-medium mt-1">{m.label}</div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {/* ─── CONTENIDO POR SECCIÓN ─── */}
                    {seccionActiva === 'campañas' && (
                        <div>
                            <DashboardPrincipal />
                        </div>
                    )}

                    {seccionActiva === 'analiticas' && (
                        <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
                            <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <BarChart3 className="w-8 h-8 text-white/30" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Analíticas Avanzadas</h2>
                            <p className="text-white/40 max-w-sm text-sm">Próximamente: gráficas de visitas, mapas de calor de escaneos QR y análisis de conversión por campaña.</p>
                            <div className="px-5 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold">Próximamente en Pro</div>
                        </div>
                    )}

                    {seccionActiva === 'ajustes' && (
                        <div className="max-w-2xl space-y-4">
                            <h2 className="text-xl font-bold text-white mb-6">Configuración</h2>
                            {[
                                { titulo: "Nombre del negocio", desc: adnMarca?.analisisVision?.nombreSugerido || "Sin configurar", icon: "🏪" },
                                { titulo: "Categoría detectada", desc: adnMarca?.analisisVision?.categoriaSugerida || "Sin configurar", icon: "🏷️" },
                                { titulo: "Estrategia de conversión", desc: adnMarca?.estrategiaPrincipal || "LEAD_MAGNET", icon: "🎯" },
                                { titulo: "Redes sociales", desc: "Instagram, TikTok, Web", icon: "📱" },
                            ].map((item) => (
                                <div key={item.titulo} className="flex items-center justify-between p-5 rounded-2xl bg-white/4 border border-white/8 hover:border-white/15 transition-colors group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl">{item.icon}</span>
                                        <div>
                                            <p className="text-white font-medium text-sm">{item.titulo}</p>
                                            <p className="text-white/40 text-xs">{item.desc}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                                </div>
                            ))}
                        </div>
                    )}

                    {seccionActiva === 'ayuda' && (
                        <div className="max-w-2xl space-y-4">
                            <h2 className="text-xl font-bold text-white mb-6">Centro de Ayuda</h2>
                            {[
                                { q: "¿Cómo analiza la IA mi fachada?", a: "Usamos Google Gemini Vision para extraer colores, detectar el tipo de negocio, servicios y generar una estrategia de marca personalizada." },
                                { q: "¿El QR del cartel se puede escanear?", a: "Sí, los QR son reales y escaneables. Redirigen a /t/[slug] que registra el escaneo y lleva al usuario a tu escaparate digital." },
                                { q: "¿Se guardan mis datos?", a: "Actualmente los datos se guardan en tu navegador (localStorage). En la versión Pro, sincronizaremos con la nube para acceder desde cualquier dispositivo." },
                                { q: "¿Puedo tener varias campañas?", a: "Sí, puedes crear campañas ilimitadas (ej: Navidad, Black Friday). Cada campaña tiene su propio escaparate, cartel y QR." },
                            ].map((item, i) => (
                                <details key={i} className="group p-5 rounded-2xl bg-white/4 border border-white/8 open:border-white/15 transition-colors">
                                    <summary className="text-white font-medium text-sm cursor-pointer list-none flex items-center justify-between">
                                        {item.q}
                                        <ChevronRight className="w-4 h-4 text-white/30 group-open:rotate-90 transition-transform" />
                                    </summary>
                                    <p className="text-white/50 text-sm mt-3 leading-relaxed">{item.a}</p>
                                </details>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
