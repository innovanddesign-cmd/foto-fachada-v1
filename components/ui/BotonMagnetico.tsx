"use client";

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useOrquestadorSensorial } from '@/lib/sensorial/OrquestadorSensorial';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variante?: 'primario' | 'secundario' | 'fantasma' | 'cristal';
    className?: string;
}

export const BotonMagnetico = ({ children, variante = 'primario', className = '', onClick, ...props }: Props) => {
    const ref = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const { reproducir, vibrar } = useOrquestadorSensorial();

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current!.getBoundingClientRect();

        const x = clientX - (left + width / 2);
        const y = clientY - (top + height / 2);

        setPosition({ x: x * 0.15, y: y * 0.15 });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        reproducir('SELECT');
        vibrar('LIGERO');

        // Efecto Ripple simulado (visual)
        const ripple = document.createElement("span");
        ripple.classList.add("ripple-effect");
        ref.current?.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);

        if (onClick) onClick(e);
    };

    const stylesBase = "relative overflow-hidden transition-colors duration-300 font-medium rounded-xl flex items-center justify-center gap-2";

    const variants = {
        primario: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20",
        secundario: "bg-zinc-800 hover:bg-zinc-700 text-white",
        fantasma: "bg-transparent hover:bg-white/5 text-white/60 hover:text-white",
        cristal: "bg-white/5 hover:bg-white/10 text-white backdrop-blur-md border border-white/10"
    };

    return (
        <motion.button
            ref={ref}
            className={`${stylesBase} ${variants[variante]} ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            whileTap={{ scale: 0.95 }}
            {...(props as any)}
        >
            <span className="relative z-10 flex items-center gap-2">{children}</span>
        </motion.button>
    );
};
