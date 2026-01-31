'use client';

/**
 * FOTO FACHADA V2 — Dashboard Usuario
 * Motor: Antigravity v.2026 (Gemini 3 Pro)
 * 
 * Vista principal de galería de activos.
 * Estilo 'Torre de Control'.
 */

import { useTiendaEstado } from '@/store/useTiendaEstado';
import CuadriculaActivos from '@/components/dashboard/CuadriculaActivos';
import BarraNavegacionInferior from '@/components/layout/BarraNavegacionInferior';
import { UserCircle } from 'lucide-react';

export default function PaginaDashboard() {
    const imagenSubida = useTiendaEstado((s) => s.imagenSubida);

    // Simulamos una lista de activos basada en el estado actual
    // En producción esto vendría de una base de datos o historial persistido
    const activos = imagenSubida ? [imagenSubida] : [];

    return (
        <main className="min-h-screen pb-24">
            <div className="mesh-bg" />

            {/* Cabecera Móvil / Escritorio */}
            <header className="sticky top-0 z-40 px-6 py-4 bg-black/20 backdrop-blur-lg border-b border-white/5 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">Torre de Control</h1>
                    <p className="text-xs text-white/50">Gestión de Activos Digitales</p>
                </div>
                <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <UserCircle className="w-8 h-8 text-white/80" />
                </button>
            </header>

            {/* Contenido Principal */}
            <div className="px-4 py-6 sm:px-8 max-w-7xl mx-auto">

                {/* Filtros / Tabs Superiores (Placeholder futura expansión) */}
                <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    {['Todos', 'Pendientes', 'Analizados', 'Escaparates'].map((tab, i) => (
                        <button
                            key={tab}
                            className={`
                        px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap
                        border transition-all
                        ${i === 0
                                    ? 'bg-white text-black border-white'
                                    : 'bg-transparent text-white/60 border-white/10 hover:border-white/30 hover:text-white'}
                    `}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Galería Bento */}
                <CuadriculaActivos activos={activos} />

            </div>

            {/* Navegación Inferior (Visible solo en móvil) */}
            <BarraNavegacionInferior />

            {/* Footer Escritorio */}
            <footer className="hidden sm:block text-center py-8 text-white/20 text-xs">
                Foto Fachada V2 • Sistema de Gestión de Activos • v2.0.0
            </footer>
        </main>
    );
}
