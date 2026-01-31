import { useState, useEffect } from 'react';
import { Cookie, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            // Show banner after a small delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent', 'accepted');
        setIsVisible(false);
        // Here we would enable analytics scripts
        // window.gtag('consent', 'update', { ... });
    };

    const handleReject = () => {
        localStorage.setItem('cookie_consent', 'rejected');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slideUp">
            <div className="max-w-4xl mx-auto glass-card bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl p-6 md:flex items-center gap-6">

                <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-indigo-50 rounded-xl shrink-0">
                        <Cookie className="text-indigo-600" size={24} />
                    </div>
                    <div>
                        <h3 className="text-gray-900 font-bold mb-1">Valoramos tu privacidad</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Utilizamos cookies propias y de terceros para mejorar tu experiencia y analizar el uso de nuestra web.
                            Puedes leer más en nuestra <Link to="/privacy" className="text-indigo-600 font-medium hover:underline">Política de Privacidad</Link>.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-4 md:mt-0 shrink-0">
                    <button
                        onClick={handleReject}
                        className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors text-sm font-medium"
                    >
                        Rechazar
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all transform hover:scale-105 active:scale-95 text-sm font-bold flex items-center gap-2"
                    >
                        <Check size={16} /> Aceptar todas
                    </button>
                </div>
            </div>
        </div>
    );
}
