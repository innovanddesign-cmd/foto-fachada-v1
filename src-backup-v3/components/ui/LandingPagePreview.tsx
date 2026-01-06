import { motion } from 'framer-motion';
import { X, Phone, Instagram, MapPin } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { BASIC_FEATURES, PREMIUM_FEATURES } from '../../data/catalog';

interface LandingPagePreviewProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LandingPagePreview({ isOpen, onClose }: LandingPagePreviewProps) {
    const { analysisData, userPlan } = useAppStore();

    if (!isOpen || !analysisData) return null;

    const { identity, strategy } = analysisData;
    const primaryColor = analysisData.colors.primary;

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex justify-center overflow-y-auto">
            <div className="relative w-full max-w-md bg-white min-h-screen shadow-2xl overflow-hidden">

                {/* Floating Close Button */}
                <button
                    onClick={onClose}
                    className="fixed top-4 right-4 z-50 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Generated Landing Page Content */}

                {/* Hero Section */}
                <header
                    className="relative h-64 flex items-end p-6"
                    style={{ backgroundColor: primaryColor }}
                >
                    <div className="relative z-10 text-white">
                        <h1 className="text-3xl font-bold mb-2">{identity.name}</h1>
                        <p className="opacity-90">{identity.vibe}</p>
                    </div>
                </header>

                {/* Action Buttons (Based on Basic Features) */}
                <div className="p-6 grid grid-cols-2 gap-4 -mt-8 relative z-20">
                    {strategy.selected_basic.slice(0, 2).map(feature => (
                        <div key={feature} className="bg-white p-4 rounded-xl shadow-lg text-center flex flex-col items-center gap-2">
                            <span className="text-xs font-bold uppercase text-gray-400">Feature</span>
                            <span className="font-semibold text-sm text-gray-800">{BASIC_FEATURES[feature]}</span>
                        </div>
                    ))}
                </div>

                {/* Premium Feature Spotlight */}
                {strategy.selected_premium && (
                    <div className="px-6 mb-6">
                        <div className={`p-6 rounded-2xl text-white ${userPlan !== 'BASE' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gray-100'}`}>
                            <h3 className={`font-bold mb-2 ${userPlan === 'BASE' ? 'text-gray-400' : 'text-white'}`}>
                                {PREMIUM_FEATURES[strategy.selected_premium]}
                            </h3>
                            {userPlan === 'BASE' ? (
                                <p className="text-gray-400 text-sm">Funcionalidad no disponible en esta vista previa.</p>
                            ) : (
                                <p className="text-sm opacity-90">Sistema activo y listo para recibir reservas.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Contact Info */}
                <div className="p-6 space-y-4">
                    <h2 className="font-bold text-gray-900 border-b pb-2">Contacto</h2>
                    <div className="flex items-center gap-4 text-gray-600">
                        <Phone className="w-5 h-5" />
                        <span>654 321 098</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-600">
                        <Instagram className="w-5 h-5" />
                        <span>@negocio_local</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-600">
                        <MapPin className="w-5 h-5" />
                        <span>Calle Principal 123</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
