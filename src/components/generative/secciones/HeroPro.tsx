"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

interface HeroProProps {
    titulo: string;
    subtitulo?: string;
    ctaTexto?: string;
    ctaAccion?: string;
    colores: {
        primario: string;
        secundario: string;
        acento: string;
    };
}

export const HeroPro = ({ titulo, subtitulo, ctaTexto, ctaAccion, colores }: HeroProProps) => {
    return (
        <section className="relative w-full min-h-[80vh] flex flex-col justify-center items-start px-6 py-12 overflow-hidden">
            {/* Fondo Mesh Gradient Animado */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full blur-[120px] opacity-60 animate-pulse"
                    style={{ background: colores.primario }}
                />
                <div
                    className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[100px] opacity-40 animate-pulse"
                    style={{ background: colores.secundario, animationDelay: "2s" }}
                />
                <div
                    className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] rounded-full blur-[80px] opacity-30 animate-pulse"
                    style={{ background: colores.acento, animationDelay: "4s" }}
                />
            </div>

            {/* Contenido */}
            <div className="relative z-10 max-w-lg space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1
                        className="text-5xl sm:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 leading-[1.1]"
                        style={{ textShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
                    >
                        {titulo}
                    </h1>
                </motion.div>

                {subtitulo && (
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 font-medium leading-relaxed max-w-md"
                    >
                        {subtitulo}
                    </motion.p>
                )}

                {ctaTexto && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative px-8 py-4 rounded-full overflow-hidden bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-xl"
                        onClick={() => ctaAccion && (window.location.href = ctaAccion)}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative flex items-center gap-3 text-gray-900 dark:text-white font-bold tracking-wide">
                            {ctaTexto}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>

                        {/* Brillo en borde */}
                        <div className="absolute inset-0 rounded-full border border-white/40 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                )}
            </div>
        </section>
    );
};
