import { useStorefrontStore } from "@/store/useStorefront";
import { motion } from "framer-motion";
import { Scan, Sparkles, Palette } from "lucide-react";
import { useEffect, useState } from "react";
import { GlassCard } from "../ui/GlassCard";

export function AnalysisStep() {
    const { uploadedImage } = useStorefrontStore();
    const [status, setStatus] = useState("Escaneando arquitectura...");

    useEffect(() => {
        const timers = [
            setTimeout(() => setStatus("Identificando estructura comercial..."), 1000),
            setTimeout(() => setStatus("Extrayendo paleta de colores..."), 2000),
            setTimeout(() => setStatus("Generando identidad visual..."), 2800),
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-2xl text-center space-y-8">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto">
                {/* Scanning Image Container */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
                    {uploadedImage && (
                        <img
                            src={uploadedImage}
                            alt="Fachada"
                            className="w-full h-full object-cover filter brightness-50"
                        />
                    )}

                    {/* Scanning Line */}
                    <motion.div
                        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.8)] z-10"
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                    />

                    {/* Grid Overlay */}
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                </div>

                {/* Floating Icons */}
                <motion.div
                    className="absolute -right-8 -top-8 p-3 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <Scan className="w-6 h-6 text-cyan-400" />
                </motion.div>

                <motion.div
                    className="absolute -left-8 bottom-8 p-3 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                >
                    <Palette className="w-6 h-6 text-pink-400" />
                </motion.div>
            </div>

            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                    Analizando Fachada v2.0
                </h2>
                <p className="text-white/60 text-lg font-light tracking-wide">
                    {status}
                </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-sm h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-pink-500"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3.5, ease: "easeInOut" }}
                />
            </div>
        </div>
    );
}
