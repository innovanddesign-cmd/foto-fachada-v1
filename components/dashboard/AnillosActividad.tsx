"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface AnilloProps {
    porcentaje: number; // 0-100
    radio: number; // Radio del anillo en px
    grosor: number; // Grosor del trazo
    colorGradiente: [string, string]; // Colores del gradiente
    etiqueta: string;
    valor: number | string;
    delay?: number;
}

/**
 * AnillosActividad.tsx
 * Sistema de visualización estilo Apple Health / Activity Rings.
 * Tres anillos concéntricos con gradientes de neón.
 */

const AnilloIndividual = ({
    porcentaje,
    radio,
    grosor,
    colorGradiente,
    etiqueta,
    valor,
    delay = 0
}: AnilloProps) => {
    const circunferencia = 2 * Math.PI * radio;
    const progreso = (porcentaje / 100) * circunferencia;
    const gradientId = `grad-${etiqueta.replace(/\s/g, '')}`;

    return (
        <g>
            {/* Definir gradiente */}
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={colorGradiente[0]} />
                    <stop offset="100%" stopColor={colorGradiente[1]} />
                </linearGradient>
            </defs>

            {/* Anillo de fondo (tenue) */}
            <circle
                cx="50%"
                cy="50%"
                r={radio}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={grosor}
                strokeLinecap="round"
            />

            {/* Anillo de progreso (animado) */}
            <motion.circle
                cx="50%"
                cy="50%"
                r={radio}
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth={grosor}
                strokeLinecap="round"
                strokeDasharray={circunferencia}
                strokeDashoffset={circunferencia}
                initial={{ strokeDashoffset: circunferencia }}
                animate={{ strokeDashoffset: circunferencia - progreso }}
                transition={{
                    duration: 1.5,
                    delay,
                    ease: [0.34, 1.56, 0.64, 1] // easeOutBack
                }}
                style={{
                    filter: `drop-shadow(0 0 8px ${colorGradiente[0]}66)`,
                    transformOrigin: 'center',
                    transform: 'rotate(-90deg)'
                }}
            />
        </g>
    );
};

interface AnillosActividadProps {
    visitas: number;
    conversiones: number;
    ratioConversion: number;
    maxVisitas?: number;
    maxConversiones?: number;
}

export const AnillosActividad = ({
    visitas,
    conversiones,
    ratioConversion,
    maxVisitas = 500,
    maxConversiones = 50
}: AnillosActividadProps) => {
    const porcentajeVisitas = Math.min((visitas / maxVisitas) * 100, 100);
    const porcentajeConversiones = Math.min((conversiones / maxConversiones) * 100, 100);
    const porcentajeRatio = Math.min(ratioConversion * 10, 100); // 10% ratio = 100%

    return (
        <div className="relative w-64 h-64 mx-auto">
            {/* SVG de Anillos */}
            <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Anillo Exterior: Visitas */}
                <AnilloIndividual
                    porcentaje={porcentajeVisitas}
                    radio={90}
                    grosor={12}
                    colorGradiente={['#f472b6', '#ec4899']}
                    etiqueta="Visitas"
                    valor={visitas}
                    delay={0}
                />

                {/* Anillo Medio: Conversiones */}
                <AnilloIndividual
                    porcentaje={porcentajeConversiones}
                    radio={70}
                    grosor={12}
                    colorGradiente={['#34d399', '#10b981']}
                    etiqueta="Conversiones"
                    valor={conversiones}
                    delay={0.2}
                />

                {/* Anillo Interior: Ratio */}
                <AnilloIndividual
                    porcentaje={porcentajeRatio}
                    radio={50}
                    grosor={12}
                    colorGradiente={['#60a5fa', '#3b82f6']}
                    etiqueta="Ratio"
                    valor={`${ratioConversion.toFixed(1)}%`}
                    delay={0.4}
                />
            </svg>

            {/* Centro: Valor Principal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center"
            >
                <span className="text-4xl font-black text-white">{visitas}</span>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Visitas</span>
            </motion.div>

            {/* Leyenda */}
            <div className="absolute -bottom-16 left-0 right-0 flex justify-center gap-6 text-[10px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pink-500" />
                    <span className="text-white/40">Vistas</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-white/40">Clicks</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-white/40">Ratio</span>
                </div>
            </div>
        </div>
    );
};
