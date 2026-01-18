import { Camera, Settings, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

interface MobileTabBarProps {
    currentView: string;
    onNavigate: (view: string) => void;
}

export function MobileTabBar({ currentView, onNavigate }: MobileTabBarProps) {
    const navItems = [
        { id: 'dashboard', label: 'Escaparates', icon: Layers },
        { id: 'create-landing', label: 'Nueva Foto', icon: Camera, isPrimary: true },
        // { id: 'settings', label: 'Ajustes', icon: Settings } // Temporary hidden as per requirements focus
        { id: 'settings', label: 'Ajustes', icon: Settings }
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-[env(safe-area-inset-bottom,20px)] pt-2 bg-white/80 backdrop-blur-xl border-t border-white/50 shadow-lg">
            <div className="flex justify-around items-end max-w-md mx-auto relative">
                {navItems.map((item) => {
                    const isActive = currentView === item.id || (item.id === 'create-landing' && currentView === 'escaparate');

                    if (item.isPrimary) {
                        return (
                            <motion.button
                                key={item.id}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onNavigate(item.id)}
                                className="relative -top-6 flex flex-col items-center justify-center w-16 h-16 rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-200 border-4 border-white/50"
                            >
                                <item.icon size={28} strokeWidth={2} />
                            </motion.button>
                        );
                    }

                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`flex flex-col items-center justify-center w-16 py-2 transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium mt-1">{item.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="tabIndicator"
                                    className="absolute bottom-0 w-1 h-1 rounded-full bg-current mb-[-4px]"
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
