import { useState, useEffect } from 'react';
import { CreditCard, Check, ExternalLink, Package } from 'lucide-react';
// import { useTranslation } from 'react-i18next';
import { useNotifications } from '../../../store/NotificationContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// interface PlanProps {
//     id: string;
//     name: string;
//     price: number;
//     features: string[];
//     current: boolean;
// }

export function SubscriptionPanel() {
    // const { t } = useTranslation();
    const { addNotification } = useNotifications();
    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState<any[]>([]);

    useEffect(() => {
        // Mock Plans fetch logic (in real app, fetch from API)
        setPlans([
            {
                id: 'free',
                name: 'Plan Gratuito',
                price: 0,
                period: 'mes',
                features: ['1 Campaña Activa', 'Analíticas Básicas', 'Marca de Agua', 'Soporte Estándar'],
                current: true // Assuming free for now
            },
            {
                id: 'pro',
                name: 'Plan Profesional',
                price: 29,
                period: 'mes',
                features: ['Campañas Ilimitadas', 'Analíticas Avanzadas', 'Sin Marca de Agua', 'Soporte Prioritario', 'Dominio Personalizado'],
                current: false
            }
        ]);
    }, []);

    const handleManageSubscription = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('foto_fachada_jwt');
            const user = JSON.parse(localStorage.getItem('foto_fachada_user') || '{}');

            // Check if we have customer ID (mock)
            const customerId = user.stripeCustomerId || 'cus_test123';

            const res = await fetch(`${API_URL}/api/billing/customer-portal`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    customerId: customerId,
                    returnUrl: window.location.href
                })
            });

            const data = await res.json();

            if (data.success && data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Failed to get portal URL');
            }

        } catch (error) {
            console.error('Portal Error:', error);
            addNotification({
                title: 'Error de Facturación',
                message: 'No se pudo acceder al portal de facturación. Inténtalo más tarde.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <CreditCard className="text-indigo-500" size={20} />
                        Suscripción y Pagos
                    </h3>
                    <p className="text-sm text-slate-400">Gestiona tu plan y método de pago</p>
                </div>
                <button
                    onClick={handleManageSubscription}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium border border-slate-700"
                >
                    {loading ? 'Cargando...' : (
                        <>
                            Portal de Cliente <ExternalLink size={14} />
                        </>
                    )}
                </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`
                            relative p-6 rounded-xl border-2 transition-all
                            ${plan.current
                                ? 'border-indigo-500 bg-indigo-500/5'
                                : 'border-slate-800 bg-slate-800/50 hover:border-slate-700'
                            }
                        `}
                    >
                        {plan.current && (
                            <span className="absolute -top-3 left-6 px-3 py-1 bg-indigo-500 text-white text-xs font-bold rounded-full">
                                PLAN ACTUAL
                            </span>
                        )}

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="text-white font-semibold text-lg">{plan.name}</h4>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-2xl font-bold text-white">{plan.price}€</span>
                                    <span className="text-slate-400 text-sm">/ {plan.period}</span>
                                </div>
                            </div>
                            <div className={`p-2 rounded-lg ${plan.current ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700/50 text-slate-400'}`}>
                                <Package size={24} />
                            </div>
                        </div>

                        <ul className="space-y-3 mb-6">
                            {plan.features.map((feature: string, idx: number) => (
                                <li key={idx} className="flex items-center gap-3 text-sm text-slate-300">
                                    <Check size={16} className={plan.current ? 'text-indigo-400' : 'text-slate-500'} />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        {!plan.current && (
                            <button className="w-full py-2 bg-white text-slate-900 hover:bg-slate-200 font-semibold rounded-lg transition-colors">
                                Cambiar a {plan.name}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className="bg-slate-950 p-4 border-t border-slate-800 text-center text-xs text-slate-500">
                Los pagos son procesados de forma segura por Stripe. Puedes cancelar en cualquier momento.
            </div>
        </div>
    );
}
