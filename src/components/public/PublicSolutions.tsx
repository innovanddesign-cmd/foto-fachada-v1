import { ArrowRight, Smartphone, Sparkles, QrCode } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import './PublicPages.css';

export function PublicSolutions() {
    return (
        <div className="public-page fade-in">
            <div className="page-header">
                <Badge variant="primary">Cómo Funciona</Badge>
                <h1>Tecnología Phygital</h1>
                <p>Unimos el mundo físico de tu tienda con el potencial digital de internet.</p>
            </div>

            <div className="timeline">
                <div className="timeline-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                        <h3>Captura la esencia</h3>
                        <p>No necesitas equipos caros. Solo saca tu móvil y haz una foto frontal de tu escaparate. Nuestra IA identificará automáticamente tu tipo de negocio y estilo visual.</p>
                    </div>
                </div>

                <div className="timeline-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                        <h3>Generación IA Inmediata</h3>
                        <p>Nuestros algoritmos crean un "Gemelo Digital" de tu negocio: una landing page optimizada para ventas y diseñada específicamente para atraer a tu cliente ideal.</p>
                    </div>
                </div>

                <div className="timeline-step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                        <h3>Tu Puerta Interactiva</h3>
                        <p>Recibe un Cartel QR de alta resolución listo para imprimir. Colócalo en tu escaparate y convierte a cada transeúnte curiosos en un cliente potencial.</p>
                    </div>
                </div>
            </div>

            <div className="page-cta">
                <Badge variant="neutral" className="mb-4">Calidad App Store</Badge>
                <h2>Diferenciación 2026</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 mb-12 text-left">
                    <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <Smartphone className="text-indigo-600 mb-4" size={24} />
                        <h4 className="font-bold text-lg mb-2">Velocidad Extrema</h4>
                        <p className="text-gray-600">Tus clientes no esperan. Nuestras landings cargan en menos de 0.5 segundos.</p>
                    </div>
                    <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <Sparkles className="text-purple-600 mb-4" size={24} />
                        <h4 className="font-bold text-lg mb-2">Diseño Glassmorphism</h4>
                        <p className="text-gray-600">Estética premium que transmite confianza y modernidad instantánea.</p>
                    </div>
                    <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <QrCode className="text-pink-600 mb-4" size={24} />
                        <h4 className="font-bold text-lg mb-2">UX Nativa</h4>
                        <p className="text-gray-600">Se siente como una app, pero funciona en cualquier navegador sin descargas.</p>
                    </div>
                </div>

                <Button size="lg" variant="primary" rightIcon={<ArrowRight size={20} />}>
                    Modernizar mi Negocio
                </Button>
            </div>
        </div>
    );
}
