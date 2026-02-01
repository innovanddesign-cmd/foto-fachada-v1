"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn } from "lucide-react";

interface GaleriaMasonryProps {
    keywords: string[];
    colores: {
        acento: string;
    };
}

export const GaleriaMasonry = ({ keywords, colores }: GaleriaMasonryProps) => {
    // Generar URLs de Unsplash basadas en keywords
    // Usamos 'featured' y timestamps distintos para evitar caché y duplicados
    const imagenes = [
        { id: 1, height: "h-64", keyword: keywords[0] || "architecture" },
        { id: 2, height: "h-48", keyword: keywords[1] || "design" },
        { id: 3, height: "h-80", keyword: keywords[0] || "style" },
        { id: 4, height: "h-56", keyword: keywords[2] || "modern" },
        { id: 5, height: "h-72", keyword: keywords[1] || "interior" },
        { id: 6, height: "h-64", keyword: keywords[0] || "detail" },
    ].map(img => ({
        ...img,
        url: `https://images.unsplash.com/photo-${img.id}?auto=format&fit=crop&w=800&q=80` // Fallback placeholder logic would go here in real Unsplash API usage
        // For simplicity in this demo, we'll use the source.unsplash format requested or similar reliable placement
        // Actually, source.unsplash is deprecated/unreliable occasionally. Let's use a reliable placeholder pattern or the requested format.
        // User requested: https://source.unsplash.com/featured/?{keyword}
    }));

    // Fix: source.unsplash.com often redirects. To simulate diverse images we append a random sig or ID if possible, 
    // but the user explicitly requested source.unsplash.com/featured/?{keyword}.
    // We will follow instructions but add a random seed to ensure variety.

    const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);

    return (
        <section className="w-full px-4 py-16">
            <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl font-bold text-white mb-8 px-2 tracking-tight"
            >
                Galería Visual
            </motion.h3>

            <div className="columns-2 gap-4 space-y-4">
                {imagenes.map((img, index) => (
                    <motion.div
                        key={img.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative w-full ${img.height} rounded-2xl overflow-hidden cursor-pointer group break-inside-avoid`}
                        style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                        onClick={() => setImagenSeleccionada(`https://source.unsplash.com/featured/?${img.keyword}&sig=${img.id}`)}
                    >
                        <img
                            src={`https://source.unsplash.com/featured/?${img.keyword}&sig=${img.id}`}
                            alt={img.keyword}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                        />

                        {/* Overlay Hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="bg-white/10 backdrop-blur-md p-3 rounded-full">
                                <ZoomIn className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal de Cristal */}
            <AnimatePresence>
                {imagenSeleccionada && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setImagenSeleccionada(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-sm w-full bg-white/10 backdrop-blur-2xl rounded-3xl p-2 border border-white/20 shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setImagenSeleccionada(null)}
                                className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <img
                                src={imagenSeleccionada}
                                alt="Full screen"
                                className="w-full h-auto rounded-2xl"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};
