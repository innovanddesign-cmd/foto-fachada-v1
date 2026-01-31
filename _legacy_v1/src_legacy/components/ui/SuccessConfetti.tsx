import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SuccessConfettiProps {
    message: string;
    description?: string;
    onComplete?: () => void;
}

export function SuccessConfetti({ message, description, onComplete }: SuccessConfettiProps) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            if (onComplete) setTimeout(onComplete, 300); // Wait for exit animation
        }, 3000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {visible && (
                <div className="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-[env(safe-area-inset-top,20px)] px-4 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 20, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.95 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="glass-card bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl p-4 rounded-full flex items-center gap-4 pr-6 max-w-sm w-full mx-auto"
                        style={{ pointerEvents: 'auto' }}
                    >
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-green-200">
                            <Check size={20} strokeWidth={3} />
                        </div>
                        <div>
                            <h4 className="text-gray-900 font-bold text-sm">{message}</h4>
                            {description && (
                                <p className="text-gray-500 text-xs mt-0.5">{description}</p>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
