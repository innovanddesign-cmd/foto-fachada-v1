import { Check, X, Crown, Zap, Rocket, Star } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import type { UserTier } from '../types';
import './PricingPage.css';

interface PricingPageProps {
    onClose: () => void;
    onSelectPlan: (tier: UserTier) => void;
}

interface PlanFeature {
    name: string;
    free: boolean | string;
    plus: boolean | string;
    pro: boolean | string;
    premium: boolean | string;
}

const FEATURES: PlanFeature[] = [
    { name: 'Proyectos', free: '1', plus: '5', pro: '20', premium: 'Ilimitados' },
    { name: 'Landings por proyecto', free: '1', plus: '3', pro: '10', premium: 'Ilimitadas' },
    { name: 'Regeneraciones por enlace', free: '3', plus: '10', pro: 'Ilimitadas', premium: 'Ilimitadas' },
    { name: 'Plantillas de diseño', free: '2', plus: '4', pro: '4', premium: '4 + Personalizadas' },
    { name: 'Cartel sin marca de agua', free: false, plus: true, pro: true, premium: true },
    { name: 'Subdominio personalizado', free: false, plus: true, pro: true, premium: true },
    { name: 'Analytics básicos', free: false, plus: true, pro: true, premium: true },
    { name: 'Analytics avanzados', free: false, plus: false, pro: true, premium: true },
    { name: 'Gamificación (Ruletas, sorteos)', free: false, plus: false, pro: true, premium: true },
    { name: 'Reservas online', free: false, plus: false, pro: true, premium: true },
    { name: 'CRM integrado', free: false, plus: false, pro: false, premium: true },
    { name: 'Tienda online', free: false, plus: false, pro: false, premium: true },
    { name: 'Soporte prioritario', free: false, plus: false, pro: true, premium: true },
    { name: 'API access', free: false, plus: false, pro: false, premium: true },
];

const PLANS = [
    {
        id: 'free' as UserTier,
        name: 'Gratis',
        price: 0,
        period: 'siempre',
        description: 'Perfecto para probar',
        icon: Zap,
        color: '#6B7280',
        popular: false
    },
    {
        id: 'plus' as UserTier,
        name: 'Plus',
        price: 9,
        period: '/mes',
        description: 'Para negocios en crecimiento',
        icon: Star,
        color: '#3B82F6',
        popular: false
    },
    {
        id: 'pro' as UserTier,
        name: 'Pro',
        price: 29,
        period: '/mes',
        description: 'Todas las funciones esenciales',
        icon: Rocket,
        color: '#8B5CF6',
        popular: true
    },
    {
        id: 'premium' as UserTier,
        name: 'Premium',
        price: 99,
        period: '/mes',
        description: 'Para agencias y profesionales',
        icon: Crown,
        color: '#F59E0B',
        popular: false
    }
];

export function PricingPage({ onClose, onSelectPlan }: PricingPageProps) {
    const { userTier } = useAppStore();

    const renderFeatureValue = (value: boolean | string) => {
        if (typeof value === 'string') {
            return <span className="feature-value">{value}</span>;
        }
        return value ? (
            <Check className="feature-check" size={18} />
        ) : (
            <X className="feature-x" size={18} />
        );
    };

    return (
        <div className="pricing-page">
            <div className="pricing-header">
                <h1>Elige tu plan</h1>
                <p className="text-muted">Escala tu negocio con las herramientas adecuadas</p>
                <button className="btn btn-secondary close-btn" onClick={onClose}>
                    Volver
                </button>
            </div>

            {/* Plan Cards */}
            <div className="plans-grid">
                {PLANS.map(plan => {
                    const Icon = plan.icon;
                    const isCurrentPlan = userTier === plan.id;

                    return (
                        <div
                            key={plan.id}
                            className={`plan-card ${plan.popular ? 'popular' : ''} ${isCurrentPlan ? 'current' : ''}`}
                        >
                            {plan.popular && (
                                <div className="popular-badge">Más popular</div>
                            )}

                            <div className="plan-icon" style={{ background: plan.color }}>
                                <Icon size={24} />
                            </div>

                            <h3 className="plan-name">{plan.name}</h3>
                            <p className="plan-description">{plan.description}</p>

                            <div className="plan-price">
                                <span className="price-amount">
                                    {plan.price === 0 ? 'Gratis' : `€${plan.price}`}
                                </span>
                                {plan.price > 0 && <span className="price-period">{plan.period}</span>}
                            </div>

                            {isCurrentPlan ? (
                                <button className="btn btn-secondary w-full" disabled>
                                    Plan actual
                                </button>
                            ) : (
                                <button
                                    className="btn btn-primary w-full"
                                    onClick={() => onSelectPlan(plan.id)}
                                >
                                    {plan.price === 0 ? 'Empezar gratis' : 'Actualizar'}
                                </button>
                            )}

                            {/* Key features for this plan */}
                            <ul className="plan-features-quick">
                                <li>
                                    <Check size={14} />
                                    {FEATURES[0][plan.id]} proyectos
                                </li>
                                <li>
                                    <Check size={14} />
                                    {FEATURES[1][plan.id]} landings/proyecto
                                </li>
                                <li>
                                    <Check size={14} />
                                    {FEATURES[2][plan.id]} regeneraciones
                                </li>
                            </ul>
                        </div>
                    );
                })}
            </div>

            {/* Comparison Table */}
            <div className="comparison-section">
                <h2>Comparación de funcionalidades</h2>

                <div className="comparison-table-wrapper">
                    <table className="comparison-table">
                        <thead>
                            <tr>
                                <th>Funcionalidad</th>
                                <th>Gratis</th>
                                <th>Plus</th>
                                <th className="highlight">Pro</th>
                                <th>Premium</th>
                            </tr>
                        </thead>
                        <tbody>
                            {FEATURES.map((feature, idx) => (
                                <tr key={idx}>
                                    <td className="feature-name">{feature.name}</td>
                                    <td>{renderFeatureValue(feature.free)}</td>
                                    <td>{renderFeatureValue(feature.plus)}</td>
                                    <td className="highlight">{renderFeatureValue(feature.pro)}</td>
                                    <td>{renderFeatureValue(feature.premium)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* FAQ or Trust section */}
            <div className="trust-section">
                <div className="trust-item">
                    <h4>💳 Pago seguro</h4>
                    <p>Procesado por Stripe con cifrado SSL</p>
                </div>
                <div className="trust-item">
                    <h4>🔄 Cancela cuando quieras</h4>
                    <p>Sin compromisos ni permanencia</p>
                </div>
                <div className="trust-item">
                    <h4>💬 Soporte incluido</h4>
                    <p>Respuesta en menos de 24h</p>
                </div>
            </div>
        </div>
    );
}
