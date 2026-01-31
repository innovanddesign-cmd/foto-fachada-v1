import { useStorefrontStore } from "@/store/useStorefront";
import { SmartphoneMockup } from "../ui/SmartphoneMockup";
import { StorefrontRender } from "../generative/StorefrontRender";
import { RefreshCw, ArrowRight, Download } from "lucide-react";
import { motion } from "framer-motion";
import { AIService } from "@/services/ai";
import { useState } from "react";

export function ShowcaseStep() {
    const { storefrontData, brandDNA, setStep, regenerateStorefront, reset } = useStorefrontStore();
    const [isRegenerating, setIsRegenerating] = useState(false);

    if (!storefrontData || !brandDNA) {
        // Fallback if accessed directly (should handle better in prod)
        return <div onClick={reset}>Error de estado. Click para reiniciar.</div>;
    }

    const handleRegenerate = async () => {
        setIsRegenerating(true);
        // Simulate new data
        const newData = await AIService.generateStorefront(brandDNA);
        regenerateStorefront({
            ...newData,
            heroHeadline: "Nueva Colección 2026", // Just to show change
            layout: "hero-center"
        });
        setIsRegenerating(false);
    };

    const handleNext = () => {
        setStep("SIGNAGE");
    };

    return (
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 w-full max-w-6xl">

            {/* Visual Canvas (Phone) */}
            <div className="relative group">
                <SmartphoneMockup className="scale-90 sm:scale-100 transition-transform duration-500">
                    {isRegenerating ? (
                        <div className="w-full h-full flex items-center justify-center bg-white">
                            <RefreshCw className="animate-spin text-gray-400 w-8 h-8" />
                        </div>
                    ) : (
                        <StorefrontRender data={storefrontData} dna={brandDNA} />
                    )}
                </SmartphoneMockup>

                {/* Floating Actions for Preview */}
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4">
                    <button
                        onClick={handleRegenerate}
                        className="p-4 rounded-full bg-white text-black shadow-lg hover:bg-gray-100 transition-all hover:rotate-180"
                        title="Regenerar Diseño"
                    >
                        <RefreshCw className={isRegenerating ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Controller / Sidebar */}
            <div className="flex-1 space-y-8 text-center lg:text-left text-white">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-4xl font-bold mb-4">Tu Escaparate Digital</h2>
                    <p className="text-xl text-white/60 mb-8">
                        Diseñado exclusivamente para tu marca. La IA ha detectado un estilo
                        <span className="font-bold text-white"> {brandDNA.vibe}</span> y ha aplicado una paleta cromática optimizada.
                    </p>

                    <div className="flex flex-wrap gap-2 mb-8 justify-center lg:justify-start">
                        <span className="text-sm uppercase tracking-widest opacity-50 w-full mb-2">ADN DE MARCA DETECTADO</span>
                        {brandDNA.palette.map((color, i) => (
                            <div key={i} className="w-12 h-12 rounded-full border-2 border-white/20 shadow-lg" style={{ backgroundColor: color }} />
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <button
                            onClick={handleNext}
                            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            Continuar a Cartelería <ArrowRight className="w-5 h-5" />
                        </button>
                        <button
                            className="px-8 py-4 bg-white/10 backdrop-blur-md rounded-full font-bold hover:bg-white/20 transition-all border border-white/10"
                        >
                            Editar Manualmente
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
