"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import { QRPersonalizado } from '@/components/ui/QRPersonalizado';
import { mmAPx, DIMENSIONES_A4, DIMENSIONES_A5, DIMENSIONES_SQUARE } from '@/lib/impresion/MotorDisenoImpresion';
import { Camera, MapPin, Instagram, Sparkles } from 'lucide-react';
import { FormatoPoster, CampanaCartel } from '@/lib/estado/tipos-estado';

interface Props {
    formato?: FormatoPoster;
    campana?: CampanaCartel;
    configVisual?: {
        fraseImpacto: string;
        mostrarIconos: boolean;
        filtroPapel: boolean;
    };
}

/**
 * GeneradorCartel.tsx
 * Versión 2.0 con Soporte Multi-formato (Smart Resizer)
 */
export const GeneradorCartel = ({
    formato = 'A4',
    campana,
    configVisual
}: Props) => {
    const adn = useTiendaEstado((s) => s.adnMarca);
    const imagenSubida = useTiendaEstado((s) => s.imagenSubida);
    const slug = useTiendaEstado((s) => s.slug);
    const redes = useTiendaEstado((s) => s.redesSociales);

    if (!adn || !imagenSubida) return null;

    const { paletaColores } = adn;
    const nombreNegocio = adn.analisisVision?.nombreSugerido || "Tu Negocio";
    const categoria = adn.analisisVision?.categoriaSugerida || "Servicio Premium";
    const fraseImpacto = configVisual?.fraseImpacto || adn.analisisMarketing?.split('.')[0] || "Descubre una nueva forma de vivir nuestra experiencia.";

    // Dimensiones dinámicas
    const dims = formato === 'A4' ? DIMENSIONES_A4 : formato === 'A5' ? DIMENSIONES_A5 : DIMENSIONES_SQUARE;
    const isSquare = formato === 'SQUARE';

    const posterStyle: React.CSSProperties = {
        width: `${mmAPx(dims.ANCHO_MM)}px`,
        height: `${mmAPx(dims.ALTO_MM)}px`,
        backgroundColor: paletaColores.fondo,
        padding: `${mmAPx(dims.MARGEN_SEGURIDAD_MM)}px`,
        position: 'relative',
        display: 'grid',
        gridTemplateRows: isSquare ? 'auto 1fr auto' : 'auto auto 1fr auto',
        gridTemplateColumns: isSquare ? '1fr 1fr' : '1fr',
        gap: `${mmAPx(5)}px`,
        color: 'white',
        fontFamily: "'Inter', sans-serif",
        overflow: 'hidden',
        boxShadow: '0 30px 60px -12px rgba(0,0,0,0.5)',
    };

    // URL de tracking QR: redirige a /t/[slug] que registra el escaneo y luego redirige a /v/[slug]
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://foto-fachada.app';
    const urlLanzamiento = `${baseUrl}/t/${slug || 'demo'}`;

    return (
        <div
            id="poster-container"
            style={posterStyle}
            className={`select-none transition-all duration-500 ${configVisual?.filtroPapel ? 'paper-texture' : ''}`}
        >
            {/* 1. CABECERA / BRANDING */}
            <header className={`flex flex-col items-center text-center ${isSquare ? 'col-span-2' : ''} pt-6 pb-4`}>
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-4 shadow-lg border border-white/20">
                    <span className="text-black font-black text-xl">FF</span>
                </div>
                <h1 className={`${isSquare ? 'text-4xl' : 'text-5xl'} font-black tracking-tighter uppercase italic leading-none mb-1`}>
                    {nombreNegocio}
                </h1>
                <div className="flex items-center gap-2">
                    <span
                        className="text-[var(--color-primario)] text-[8px] font-bold uppercase tracking-[0.4em] opacity-80"
                        style={{ color: paletaColores.primario }}
                    >
                        {categoria}
                    </span>
                    {campana && (
                        <div className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-[6px] font-bold text-white/50 uppercase tracking-widest">
                            {campana.estado}
                        </div>
                    )}
                </div>
            </header>

            {/* 2. ZONA HERO (Adaptable) */}
            <div className={`relative overflow-hidden rounded-[2rem] border border-white/10 shadow-inner ${isSquare ? 'h-full' : 'aspect-[4/3] mb-4'}`}>
                <img
                    src={imagenSubida.urlImagen}
                    alt="Fachada"
                    className="w-full h-full object-cover brightness-90 contrast-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {!isSquare && (
                    <div className="absolute bottom-4 left-6 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <Camera className="w-4 h-4 text-white/70" />
                        </div>
                        <span className="text-white/80 text-[8px] font-medium tracking-wide">FOTOGRAFÍA ORIGINAL VERIFICADA</span>
                    </div>
                )}
            </div>

            {/* 3. CUERPO: COPY & QR */}
            <main className={`flex flex-col items-center justify-center text-center px-4 ${isSquare ? 'gap-6' : 'gap-8'}`}>
                <p className={`${isSquare ? 'text-lg' : 'text-xl'} font-medium leading-tight text-white/90 italic max-w-[90%]`}>
                    "{fraseImpacto}"
                </p>

                <div className="flex flex-col items-center gap-4">
                    <div className="p-3 bg-white rounded-[2rem] shadow-2xl relative">
                        <QRPersonalizado
                            url={urlLanzamiento}
                            color={paletaColores.primario}
                            size={isSquare ? 150 : 180}
                            logo="FF"
                        />
                        <div
                            className="absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-lg animate-bounce"
                            style={{ backgroundColor: paletaColores.acento }}
                        >
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </div>
            </main>

            {/* 4. FOOTER */}
            <footer className={`flex justify-between items-center text-[8px] text-white/30 font-mono tracking-widest uppercase py-4 border-t border-white/5 ${isSquare ? 'col-span-2' : ''}`}>
                <div className="flex items-center gap-2">
                    <MapPin className="w-2 h-2" />
                    <span>Ubicación detectada</span>
                </div>
                <div className="flex items-center gap-2">
                    <Instagram className="w-2 h-2" />
                    <span>@{redes.instagram || 'negocio.local'}</span>
                </div>
            </footer>

            {/* Branding del Motor */}
            <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 text-[6px] text-white/10 font-black tracking-[0.5em] ${isSquare ? 'col-span-2' : ''}`}>
                ANTIGRAVITY PRINT ENGINE 2026
            </div>

            <style jsx>{`
                .paper-texture::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background-image: url("https://www.transparenttextures.com/patterns/paper-fibers.png");
                    opacity: 0.15;
                    pointer-events: none;
                    z-index: 10;
                }
            `}</style>
        </div>
    );
};
