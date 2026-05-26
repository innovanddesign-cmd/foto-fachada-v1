'use client';

/**
 * FOTO FACHADA V2 — Uploader de Logotipo
 * Estética Apple/Google 2026. Minimalismo y feedback de cristal.
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { accionesTienda, useTiendaEstado } from '@/store/useTiendaEstado';
import { Plus, Check, X, Loader2, UploadCloud } from 'lucide-react';

const LIMITE_LOGO_MB = 5;
const TIPOS_LOGO = ['image/png', 'image/svg+xml'];

export default function UploaderLogotipo() {
    const [estado, setEstado] = useState<'reposo' | 'procesando' | 'exito' | 'error'>('reposo');
    const [errorMsg, setErrorMsg] = useState('');
    const logoStatus = useTiendaEstado((s) => s.logoStatus);

    const procesarLogo = async (archivo: File) => {
        setEstado('procesando');

        try {
            // Validaciones
            if (archivo.size > LIMITE_LOGO_MB * 1024 * 1024) {
                throw new Error(`Máximo ${LIMITE_LOGO_MB}MB.`);
            }
            if (!TIPOS_LOGO.includes(archivo.type)) {
                throw new Error('Solo SVG o PNG transparente.');
            }

            // Simulación de procesamiento
            await new Promise(resolve => setTimeout(resolve, 1000));

            await accionesTienda.agregarActivo(archivo, 'LOGO');
            accionesTienda.setLogoStatus('UPLOADED');
            setEstado('exito');

        } catch (err: any) {
            setErrorMsg(err.message);
            setEstado('error');
            setTimeout(() => setEstado('reposo'), 3000);
        }
    };

    const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
        const archivo = e.target.files?.[0];
        if (archivo) procesarLogo(archivo);
    };

    return (
        <div className="flex flex-col items-center gap-3">
            <label className="relative group cursor-pointer">
                <input
                    type="file"
                    className="hidden"
                    accept=".svg,.png"
                    onChange={manejarCambio}
                    disabled={estado === 'procesando'}
                />

                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                        w-24 h-24 rounded-2xl flex items-center justify-center
                        backdrop-blur-xl border-2 border-dashed
                        transition-all duration-500
                        ${estado === 'exito' ? 'border-green-500/50 bg-green-500/10' :
                            estado === 'error' ? 'border-red-500/50 bg-red-500/10' :
                                'border-white/10 bg-white/5 hover:border-white/20'}
                    `}
                >
                    <AnimatePresence mode="wait">
                        {estado === 'procesando' ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0, rotate: -90 }}
                                animate={{ opacity: 1, rotate: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                            </motion.div>
                        ) : estado === 'exito' ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <Check className="w-8 h-8 text-green-400" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="plus"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center gap-1"
                            >
                                <Plus className="w-6 h-6 text-white/40 group-hover:text-white/60" />
                                <span className="text-[10px] font-medium text-white/30 uppercase tracking-tighter">LOGO</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-blue-500/0 group-hover:bg-blue-500/5 blur-xl transition-all duration-500 -z-10" />
            </label>

            <AnimatePresence>
                {estado === 'error' && (
                    <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-[10px] text-red-400 font-medium uppercase tracking-wider"
                    >
                        {errorMsg}
                    </motion.p>
                )}
                {logoStatus === 'PENDING_AI' && estado === 'reposo' && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[10px] text-white/30 font-medium uppercase tracking-widest flex items-center gap-1"
                    >
                        <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                        IA: AUTO-GEN
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
