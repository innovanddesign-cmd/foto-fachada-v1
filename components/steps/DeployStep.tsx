import { useStorefrontStore } from "@/store/useStorefront";
import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowRight, Check, Copy, ExternalLink, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useEffect } from "react";

export function DeployStep() {
    const { brandDNA } = useStorefrontStore();

    useEffect(() => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    const generatedUrl = "fotofachada.app/tienda/demo-2026";

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-2xl text-center space-y-8">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.5)]"
            >
                <Check className="w-16 h-16 text-white" />
            </motion.div>

            <div className="space-y-4">
                <h1 className="text-5xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
                    ¡Despliegue Exitoso!
                </h1>
                <p className="text-xl text-white/60">
                    Tu escaparate digital está activo y listo para recibir clientes.
                </p>
            </div>

            <GlassCard className="w-full p-2 pl-6 flex items-center justify-between bg-black/40 border-green-500/30">
                <span className="text-lg font-mono text-green-400">{generatedUrl}</span>
                <div className="flex gap-2">
                    <button className="p-3 hover:bg-white/10 rounded-lg transition-colors text-white" title="Copiar URL">
                        <Copy className="w-5 h-5" />
                    </button>
                    <a
                        href="#"
                        className="p-3 bg-green-600 hover:bg-green-500 rounded-lg transition-colors text-white flex items-center gap-2 font-bold"
                    >
                        Abrir <ExternalLink className="w-5 h-5" />
                    </a>
                </div>
            </GlassCard>

            <div className="grid grid-cols-2 gap-4 w-full">
                <button className="py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all">
                    Descargar Kit de Prensa
                </button>
                <button className="py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all">
                    Ir al Dashboard
                </button>
            </div>
        </div>
    );
}
