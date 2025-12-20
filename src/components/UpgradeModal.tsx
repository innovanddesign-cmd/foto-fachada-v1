import { X, Check, CreditCard, Shield } from 'lucide-react';
import type { UserTier } from '../types';
import './UpgradeModal.css';

interface UpgradeModalProps {
    isOpen: boolean;
    planName: string;
    planPrice: number;
    onClose: () => void;
    onConfirm: (tier: UserTier) => void;
    tier: UserTier;
}

export function UpgradeModal({ isOpen, planName, planPrice, onClose, onConfirm, tier }: UpgradeModalProps) {
    if (!isOpen) return null;

    const handleConfirm = () => {
        // In a real app, this would integrate with Stripe/PayPal
        onConfirm(tier);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="upgrade-modal glass-card" onClick={e => e.stopPropagation()}>
                <button className="btn-icon modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="upgrade-header">
                    <CreditCard className="upgrade-icon" size={48} />
                    <h2>Actualizar a {planName}</h2>
                    <p className="text-muted">Desbloquea todas las funciones de este plan</p>
                </div>

                <div className="upgrade-price">
                    <span className="price">€{planPrice}</span>
                    <span className="period">/mes</span>
                </div>

                <div className="upgrade-benefits">
                    <h4>Incluye:</h4>
                    <ul>
                        {tier === 'plus' && (
                            <>
                                <li><Check size={16} /> 5 proyectos</li>
                                <li><Check size={16} /> 3 landings por proyecto</li>
                                <li><Check size={16} /> 10 regeneraciones por enlace</li>
                                <li><Check size={16} /> Todas las plantillas</li>
                                <li><Check size={16} /> Cartel sin marca de agua</li>
                                <li><Check size={16} /> Analytics básicos</li>
                            </>
                        )}
                        {tier === 'pro' && (
                            <>
                                <li><Check size={16} /> 20 proyectos</li>
                                <li><Check size={16} /> 10 landings por proyecto</li>
                                <li><Check size={16} /> Regeneraciones ilimitadas</li>
                                <li><Check size={16} /> Analytics avanzados</li>
                                <li><Check size={16} /> Gamificación y sorteos</li>
                                <li><Check size={16} /> Reservas online</li>
                                <li><Check size={16} /> Soporte prioritario</li>
                            </>
                        )}
                        {tier === 'premium' && (
                            <>
                                <li><Check size={16} /> Proyectos ilimitados</li>
                                <li><Check size={16} /> Landings ilimitadas</li>
                                <li><Check size={16} /> Todo de Pro</li>
                                <li><Check size={16} /> CRM integrado</li>
                                <li><Check size={16} /> Tienda online</li>
                                <li><Check size={16} /> API access</li>
                                <li><Check size={16} /> Plantillas personalizadas</li>
                            </>
                        )}
                    </ul>
                </div>

                {/* Mock payment form */}
                <div className="payment-section">
                    <div className="form-group">
                        <label>Número de tarjeta (demo)</label>
                        <input type="text" placeholder="4242 4242 4242 4242" disabled />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Expiración</label>
                            <input type="text" placeholder="12/25" disabled />
                        </div>
                        <div className="form-group">
                            <label>CVC</label>
                            <input type="text" placeholder="123" disabled />
                        </div>
                    </div>
                </div>

                <div className="security-notice">
                    <Shield size={16} />
                    <span>Pago seguro con Stripe • SSL cifrado</span>
                </div>

                <div className="upgrade-actions">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Cancelar
                    </button>
                    <button className="btn btn-primary btn-lg" onClick={handleConfirm}>
                        Confirmar €{planPrice}/mes
                    </button>
                </div>

                <p className="cancel-notice">
                    Puedes cancelar en cualquier momento. Sin compromisos.
                </p>
            </div>
        </div>
    );
}
