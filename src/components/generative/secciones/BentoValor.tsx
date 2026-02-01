"use client";

import { motion } from "framer-motion";
import { Check, Shield, Zap, Star, LayoutGrid, Award } from "lucide-react";
import { LucideIcon } from "lucide-react";

// Mapeo de iconos disponibles
const ICON_MAP: Record<string, LucideIcon> = {
    "shield": Shield,
    "zap": Zap,
    "star": Star,
    "grid": LayoutGrid,
    "award": Award,
    "check": Check
};

interface ItemValor {
    id: string;
    titulo: string;
    descripcion: string;
    icono: string; // key of ICON_MAP
    colSpan?: number; // 1, 2, or 3
}

interface BentoValorProps {
    elementos: ItemValor[];
    colores: {
        acento: string;
    };
}

const TarjetaCristal = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className={`relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 flex flex-col justify-start hover:bg-white/10 transition-colors ${className}`}
        style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.07)" }}
    >
        {children}
    </motion.div>
);

export const BentoValor = ({ elementos, colores }: BentoValorProps) => {
    return (
        <section className="w-full px-6 py-12 lg:py-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)] max-w-7xl mx-auto">
                {elementos.map((item, index) => {
                    const Icon = ICON_MAP[item.icono.toLowerCase()] || Star;
                    const colSpanClass = item.colSpan === 2 ? "md:col-span-2" : item.colSpan === 3 ? "md:col-span-3" : "md:col-span-1";

                    return (
                        <TarjetaCristal
                            key={item.id}
                            className={colSpanClass}
                            delay={index * 0.1}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div
                                    className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white"
                                    style={{ color: colores.acento, boxShadow: `0 0 20px -5px ${colores.acento}40` }}
                                >
                                    <Icon className="w-6 h-6" />
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                                {item.titulo}
                            </h3>

                            <p className="text-white/60 text-sm leading-relaxed">
                                {item.descripcion}
                            </p>

                            {/* Decoración de fondo sutil */}
                            <div
                                className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-2xl pointer-events-none"
                                style={{ background: colores.acento }}
                            />
                        </TarjetaCristal>
                    );
                })}
            </div>
        </section>
    );
};
