'use client';

/**
 * FOTO FACHADA V2 — Campo de Red Social (Helper)
 * Validación RegEx y efectos de iluminación corporativa.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Link as LinkIcon } from 'lucide-react';

interface Props {
    tipo: 'instagram' | 'tiktok' | 'web';
    valor: string;
    alCambiar: (valor: string) => void;
    placeholder: string;
}

const CONFIG_REDES = {
    instagram: {
        regex: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([A-Za-z0-9_.]+)/,
        gradient: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
        color: '#e1306c'
    },
    tiktok: {
        regex: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([A-Za-z0-9_.]+)/,
        gradient: 'linear-gradient(45deg, #ff0050 0%, #00f2ea 100%)',
        color: '#ff0050'
    },
    web: {
        regex: /^(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
        gradient: 'linear-gradient(45deg, #3b82f6 0%, #2dd4bf 100%)',
        color: '#3b82f6'
    }
};

export default function CampoUrlSocial({ tipo, valor, alCambiar, placeholder }: Props) {
    const config = CONFIG_REDES[tipo];
    const esValido = useMemo(() => config.regex.test(valor), [valor, config]);

    return (
        <div className="relative group">
            <div className={`
                flex items-center gap-4 p-4 rounded-2xl
                backdrop-blur-md border border-white/5 bg-white/[0.02]
                transition-all duration-500
                group-focus-within:bg-white/[0.05]
                ${esValido ? 'border-white/20' : 'hover:border-white/10'}
            `}>
                {/* Icono con Iluminación */}
                <div className="relative">
                    <motion.div
                        animate={{
                            opacity: valor ? 1 : 0.3,
                            scale: esValido ? 1.1 : 1
                        }}
                        className="p-2 rounded-lg bg-white/5"
                    >
                        <LinkIcon className="w-5 h-5 transition-colors" style={{ color: esValido ? config.color : 'white' }} />
                    </motion.div>

                    {/* Aura de color corporativo */}
                    <AnimatePresence>
                        {esValido && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 0.2, scale: 1.5 }}
                                exit={{ opacity: 0, scale: 0 }}
                                className="absolute inset-0 pointer-events-none blur-xl rounded-full"
                                style={{ background: config.gradient }}
                            />
                        )}
                    </AnimatePresence>
                </div>

                {/* Input */}
                <div className="flex-1">
                    <input
                        type="text"
                        value={valor}
                        onChange={(e) => alCambiar(e.target.value)}
                        placeholder={placeholder}
                        className="w-full bg-transparent border-none outline-none text-white/80 placeholder:text-white/20 text-sm font-medium"
                    />
                </div>

                {/* Check de Cristal */}
                <AnimatePresence>
                    {esValido && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-green-500/20 p-1.5 rounded-full border border-green-500/30"
                        >
                            <Check className="w-3.5 h-3.5 text-green-400" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Label flotante superior */}
            <span className="absolute -top-2 left-6 px-2 bg-[#050505] text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
                {tipo}
            </span>
        </div>
    );
}
