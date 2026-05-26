"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Ghost, ArrowLeft } from "lucide-react";

/**
 * COMPONENTE: NOT FOUND (Vista Pública)
 * 
 * Interfaz Aero-Glass para slugs inexistentes o errores de carga.
 */
export default function NotFoundVistaPublica() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] p-6 text-white overflow-hidden">
            {/* Fondo con auras difusas */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-rose-500/10 blur-[100px] rounded-full" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative z-10 w-full max-w-sm"
            >
                <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2.5rem] p-10 shadow-2xl space-y-8 text-center">
                    {/* Icono Ghost Aero */}
                    <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                        <div className="absolute inset-0 bg-white/5 rounded-full animate-ping ease-out duration-[3s]" />
                        <Ghost className="w-12 h-12 text-white/20" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                            Escaparate no encontrado
                        </h1>
                        <p className="text-sm text-white/40 leading-relaxed">
                            Parece que este negocio aún no ha generado su visión inmersiva o la URL es incorrecta.
                        </p>
                    </div>

                    <Link
                        href="/"
                        className="group flex items-center justify-center gap-2 w-full py-4 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl transition-all duration-300"
                    >
                        <ArrowLeft className="w-4 h-4 text-emerald-400 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-semibold">Volver al Inicio</span>
                    </Link>
                </div>

                {/* Detalle Técnico Decorativo */}
                <div className="mt-8 flex justify-center gap-4 opacity-20">
                    <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-white" />
                    <span className="text-[10px] font-mono tracking-widest uppercase">FF-V2-0x404</span>
                    <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-white" />
                </div>
            </motion.div>
        </div>
    );
}
