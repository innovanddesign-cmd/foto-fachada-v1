"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Scan, Sparkles, Activity, Fingerprint } from "lucide-react";

export const EscaneoProgresivo = () => {
    const [statusText, setStatusText] = useState("Iniciando escáner cuántico...");
    const [progress, setProgress] = useState(0);

    // Sequence of Spanish status messages
    const messages = [
        "Iniciando escáner cuántico...",
        "Calibrando sensores ópticos...",
        "Identificando paleta cromática...",
        "Extrayendo ADN de marca...",
        "Decodificando estilo visual...",
        "Configurando estructura óptima...",
        "Finalizando síntesis..."
    ];

    useEffect(() => {
        let currentIndex = 0;
        const interval = setInterval(() => {
            currentIndex = (currentIndex + 1) % messages.length;
            setStatusText(messages[currentIndex]);
            // Simulated progress for visual feedback
            setProgress((prev) => Math.min(prev + 15, 100));
        }, 800);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full max-w-md mx-auto aspect-[3/4] overflow-hidden rounded-[48px] border border-white/20 bg-black/40 backdrop-blur-[40px] shadow-[0_48px_96px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center p-8">

            {/* Background Gradients */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-purple-500/10 to-pink-500/10" />

            {/* Scanning Laser Line */}
            <motion.div
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.8)] z-20"
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 3, ease: "linear", repeat: Infinity }}
            />

            {/* Central Icon / Animation */}
            <div className="relative z-10 mb-8 p-6 rounded-full bg-white/5 border border-white/10 shadow-glass-lg">
                <Scan className="w-16 h-16 text-cyan-300 animate-pulse" />
                <motion.div
                    className="absolute inset-0 rounded-full border border-cyan-400/30"
                    animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                />
            </div>

            {/* Dynamic Status Text */}
            <motion.div
                key={statusText}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative z-10 text-center"
            >
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 to-purple-200 mb-2">
                    {statusText}
                </h3>
                <div className="h-1 w-32 mx-auto bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-cyan-400"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                    />
                </div>
            </motion.div>

            {/* Meta Data Overlay Simulation */}
            <div className="absolute top-8 left-8 text-[10px] sm:text-xs font-mono text-cyan-400/60 flex flex-col gap-1">
                <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> CPU: OPTIMAL</span>
                <span className="flex items-center gap-1"><Fingerprint className="w-3 h-3" /> ID: 8X-929</span>
            </div>

            {/* Bottom Glow */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cyan-900/40 to-transparent pointer-events-none" />
        </div>
    );
};
