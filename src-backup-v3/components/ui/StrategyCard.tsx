import { motion } from 'framer-motion';
import { Lock, Check } from 'lucide-react';

interface StrategyCardProps {
    title: string;
    description: string;
    isLocked?: boolean;
    isPremium?: boolean;
    onClick?: () => void;
    index: number;
}

export default function StrategyCard({
    title,
    description,
    isLocked = false,
    isPremium = false,
    onClick,
    index
}: StrategyCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={isLocked ? onClick : undefined}
            className={`relative p-4 rounded-2xl border mb-3 cursor-pointer overflow-hidden backdrop-blur-md ${isLocked
                    ? 'bg-gradient-to-br from-gray-900 to-black border-yellow-500/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
        >
            <div className="flex items-start gap-4">
                <div className={`mt-1 p-2 rounded-full ${isLocked ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'
                    }`}>
                    {isLocked ? <Lock className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                </div>

                <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                        <h3 className={`font-semibold text-lg ${isLocked ? 'text-yellow-100' : 'text-white'}`}>
                            {title}
                        </h3>
                        {isPremium && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500 text-black uppercase tracking-wider">
                                Premium
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>

            {isLocked && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-4 opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-yellow-400 text-sm font-medium flex items-center gap-2">
                        Desbloquear <Lock className="w-3 h-3" />
                    </span>
                </div>
            )}
        </motion.div>
    );
}
