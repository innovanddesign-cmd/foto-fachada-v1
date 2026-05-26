"use client";

import React, { ReactNode } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { usePathname } from 'next/navigation';

/**
 * CapaDeMovimiento.tsx
 * Sistema de transiciones "Seamless" con físicas de muelle elástico.
 * Implementa efecto de tunelización y layout shared elements.
 */

interface Props {
    children: ReactNode;
}

const variants = {
    initial: {
        opacity: 0,
        scale: 0.95,
        filter: 'blur(10px)',
        y: 20
    },
    enter: {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        y: 0,
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 20,
            mass: 1
        }
    },
    exit: {
        opacity: 0,
        scale: 1.05,
        filter: 'blur(10px)',
        transition: { duration: 0.3, ease: 'easeInOut' }
    }
};

export const CapaDeMovimiento = ({ children }: Props) => {
    const pathname = usePathname();

    return (
        <LayoutGroup>
            <AnimatePresence mode='wait' initial={false}>
                <motion.div
                    key={pathname}
                    variants={variants}
                    initial="initial"
                    animate="enter"
                    exit="exit"
                    className="w-full h-full"
                    style={{ willChange: 'transform, opacity, filter' }} // Optimización GPU
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </LayoutGroup>
    );
};
