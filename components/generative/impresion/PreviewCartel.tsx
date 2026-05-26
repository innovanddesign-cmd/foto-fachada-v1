"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GeneradorCartel } from './GeneradorCartel';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import { Download, Printer, Share2, Check } from 'lucide-react';
import html2canvas from 'html2canvas';

/**
 * PreviewCartel.tsx
 * Muestra el cartel dentro de un contexto de diseño industrial (Metacrilato/3D).
 * Exportación real: PNG alta resolución + Impresión directa.
 */
export const PreviewCartel = () => {
    const adn = useTiendaEstado((s) => s.adnMarca);
    const [exportando, setExportando] = useState(false);
    const [exportado, setExportado] = useState(false);

    const handleExportPNG = async () => {
        const poster = document.getElementById('poster-container');
        if (!poster) return;

        setExportando(true);
        try {
            const canvas = await html2canvas(poster, {
                scale: 3,
                useCORS: true,
                backgroundColor: null,
                logging: false,
            });

            const link = document.createElement('a');
            const nombre = adn?.analisisVision?.nombreSugerido || 'negocio';
            link.download = `cartel-${nombre.toLowerCase().replace(/\s+/g, '-')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            setExportado(true);
            setTimeout(() => setExportado(false), 3000);
        } catch (err) {
            console.error("Error exportando cartel:", err);
        } finally {
            setExportando(false);
        }
    };

    const handlePrint = async () => {
        const poster = document.getElementById('poster-container');
        if (!poster) return;

        try {
            const canvas = await html2canvas(poster, {
                scale: 3,
                useCORS: true,
                backgroundColor: null,
                logging: false,
            });

            const ventana = window.open('', '_blank');
            if (!ventana) return;

            ventana.document.write(`
                <!DOCTYPE html>
                <html>
                <head><title>Cartel - ${adn?.analisisVision?.nombreSugerido || 'Foto Fachada'}</title>
                <style>
                    @page { size: A4; margin: 0; }
                    body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: white; }
                    img { max-width: 100%; max-height: 100vh; object-fit: contain; }
                </style></head>
                <body><img src="${canvas.toDataURL('image/png')}" /></body>
                </html>
            `);
            ventana.document.close();
            ventana.onload = () => {
                ventana.print();
            };
        } catch (err) {
            console.error("Error imprimiendo:", err);
        }
    };

    const handleShare = async () => {
        const poster = document.getElementById('poster-container');
        if (!poster || !navigator.share) return;

        try {
            const canvas = await html2canvas(poster, { scale: 2, useCORS: true, backgroundColor: null, logging: false });
            canvas.toBlob(async (blob) => {
                if (!blob) return;
                const file = new File([blob], 'cartel.png', { type: 'image/png' });
                await navigator.share({
                    title: `Cartel de ${adn?.analisisVision?.nombreSugerido || 'Mi Negocio'}`,
                    files: [file],
                });
            }, 'image/png');
        } catch (err) {
            // El usuario canceló o no hay soporte
        }
    };

    if (!adn) return null;

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-[#050505] overflow-hidden">

            {/* Escena 3D del Cartel */}
            <div className="relative perspective-2000 py-10 scale-[0.6] sm:scale-[0.8] md:scale-100 origin-center">
                <motion.div
                    initial={{ rotateY: -15, rotateX: 5, y: 20, opacity: 0 }}
                    animate={{ rotateY: 0, rotateX: 0, y: 0, opacity: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="relative p-3 rounded-[3rem] bg-white/5 backdrop-blur-3xl border border-white/20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]"
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Tornillos */}
                    <div className="absolute top-6 left-6 w-4 h-4 rounded-full bg-zinc-700 border border-white/20 shadow-inner" />
                    <div className="absolute top-6 right-6 w-4 h-4 rounded-full bg-zinc-700 border border-white/20 shadow-inner" />
                    <div className="absolute bottom-6 left-6 w-4 h-4 rounded-full bg-zinc-700 border border-white/20 shadow-inner" />
                    <div className="absolute bottom-6 right-6 w-4 h-4 rounded-full bg-zinc-700 border border-white/20 shadow-inner" />

                    <div className="rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <GeneradorCartel />
                    </div>

                    {/* Reflejo de cristal */}
                    <div className="absolute inset-0 rounded-[3rem] pointer-events-none overflow-hidden">
                        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br from-white/10 via-transparent to-transparent rotate-12" />
                    </div>
                </motion.div>

                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-10 bg-black/60 blur-3xl rounded-[100%]" />
            </div>

            {/* Panel de Acciones */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex gap-4 mt-8"
            >
                <button
                    type="button"
                    onClick={handleExportPNG}
                    disabled={exportando}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform disabled:opacity-50"
                >
                    {exportado ? <Check size={18} className="text-emerald-600" /> : <Download size={18} />}
                    <span>{exportando ? 'Exportando...' : exportado ? 'Descargado' : 'Guardar PNG'}</span>
                </button>
                <button
                    type="button"
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-6 py-3 bg-zinc-800 text-white font-bold rounded-full border border-white/10 hover:bg-zinc-700 transition-colors"
                >
                    <Printer size={18} />
                    <span className="hidden sm:inline">Imprimir</span>
                </button>
                {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                    <button
                        type="button"
                        aria-label="Compartir cartel"
                        onClick={handleShare}
                        className="flex items-center gap-2 px-6 py-3 bg-zinc-800 text-white font-bold rounded-full border border-white/10 hover:bg-zinc-700 transition-colors"
                    >
                        <Share2 size={18} />
                    </button>
                )}
            </motion.div>

            <p className="mt-6 text-white/30 text-[10px] font-mono tracking-widest uppercase">
                Renderizado de precisión A4 • 300 DPI Ready • QR con Tracking
            </p>
        </div>
    );
};
