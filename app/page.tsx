"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { accionesTienda } from "@/store/useTiendaEstado";

export default function Home() {
    const router = useRouter();

    const manejarInicio = () => {
        // Limpiar estado previo para nueva sesión
        accionesTienda.reiniciar();
        // También limpiar la semilla persistida para seguridad extra
        localStorage.removeItem('foto-fachada-v2-semilla');
        router.push("/create");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center sm:p-20">
            <div className="relative mb-8">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 opacity-75 blur-lg animate-pulse" />
                <span className="relative inline-flex items-center px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-sm font-medium text-white shadow-glass-sm">
                    <Sparkles className="w-4 h-4 mr-2 text-pink-400" />
                    Nueva Versión 2.0 Generativa
                </span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-white/90 to-white/50 drop-shadow-2xl">
                Tu Fachada,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Reinventada con IA</span>
            </h1>

            <p className="max-w-2xl text-lg sm:text-xl text-white/70 mb-10 leading-relaxed">
                Sube una foto y obtén un diseño de escaparate de élite, cartelería lista para imprimir y una web de ventas en segundos. Sin plantillas. Diseño generativo puro.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <button
                    onClick={manejarInicio}
                    className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] flex items-center justify-center overflow-hidden"
                >
                    <span className="relative z-10 flex items-center">
                        Empezar Ahora <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-pink-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button className="px-8 py-4 rounded-full border border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all font-medium text-white">
                    Ver Ejemplos Reales
                </button>
            </div>

            <footer className="absolute bottom-8 text-white/30 text-sm">
                Motor Antigravity v.2026 • Diseño Aero-Glassmorphism
            </footer>
        </div>
    );
}
