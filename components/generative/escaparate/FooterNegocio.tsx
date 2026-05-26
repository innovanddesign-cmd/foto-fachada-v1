"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import { MapPin, Clock, Instagram, Twitter, Facebook } from 'lucide-react';

/**
 * Componente: FooterNegocio.tsx
 * Cierre de la experiencia visual con información de contacto y ubicación.
 */
export const FooterNegocio = () => {
    const adn = useTiendaEstado((s) => s.adnMarca);
    const redes = useTiendaEstado((s) => s.redesSociales);
    const datosEscaparate = useTiendaEstado((s) => s.datosEscaparate);
    const nombreNegocio = adn?.analisisVision?.nombreSugerido || "Tu Negocio";
    const categoria = adn?.analisisVision?.categoriaSugerida || "Servicios";
    const telefono = (datosEscaparate?.datosReales?.telefono || "").replace(/\s/g, "");
    const horario = datosEscaparate?.datosReales?.horario || datosEscaparate?.datosSugeridos?.horario || "Lunes - Sábado: 09:00 - 20:00";

    return (
        <footer className="w-full bg-[#0a0a0a] pt-16 pb-12 px-8 border-t border-white/5">
            <div className="flex flex-col gap-10">

                {/* Branding en Negativo */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                            <span className="text-black font-black text-xs">FF</span>
                        </div>
                        <span className="text-white font-black text-xl tracking-tighter uppercase italic">
                            {nombreNegocio}
                        </span>
                    </div>
                    <p className="text-white/30 text-xs max-w-[200px]">
                        {categoria} • Identidad impulsada por Inteligencia Artificial Aero-Glass 2026.
                    </p>
                </div>

                {/* Mapa Simulado (Night Mode) */}
                <div className="relative w-full h-40 rounded-[2rem] overflow-hidden border border-white/10 group">
                    <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                        <MapPin className="text-white/20 w-8 h-8 group-hover:scale-110 transition-transform" />
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                            <span className="text-white/60 text-[10px] font-bold">Ver en Google Maps</span>
                        </div>
                    </div>
                </div>

                {/* Info de Contacto & Horarios */}
                <div className="grid grid-cols-1 gap-6">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                            <Clock className="w-4 h-4 text-white/40" />
                        </div>
                        <div>
                            <span className="block text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Horario</span>
                            <span className="block text-white/40 text-xs">{horario}</span>
                        </div>
                    </div>
                </div>

                {/* Redes Sociales & Copyright */}
                <div className="pt-8 border-t border-white/5 flex flex-col gap-6">
                    <div className="flex gap-4">
                        {redes?.instagram && (
                            <a href={`https://instagram.com/${redes.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                <Instagram className="w-5 h-5 text-white/20 hover:text-white transition-colors cursor-pointer" />
                            </a>
                        )}
                        {redes?.tiktok && (
                            <a href={`https://tiktok.com/@${redes.tiktok.replace('@','')}`} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                                <Twitter className="w-5 h-5 text-white/20 hover:text-white transition-colors cursor-pointer" />
                            </a>
                        )}
                        {redes?.web && (
                            <a href={redes.web.startsWith('http') ? redes.web : `https://${redes.web}`} target="_blank" rel="noopener noreferrer" aria-label="Web">
                                <Facebook className="w-5 h-5 text-white/20 hover:text-white transition-colors cursor-pointer" />
                            </a>
                        )}
                        {!redes?.instagram && !redes?.tiktok && !redes?.web && (
                            <>
                                <Instagram className="w-5 h-5 text-white/20" />
                                <Twitter className="w-5 h-5 text-white/20" />
                            </>
                        )}
                    </div>
                    <p className="text-white/10 text-[8px] font-mono tracking-widest uppercase">
                        © 2026 FOTO FACHADA ENGINE • MADE WITH AI GIGACORE
                    </p>
                </div>

            </div>
        </footer>
    );
};
