import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const SCAN_MESSAGES = [
    "Escaneando fachada...",
    "Identificando arquitectura...",
    "Analizando estilo del barrio...",
    "Detectando paleta de colores...",
    "Configurando identidad digital..."
];

export function AIScanAnimation() {
    const [msgIndex, setMsgIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMsgIndex(prev => (prev + 1) % SCAN_MESSAGES.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6">
            <div className="relative w-64 h-64 mb-8">
                {/* Image Placeholder or Camera Feed Simulation */}
                <div className="absolute inset-0 bg-gray-800 rounded-3xl overflow-hidden border border-gray-700">
                    <div className="w-full h-full opacity-30 bg-[url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400')] bg-cover bg-center" />
                </div>

                {/* Scanning Bar */}
                <motion.div
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute w-full h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] z-10"
                />

                {/* Grid Overlay */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-px opacity-20">
                    {[...Array(9)].map((_, i) => (
                        <div key={i} className="border border-indigo-500/50" />
                    ))}
                </div>

                {/* Corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl -mt-1 -ml-1" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl -mt-1 -mr-1" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl -mb-1 -ml-1" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-xl -mb-1 -mr-1" />
            </div>

            {/* Dynamic Text */}
            <motion.p
                key={msgIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-white text-lg font-mono tracking-wide text-center"
            >
                {SCAN_MESSAGES[msgIndex]}
            </motion.p>

            <div className="mt-4 flex gap-1">
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        className="w-2 h-2 rounded-full bg-indigo-500"
                    />
                ))}
            </div>
        </div>
    );
}
