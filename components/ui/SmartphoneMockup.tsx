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
import { Sparkles } from "lucide-react";
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
 */
export const SmartphoneMockup = ({ children, isGenerating: propIsGenerating = false }: SmartphoneMockupProps) => {

    // Conexión al Store Global para detectar estado de "Generando"
    const analizando = useTiendaEstado((s) => s.analizando);

    // Prioridad: Prop manual > Estado global (útil para storybook o dev)
    const isGenerating = propIsGenerating || analizando;

    // Referencia al contenedor de scroll para cálculos de física
    const scrollRef = useRef<HTMLDivElement>(null);

    // ═══════════════════════════════════════════════════════════════
    // FÍSICAS DE PANTALLA (Motion Physics)
    // ═══════════════════════════════════════════════════════════════

    // Hook nativo de scroll de Framer Motion
    const { scrollYProgress } = useScroll({ container: scrollRef });

    /**
     * Configuración de INERCIA (Rubber Banding).
     * stiffness: Rigidez del resorte (100 = rebote suave y firme de iOS).
     * damping: Amortiguación (30 = detención suave sin oscilación excesiva).
     * restDelta: Umbral para detener la animación (precisión sub-pixel).
     */
    const smoothScroll = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // ═══════════════════════════════════════════════════════════════
    // REVERBERACIÓN VISUAL (Efectos de Cristal)
    // ═══════════════════════════════════════════════════════════════

    /**
     * 1. REFLEJO DINÁMICO (Parallax de Luz)
     * Simula la luz de la habitación moviéndose sobre el cristal.
     * Mapeo: 0% scroll -> reflejo arriba (-10%), 100% scroll -> reflejo abajo (30%).
     * La luz se mueve MÁS LENTO que el contenido (efecto profundidad).
     */
    const reflectionY = useTransform(smoothScroll, [0, 1], ["-10%", "30%"]);

    /**
     * 2. RESPUESTA HÁPTICA VISUAL (Squash & Stretch)
     * Al llegar al final del scroll (95%-100%), el contenido se "aplasta" sutilmente.
     * scale: 1 -> 0.98
     */
    const contentScale = useTransform(smoothScroll, [0.95, 1], [1, 0.99]);

    /**
     * Pequeño desplazamiento 'y' para acompañar el squash.
     */
    const contentY = useTransform(smoothScroll, [0.95, 1], ["0%", "-1%"]);

    return (
        // CONTENEDOR 3D MAESTRO
        // perspective-1000: Crucial para sensación de profundidad
        <div className="relative mx-auto w-full max-w-[380px] h-[800px] z-10 group perspective-1000 select-none">

            {/* 1. SOMBRA DE BASE (Contacto con el suelo) */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[85%] h-14 bg-black/50 blur-[40px] rounded-[100%] pointer-events-none transition-all duration-700" />

            {/* 2. CHASIS DE TITANIO (Estructura Física) */}
            <div
                className="relative h-full w-full bg-black rounded-[3.5rem] p-[12px] shadow-2xl ring-1 ring-white/10 overflow-hidden transform-gpu"
                style={{
                    // Gradiente satindo estilo Titanium Black
                    backgroundImage: "linear-gradient(145deg, #1e293b, #0f172a, #000000)",
                    // Sombras volumétricas laterales
                    boxShadow: "inset 0 0 4px 1px rgba(255,255,255,0.1), -20px 20px 60px rgba(0,0,0,0.6)"
                }}
            >
                {/* 3. BISEL INTERNO (El "Marco Negro" de la pantalla) */}
                <div className="absolute inset-[4px] bg-black rounded-[3.2rem] pointer-events-none z-0" />

                {/* 4. VIEWPORT (Pantalla activa) */}
                <div className="relative h-full w-full bg-white dark:bg-[#050505] rounded-[2.8rem] overflow-hidden z-10 isolate mask-image-gradient">

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
                            animate={isGenerating ? "generating" : "idle"}
                            variants={{
                                idle: {
                                    width: "7.5rem",   // Reposo compacto
                                    height: "1.75rem",
                                    borderRadius: "50px",
                                    y: 0,
                                    borderColor: "rgba(255,255,255,0.1)",
                                    boxShadow: "0 0 0 0 rgba(74, 222, 128, 0)"
                                },
                                generating: {
                                    width: "13rem",    // Expandido para mensaje
                                    height: "3.5rem",
                                    borderRadius: "1.2rem",
                                    y: 4,
                                    borderColor: "rgba(74, 222, 128, 0.3)", // Borde verde esmeralda sutil
                                    boxShadow: "0 0 20px -5px rgba(74, 222, 128, 0.3)" // Glow de "pensando"
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
                                {isGenerating ? (
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
    );
};
