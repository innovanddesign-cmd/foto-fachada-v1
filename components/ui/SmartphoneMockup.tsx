"use client";

import React, { useRef } from "react";
import {
    motion,
    AnimatePresence,
    useScroll,
    useTransform,
    useSpring,
    useMotionValue,
    useMotionTemplate
} from "framer-motion";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { useTiendaEstado } from "@/store/useTiendaEstado";

/**
 * PROPS DEL COMPONENTE SMARTPHONE MOCKUP
 */
interface SmartphoneMockupProps {
    children: React.ReactNode;
    /**
     * @deprecated Use el estado global 'analizando' del store, pero se mantiene como override manual.
     */
    isGenerating?: boolean;
    /**
     * Define si el componente está en modo vista pública (sin paneles de edición).
     * En móvil, el mockup desaparece y se muestra el contenido al 100% del viewport.
     */
    isPublicView?: boolean;
}

/**
 * COMPONENTE: SMARTPHONE MOCKUP (Titanium Frame & Physics)
 * 
 * Simula un dispositivo de gama alta con físicas de cristal líquido.
 * Incluye:
 * - Scroll Elástico (Rubber Banding) estilo iOS.
 * - Dynamic Island reactiva con estado global.
 * - Reflejos dinámicos basados en la posición del scroll.
 * - Feedback háptico visual (Squash & Stretch).
 * - Adaptación Responsive: Modo Standalone para landing pública.
 */
export const SmartphoneMockup = ({
    children,
    isGenerating: propIsGenerating = false,
    isPublicView = false
}: SmartphoneMockupProps) => {

    // Conexión al Store Global
    const analizando = useTiendaEstado((s) => s.analizando);
    const adnMarca = useTiendaEstado((s) => s.adnMarca);
    const mensajeExito = useTiendaEstado((s) => s.mensajeExito);

    // Prioridad: Prop manual > Estado global
    const isGenerating = propIsGenerating || analizando;

    const scrollRef = useRef<HTMLDivElement>(null);

    // ═══════════════════════════════════════════════════════════════
    // FÍSICAS DE PANTALLA & EFECTOS
    // ═══════════════════════════════════════════════════════════════

    const { scrollYProgress } = useScroll({ container: scrollRef });

    const smoothScroll = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const reflectionY = useTransform(smoothScroll, [0, 1], ["-10%", "30%"]);
    const contentScale = useTransform(smoothScroll, [0.95, 1], [1, 0.99]);
    const contentY = useTransform(smoothScroll, [0.95, 1], ["0%", "-1%"]);

    // Estilo de fondo dinámico basado en ADN para Desktop
    const fondoDinamicoEstilo = adnMarca?.paletaColores ? {
        background: `radial-gradient(circle at 50% 50%, ${adnMarca.paletaColores.primario}15 0%, ${adnMarca.paletaColores.fondo} 100%)`
    } : {};

    return (
        // CONTENEDOR MAESTRO CON FONDO DINÁMICO (Desktop)
        <div
            className={`relative min-h-screen w-full flex items-center justify-center transition-colors duration-1000 ${isPublicView ? 'bg-[#050505]' : ''}`}
            style={isPublicView ? fondoDinamicoEstilo : {}}
        >
            {/* Si es vista pública, añadir un aura de luz en el fondo */}
            {isPublicView && adnMarca?.paletaColores && (
                <div
                    className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 blur-[120px]"
                    style={{
                        background: `radial-gradient(circle at 20% 30%, ${adnMarca.paletaColores.primario} 0%, transparent 50%), 
                                     radial-gradient(circle at 80% 70%, ${adnMarca.paletaColores.secundario} 0%, transparent 50%)`
                    }}
                />
            )}

            {/* CONTENEDOR 3D DEL SMARTPHONE (Responsive) */}
            {/* La clase 'is-public-view' se usará para aplicar el comportamiento responsive en Tailwind */}
            <div className={`
                relative z-10 select-none transition-all duration-700
                ${isPublicView
                    ? 'w-full h-screen sm:max-w-[380px] sm:h-[800px] sm:perspective-1000'
                    : 'w-full max-w-[380px] h-[800px] perspective-1000'}
            `}>

                {/* 1. SOMBRA DE BASE (Solo en desktop/mockup visible) */}
                <div className="hidden sm:block absolute -bottom-10 left-1/2 -translate-x-1/2 w-[85%] h-14 bg-black/50 blur-[40px] rounded-[100%] pointer-events-none transition-all duration-700" />

                {/* 2. CHASIS DE TITANIO (Se oculta en móvil si es vista pública) */}
                <div
                    className={`
                        relative h-full w-full transition-all duration-500 transform-gpu
                        ${isPublicView
                            ? 'bg-transparent sm:bg-black sm:rounded-[3.5rem] sm:p-[12px] sm:shadow-2xl sm:ring-1 sm:ring-white/10 sm:overflow-hidden'
                            : 'bg-black rounded-[3.5rem] p-[12px] shadow-2xl ring-1 ring-white/10 overflow-hidden'}
                    `}
                    style={(!isPublicView || (typeof window !== 'undefined' && window.innerWidth >= 640)) ? {
                        backgroundImage: "linear-gradient(145deg, #1e293b, #0f172a, #000000)",
                        boxShadow: "inset 0 0 4px 1px rgba(255,255,255,0.1), -20px 20px 60px rgba(0,0,0,0.6)"
                    } : {}}
                >
                    {/* 3. BISEL INTERNO */}
                    <div className={`absolute inset-[4px] bg-black pointer-events-none z-0 ${isPublicView ? 'hidden sm:block sm:rounded-[3.2rem]' : 'rounded-[3.2rem]'}`} />

                    {/* 4. VIEWPORT */}
                    <div className={`
                        relative h-full w-full bg-white dark:bg-[#050505] overflow-hidden z-10 isolate mask-image-gradient transition-all
                        ${isPublicView
                            ? 'rounded-0 sm:rounded-[2.8rem]'
                            : 'rounded-[2.8rem]'}
                    `}>

                        {/* SCROLL CONTAINER */}
                        {/* touch-action: pan-y para evitar bloqueos en móvil real */}
                        <div
                            ref={scrollRef}
                            className="h-full w-full overflow-y-auto no-scrollbar scroll-smooth touch-pan-y overscroll-y-contain"
                        >
                            {/* WRAPPER DEL CONTENIDO (Aplica las deformaciones físicas) */}
                            <motion.div
                                style={{ scale: contentScale, y: contentY }}
                                className="min-h-full pb-24 pt-16 px-0 origin-bottom" // Safe Area: Top (Island) + Bottom (Home Indicator)
                            >
                                {children}
                            </motion.div>
                        </div>

                        {/* 5. CAPAS DE CRISTAL & REFLEJOS (Overlay) */}

                        {/* A. Reflejo Especular Dinámico (Parallax) */}
                        <motion.div
                            style={{ y: reflectionY }}
                            className="absolute inset-0 pointer-events-none z-40 opacity-20 mix-blend-screen"
                        >
                            {/* Gradiente diagonal difuso que cruza la pantalla */}
                            <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-transparent via-white/15 to-transparent transform rotate-12 blur-2xl" />
                        </motion.div>

                        {/* B. Brillo Estático de Borde (Glass Edge Gloss) */}
                        <div className="absolute inset-0 rounded-[2.8rem] ring-1 ring-inset ring-white/5 pointer-events-none z-50" />

                        {/* 6. DYNAMIC ISLAND (Cápsula de Inteligencia) */}
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[60] flex justify-center w-full pointer-events-none">
                            <motion.div
                                layout
                                initial={false}
                                animate={mensajeExito ? "success" : (isGenerating ? "generating" : "idle")}
                                variants={{
                                    idle: {
                                        width: "7.5rem",
                                        height: "1.75rem",
                                        borderRadius: "50px",
                                        y: 0,
                                        borderColor: "rgba(255,255,255,0.1)",
                                        boxShadow: "0 0 0 0 rgba(74, 222, 128, 0)"
                                    },
                                    generating: {
                                        width: "13rem",
                                        height: "3.5rem",
                                        borderRadius: "1.2rem",
                                        y: 4,
                                        borderColor: "rgba(74, 222, 128, 0.3)",
                                        boxShadow: "0 0 20px -5px rgba(74, 222, 128, 0.3)"
                                    },
                                    success: {
                                        width: "14rem",
                                        height: "3.5rem",
                                        borderRadius: "1.2rem",
                                        y: 4,
                                        borderColor: "rgba(34, 197, 94, 0.5)",
                                        backgroundColor: "rgba(20, 83, 45, 0.9)",
                                        boxShadow: "0 0 30px -5px rgba(34, 197, 94, 0.4)"
                                    }
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 30,
                                    mass: 0.8
                                }}
                                className="bg-black flex items-center justify-center overflow-hidden border backdrop-blur-md pointer-events-auto"
                            >
                                <AnimatePresence mode="wait">
                                    {mensajeExito ? (
                                        <motion.div
                                            key="success"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="flex items-center gap-2.5 px-4"
                                        >
                                            <CheckCircle2 className="w-4 h-4 text-white" />
                                            <span className="text-[11px] font-bold text-white tracking-tight">
                                                {mensajeExito}
                                            </span>
                                        </motion.div>
                                    ) : isGenerating ? (
                                        <motion.div
                                            key="gen"
                                            initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="flex items-center gap-2.5 px-1"
                                        >
                                            <Sparkles className="w-4 h-4 text-emerald-400 animate-[pulse_2s_infinite]" />
                                            <span className="text-[11px] font-semibold text-emerald-50/90 font-mono tracking-tight whitespace-nowrap">
                                                Analizando Fachada...
                                            </span>
                                        </motion.div>
                                    ) : (
                                        <motion.div key="idle" className="w-full h-full" />
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </div>

                        {/* 7. HOME INDICATOR (Barra de Gestos) */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-36 h-1.5 bg-white/40 rounded-full z-50 backdrop-blur-md shadow-sm" />
                    </div>
                </div>
            </div>
        </div>
    );
};
