'use client';

/**
 * FOTO FACHADA V2 — Formulario de Activos
 * Recopila redes sociales y logotipo. Estética Premium.
 */

import { motion } from 'framer-motion';
import { useTiendaEstado, accionesTienda } from '@/store/useTiendaEstado';
import CampoUrlSocial from './CampoUrlSocial';
import UploaderLogotipo from './UploaderLogotipo';

export default function FormularioActivos() {
    const redes = useTiendaEstado((s) => s.redesSociales);

    return (
        <section className="w-full max-w-4xl mx-auto py-10 px-4">
            <header className="mb-12">
                <h3 className="text-slate-400 font-semibold uppercase tracking-[0.3em] text-xs mb-2">
                    RASTRO DIGITAL Y ACTIVOS
                </h3>
                <h2 className="text-3xl font-bold text-white tracking-tight">
                    Identidad de Marca
                </h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-12 items-start">
                {/* Columna de Redes Sociales */}
                <div className="space-y-10">
                    <CampoUrlSocial
                        tipo="instagram"
                        valor={redes.instagram || ''}
                        alCambiar={(v) => accionesTienda.actualizarRedes({ instagram: v })}
                        placeholder="https://instagram.com/nombre-negocio"
                    />

                    <CampoUrlSocial
                        tipo="tiktok"
                        valor={redes.tiktok || ''}
                        alCambiar={(v) => accionesTienda.actualizarRedes({ tiktok: v })}
                        placeholder="https://tiktok.com/@tu.usuario"
                    />

                    <CampoUrlSocial
                        tipo="web"
                        valor={redes.web || ''}
                        alCambiar={(v) => accionesTienda.actualizarRedes({ web: v })}
                        placeholder="www.tu-web.com"
                    />
                </div>

                {/* Columna de Logotipo */}
                <div className="flex flex-col items-center gap-6 p-8 border border-white/5 rounded-[2rem] bg-white/[0.01]">
                    <div className="text-center">
                        <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-4">
                            LOGO OFICIAL
                        </h4>
                        <UploaderLogotipo />
                    </div>

                    <p className="text-[11px] text-white/30 text-center leading-relaxed max-w-[120px]">
                        Preferible SVG • El sistema puede auto-generar uno si se omite.
                    </p>
                </div>
            </div>
        </section>
    );
}
