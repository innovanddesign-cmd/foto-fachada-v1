import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Wand2, ShoppingBag, ArrowRight, Check } from 'lucide-react';
import { Button } from '../ui/Button';

interface OnboardingCarouselProps {
    onComplete: () => void;
}

const SLIDES = [
    {
        id: 'capture',
        icon: <Camera size={48} className="text-white" />,
        color: 'bg-blue-500',
        title: "Captura",
        description: "Haz una foto a tu fachada. No necesitas ser fotógrafo profesional, nuestra IA se encarga del resto."
    },
    {
        id: 'create',
        icon: <Wand2 size={48} className="text-white" />,
        color: 'bg-purple-500',
        title: "Crea",
        description: "Nuestra IA analiza tu negocio y diseña tu escaparate digital en segundos. Magia pura."
    },
    {
        id: 'sell',
        icon: <ShoppingBag size={48} className="text-white" />,
        color: 'bg-green-500',
        title: "Vende",
        description: "Imprime tu cartel A4 con QR, pégalo en tu puerta y empieza a atraer clientes desde la calle."
    }
];

export function OnboardingCarousel({ onComplete }: OnboardingCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl relative">

                {/* Image/Color Header */}
                <div className={`h-64 ${SLIDES[currentIndex].color} flex items-center justify-center transition-colors duration-500`}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={SLIDES[currentIndex].id}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                {SLIDES[currentIndex].icon}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Content */}
                <div className="p-8 text-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={SLIDES[currentIndex].id}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-4"
                        >
                            <h2 className="text-3xl font-extrabold text-gray-900">
                                {SLIDES[currentIndex].title}
                            </h2>
                            <p className="text-gray-500 text-lg leading-relaxed">
                                {SLIDES[currentIndex].description}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Progress Dots */}
                    <div className="flex justify-center gap-2 mt-8 mb-8">
                        {SLIDES.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-gray-900' : 'w-2 bg-gray-200'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Action Button */}
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleNext}
                        className="w-full h-14 text-lg rounded-xl shadow-xl shadow-indigo-100"
                        rightIcon={currentIndex === SLIDES.length - 1 ? <Check /> : <ArrowRight />}
                    >
                        {currentIndex === SLIDES.length - 1 ? 'Empezar ahora' : 'Siguiente'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
