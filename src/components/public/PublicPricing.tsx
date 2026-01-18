import { ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import './PublicPages.css';

export function PublicPricing() {
    return (
        <div className="public-page fade-in">
            <div className="page-header">
                <Badge variant="primary">Plan Exclusivo</Badge>
                <h1>Transparencia Total</h1>
                <p>Sin costes ocultos. Sin permanencia. Cancela cuando quieras.</p>
            </div>

            <div className="public-pricing-grid">
                <div className="public-pricing-card">
                    <div className="pricing-header">
                        <h3 className="text-xl font-bold text-gray-900">Plan Benidorm Fase 1</h3>
                        <div className="price">
                            <span className="currency">€</span>29
                            <span className="period">/mes</span>
                        </div>
                        <p className="text-gray-500">Todo lo que necesitas para empezar</p>
                    </div>

                    <div className="feature-list">
                        <div className="feature-item">
                            <Check className="feature-icon" size={20} />
                            <span><strong>Escaparates Ilimitados</strong></span>
                        </div>
                        <div className="feature-item">
                            <Check className="feature-icon" size={20} />
                            <span>Cartel QR Alta Resolución (PDF)</span>
                        </div>
                        <div className="feature-item">
                            <Check className="feature-icon" size={20} />
                            <span>Soporte prioritario por WhatsApp</span>
                        </div>
                        <div className="feature-item">
                            <Check className="feature-icon" size={20} />
                            <span>Configuración IA Adaptativa</span>
                        </div>
                        <div className="feature-item">
                            <Check className="feature-icon" size={20} />
                            <span>Hosting Premium incluido</span>
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                        <Button size="lg" variant="primary" fullWidth rightIcon={<ArrowRight size={20} />}>
                            Empezar Prueba Gratuita
                        </Button>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                            <ShieldCheck size={16} className="text-green-500" />
                            <span>Garantía de devolución 14 días</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="page-cta bg-transparent border-none shadow-none mt-12">
                <p className="text-gray-500">
                    ¿Tienes una franquicia o múltiples locales? <a href="#" className="text-indigo-600 font-semibold hover:underline">Contáctanos para planes Enterprise</a>
                </p>
            </div>
        </div>
    );
}
