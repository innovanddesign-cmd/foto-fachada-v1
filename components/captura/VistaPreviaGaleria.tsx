'use client';

/**
 * FOTO FACHADA V2 — Vista Previa de Galería
 * Grid de Cards flotantes con estética Apple 2026.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import { ImageIcon, FileText, CheckCircle2 } from 'lucide-react';

export default function VistaPreviaGaleria() {
    const galeria = useTiendaEstado((s) => s.galeriaActivos);

    if (galeria.length === 0) return null;

    return (
        <section className="w-full max-w-5xl mx-auto py-12 px-4 border-t border-white/5 mt-10">
            <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] mb-8 text-center">
                ACTIVOS ASIMILADOS
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                <AnimatePresence mode='popLayout'>
                    {galeria.map((activo, index) => (
                        <motion.div
                            key={activo.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 25,
                                delay: index * 0.05
                            }}
                            className="group relative"
                        >
                            <div className="
                                relative aspect-[4/5] rounded-3xl overflow-hidden
                                border border-white/10 bg-white/[0.02]
                                backdrop-blur-md shadow-lg
                                group-hover:border-white/20 transition-all duration-500
                                group-hover:-translate-y-2
                            ">
                                {/* Imagen de fondo o Icono */}
                                {activo.tipo === 'FACHADA' || activo.nombreArchivo.match(/\.(jpg|jpeg|png|webp|svg)$/i) ? (
                                    <div className="absolute inset-0">
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/20 to-black/80 z-10" />
                                        <img
                                            src={activo.url}
                                            alt={activo.nombreArchivo}
                                            className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                                        />
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                                        <FileText className="w-10 h-10 text-white/10" />
                                    </div>
                                )}

                                {/* Badge Superior */}
                                <div className="absolute top-3 left-3 z-20">
                                    <div className={`
                                        px-2 py-1 rounded-full text-[8px] font-bold tracking-widest uppercase
                                        backdrop-blur-md border border-white/20
                                        ${activo.tipo === 'FACHADA' ? 'bg-blue-500/20 text-blue-300' :
                                            activo.tipo === 'LOGO' ? 'bg-purple-500/20 text-purple-300' :
                                                'bg-white/10 text-white/50'}
                                    `}>
                                        {activo.tipo}
                                    </div>
                                </div>

                                {/* Checklist de éxito */}
                                <div className="absolute bottom-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CheckCircle2 className="w-5 h-5 text-green-400 shadow-xl" />
                                </div>

                                {/* Info Inferior */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 z-20 translate-y-2 group-hover:translate-y-0 transition-transform">
                                    <p className="text-[10px] font-medium text-white/80 truncate mb-1">
                                        {activo.nombreArchivo}
                                    </p>
                                    <p className="text-[8px] font-bold text-white/30 uppercase tracking-tighter">
                                        {(activo.tamanoBytes / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </section>
    );
}
