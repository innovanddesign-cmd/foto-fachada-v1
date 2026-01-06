import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, CreditCard, CheckCircle2 } from 'lucide-react';

interface UpsellModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: () => void;
    featureName: string;
}

export default function UpsellModal({ isOpen, onClose, onUpgrade, featureName }: UpsellModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center sm:p-4">

                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-t-3xl md:rounded-3xl p-6 md:p-8 overflow-hidden"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-white/50 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20">
                            <Star className="w-8 h-8 text-black fill-black" />
                        </div>

                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-yellow-500 mb-2">
                            Desbloquea {featureName}
                        </h2>

                        <p className="text-white/60 mb-8 max-w-sm">
                            Esta funcionalidad Premium aumentará tus ventas hasta un 30% activando reservas automatizadas.
                        </p>

                        <div className="w-full bg-white/5 rounded-xl p-4 mb-8">
                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                                <span className="text-white">Plan Mensual</span>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-white">29€</span>
                                    <span className="text-white/40 text-sm">/mes</span>
                                </div>
                            </div>
                            <ul className="space-y-3 text-sm text-left px-2">
                                <li className="flex items-center gap-3 text-white/80">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    Funcionalidades Premium desbloqueadas
                                </li>
                                <li className="flex items-center gap-3 text-white/80">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    Soporte prioritario 24/7
                                </li>
                                <li className="flex items-center gap-3 text-white/80">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    Sin permanencia
                                </li>
                            </ul>
                        </div>

                        <button
                            onClick={onUpgrade}
                            className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                        >
                            <CreditCard className="w-5 h-5" />
                            Activar Plan Plus
                        </button>

                        <button onClick={onClose} className="mt-4 text-sm text-white/40 underline">
                            No gracias, continuar con el plan básico
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
