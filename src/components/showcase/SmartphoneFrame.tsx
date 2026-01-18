import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface SmartphoneFrameProps {
    children: ReactNode;
    className?: string;
}

export function SmartphoneFrame({ children, className = '' }: SmartphoneFrameProps) {
    return (
        <div className={`relative mx-auto w-[320px] h-[680px] sm:w-[375px] sm:h-[812px] bg-black rounded-[50px] shadow-2xl border-[8px] border-gray-900 overflow-hidden ${className}`}>
            {/* Notch / Dynamic Island */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[35px] w-[120px] bg-black rounded-b-[20px] z-50 pointer-events-none" />

            {/* Screen Content */}
            <div className="w-full h-full bg-gray-900 overflow-y-auto overflow-x-hidden scrollbar-hide">
                {children}
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[140px] h-[5px] bg-white/20 rounded-full z-50 pointer-events-none" />

            {/* Reflection / Gloss */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/5 to-transparent pointer-events-none rounded-[40px]" />
        </div>
    );
}
