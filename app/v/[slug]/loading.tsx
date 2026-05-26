"use client";

import React from "react";
import BarraProgreso from "@/components/ui/BarraProgreso";

/**
 * COMPONENTE: LOADING (Vista Pública)
 * 
 * Esqueleto de carga con estética Aero-Glass que sigue la línea visual de la app.
 */
export default function LoadingVistaPublica() {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505]">
            <div className="w-full max-w-xs space-y-8 px-6">
                {/* Logo o Icono de Carga */}
                <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
                    <div className="relative w-8 h-8 border-2 border-emerald-500/50 border-t-emerald-400 rounded-lg animate-spin" />
                </div>

                {/* Barra de Progreso Simulada */}
                <div className="space-y-3">
                    <div className="flex justify-between items-end px-1">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/40">
                            Cargando ADN...
                        </span>
                        <span className="text-xs font-mono text-emerald-500/60">
                            Sincronizando
                        </span>
                    </div>
                    <BarraProgreso progreso={45} estado="cargando" />
                </div>

                {/* Texto Inspirador / Técnico */}
                <p className="text-center text-[11px] font-medium text-white/30 italic">
                    "Renderizando la identidad visual del negocio..."
                </p>
            </div>
        </div>
    );
}
