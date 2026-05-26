"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import { Maximize2, X } from 'lucide-react';

/**
 * Componente: GaleriaMasonry.tsx
 * Rejilla asimétrica que muestra el alma visual del negocio.
 * Integra activos del usuario y stock inteligente de Unsplash.
 */
export const GaleriaMasonry = () => {
    const galeriaActivos = useTiendaEstado((s) => s.galeriaActivos);
    const adn = useTiendaEstado((s) => s.adnMarca);
    const [selectedImg, setSelectedImg] = useState<string | null>(null);

    // Lógica de composición de imágenes
    const imagenes = useMemo(() => {
        const delUsuario = galeriaActivos.map(a => a.url);

        // Si hay pocas imágenes, inyectar placeholders premium de Unsplash
        if (delUsuario.length < 6) {
            const keywords = adn?.analisisVision?.categoriaSugerida || "modern business";
            const stock = [
                `https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800&sig=1`,
                `https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800&sig=2`,
                `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800&sig=3`,
                `https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800&sig=4`,
                `https://images.unsplash.com/photo-1559925393-8be0ec41b50b?auto=format&fit=crop&q=80&w=800&sig=5`,
            ];
            return [...delUsuario, ...stock].slice(0, 8);
        }
        return delUsuario;
    }, [galeriaActivos, adn]);

    return (
        <div className="w-full h-full p-6 flex flex-col gap-6 overflow-hidden">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <span className="text-[var(--color-primario)] text-[10px] font-black uppercase tracking-widest">Visual DNA</span>
                    <h2 className="text-2xl font-bold text-white tracking-tighter">Nuestro Espacio</h2>
                </div>
            </div>

            {/* Grid Masonry (Simulado con columns de CSS) */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                <div className="columns-2 gap-3 space-y-3">
                    {imagenes.map((url, idx) => (
                        <motion.div
                            key={url + idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            className="relative group cursor-zoom-in break-inside-avoid"
                            onClick={() => setSelectedImg(url)}
                        >
                            <img
                                src={url}
                                alt={`Activo ${idx}`}
                                className="w-full h-auto rounded-[2rem] border border-white/10 group-hover:brightness-110 transition-all duration-500"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] flex items-center justify-center">
                                <Maximize2 className="text-white w-6 h-6" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Lightbox con Backdrop Blur Profundo */}
            <AnimatePresence>
                {selectedImg && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[40px]"
                        onClick={() => setSelectedImg(null)}
                    >
                        <motion.button
                            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
                            whileTap={{ scale: 0.9 }}
                        >
                            <X size={32} />
                        </motion.button>

                        <motion.img
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            src={selectedImg}
                            alt="Vista Ampliada"
                            className="max-w-full max-h-[80vh] rounded-[2.5rem] shadow-2xl border border-white/20 object-contain"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
