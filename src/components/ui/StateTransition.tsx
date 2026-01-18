/**
 * StateTransition - Wrapper para transiciones elásticas entre estados
 * Implementación con Framer Motion para experiencia nativa (iOS-like)
 */

import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface StateTransitionProps {
    children: ReactNode;
    stateKey: string;
    direction?: 'forward' | 'backward';
}

const variants = {
    initial: (direction: 'forward' | 'backward') => ({
        x: direction === 'forward' ? '100%' : '-100%',
        opacity: 0,
        position: 'absolute' as const // Necesario para que no ocupen espacio durante la transición
    }),
    animate: {
        x: 0,
        opacity: 1,
        position: 'relative' as const, // Restaurar flujo normal
        transition: {
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
        }
    },
    exit: (direction: 'forward' | 'backward') => ({
        x: direction === 'forward' ? '-100%' : '100%',
        opacity: 0,
        position: 'absolute' as const,
        transition: {
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
        }
    })
};

export function StateTransition({ children, stateKey, direction = 'forward' }: StateTransitionProps) {
    return (
        <div className="relative w-full h-full overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                <motion.div
                    key={stateKey}
                    custom={direction}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="w-full h-full"
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
