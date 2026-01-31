import { useStorefrontStore } from "@/store/useStorefront";
import { GlassCard } from "@/components/ui/GlassCard";
import { PosterRender } from "@/components/generative/PosterRender";
import { ArrowRight, Download, Printer, Share2 } from "lucide-react";
import { motion } from "framer-motion";

export function SignageStep() {
    const { storefrontData, brandDNA, setStep } = useStorefrontStore();

    if (!storefrontData || !brandDNA) return null;

    return (
        <div className="flex flex-col lg:flex-row items-center gap-8 w-full max-w-6xl">
            <div className="flex-1 space-y-8 order-2 lg:order-1 text-center lg:text-left text-white">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h2 className="text-4xl font-bold mb-4">Cartelería Lista para Imprenta</h2>
                    <p className="text-xl text-white/60 mb-8">
                        Generamos automáticamente un diseño de alta resolución (300 DPI) coordinado con tu escaparte digital.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <GlassCard className="p-4 flex items-center gap-4 hover:bg-white/10" interactive>
                            <Download className="w-8 h-8 text-pink-400" />
                            <div className="text-left">
                                <div className="font-bold">PDF Vectorial</div>
                                <div className="text-xs text-white/50">Para impresión gran formato</div>
                            </div>
                        </GlassCard>
                        <GlassCard className="p-4 flex items-center gap-4 hover:bg-white/10" interactive>
                            <Share2 className="w-8 h-8 text-cyan-400" />
                            <div className="text-left">
                                <div className="font-bold">Redes Sociales</div>
                                <div className="text-xs text-white/50">Pack de Stories/Post</div>
                            </div>
                        </GlassCard>
                    </div>

                    <button
                        onClick={() => setStep("CONFIG")}
                        className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        Configurar Lanzamiento <ArrowRight className="w-5 h-5" />
                    </button>
                </motion.div>
            </div>

            <div className="relative order-1 lg:order-2">
                {/* Paper Mockup Effect */}
                <motion.div
                    className="relative w-[350px] aspect-[1/1.414] bg-white shadow-2xl rotate-[-2deg] hover:rotate-0 transition-transform duration-500"
                    initial={{ opacity: 0, y: 50, rotate: 5 }}
                    animate={{ opacity: 1, y: 0, rotate: -2 }}
                >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-800 rounded-full z-20 shadow-sm" />
                    <PosterRender data={storefrontData} dna={brandDNA} />
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/20 pointer-events-none mix-blend-overlay" />
                </motion.div>
            </div>
        </div>
    );
}
