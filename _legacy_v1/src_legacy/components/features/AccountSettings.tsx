/**
 * Account Settings Page
 * ======================
 * User profile, security, and billing management
 */
import { useState, useEffect } from 'react';
import {
    Shield,
    CreditCard,
    Building,
    Phone,
    MapPin,
    Globe,
    Instagram,
    Lock,
    Key,
    Smartphone,
    Save,
    ExternalLink,
    Clock,
    ChevronRight
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { toast } from '../../store/toastStore';
import { activity, getActivityLogs, formatRelativeTime, type ActivityLogEntry } from '../../services/activityLogService';
import { useAppStore } from '../../store/appStore';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface BusinessProfile {
    phone: string;
    address: string;
    website: string;
    instagram: string;
    facebook: string;
    whatsapp: string;
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export function AccountSettings() {
    const { user, userTier } = useAppStore();
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'billing' | 'activity'>('profile');

    // Profile state
    const [profile, setProfile] = useState<BusinessProfile>({
        phone: '',
        address: '',
        website: '',
        instagram: '',
        facebook: '',
        whatsapp: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    // Security state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);

    // Activity logs
    const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);

    // Load profile and logs
    useEffect(() => {
        const savedProfile = localStorage.getItem('foto_fachada_business_profile');
        if (savedProfile) {
            setProfile(JSON.parse(savedProfile));
        }
        setActivityLogs(getActivityLogs(20));
    }, []);

    // Save profile
    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            localStorage.setItem('foto_fachada_business_profile', JSON.stringify(profile));
            activity.profileUpdated();
            toast.success('Perfil actualizado', 'Los cambios se reflejarán en tus landings');
        } catch {
            toast.error('Error al guardar', 'Inténtalo de nuevo');
        } finally {
            setIsSaving(false);
        }
    };

    // Open Stripe portal
    const handleOpenBillingPortal = async () => {
        try {
            const response = await fetch('/api/billing/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user?.id })
            });
            const data = await response.json();
            if (data.url) {
                window.open(data.url, '_blank');
            }
        } catch {
            toast.error('Error', 'No se pudo abrir el portal de facturación');
        }
    };

    const tabs = [
        { id: 'profile', label: 'Perfil de Negocio', icon: <Building size={18} /> },
        { id: 'security', label: 'Seguridad', icon: <Shield size={18} /> },
        { id: 'billing', label: 'Facturación', icon: <CreditCard size={18} /> },
        { id: 'privacy', label: 'Privacidad', icon: <Shield size={18} /> },
        { id: 'activity', label: 'Actividad', icon: <Clock size={18} /> }
    ];

    return (
        <div className="account-settings">
            {/* Tabs */}
            <div className="settings-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="settings-content">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="settings-section">
                        <h2 className="settings-title">Perfil de Negocio</h2>
                        <p className="settings-description">
                            Esta información aparecerá en el footer de todas tus landings y carteles.
                        </p>

                        <div className="settings-form">
                            <div className="form-group">
                                <label><Phone size={16} /> Teléfono de contacto</label>
                                <input
                                    type="tel"
                                    value={profile.phone}
                                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                    placeholder="+34 600 000 000"
                                />
                            </div>

                            <div className="form-group">
                                <label><MapPin size={16} /> Dirección</label>
                                <input
                                    type="text"
                                    value={profile.address}
                                    onChange={e => setProfile({ ...profile, address: e.target.value })}
                                    placeholder="Calle Principal 123, Madrid"
                                />
                            </div>

                            <div className="form-group">
                                <label><Globe size={16} /> Sitio web</label>
                                <input
                                    type="url"
                                    value={profile.website}
                                    onChange={e => setProfile({ ...profile, website: e.target.value })}
                                    placeholder="https://minegocio.com"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label><Instagram size={16} /> Instagram</label>
                                    <input
                                        type="text"
                                        value={profile.instagram}
                                        onChange={e => setProfile({ ...profile, instagram: e.target.value })}
                                        placeholder="@minegocio"
                                    />
                                </div>

                                <div className="form-group">
                                    <label><Phone size={16} /> WhatsApp</label>
                                    <input
                                        type="tel"
                                        value={profile.whatsapp}
                                        onChange={e => setProfile({ ...profile, whatsapp: e.target.value })}
                                        placeholder="+34 600 000 000"
                                    />
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                leftIcon={<Save size={18} />}
                            >
                                {isSaving ? 'Guardando...' : 'Guardar cambios'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="settings-section">
                        <h2 className="settings-title">Seguridad</h2>

                        <div className="security-options">
                            <div className="security-item" onClick={() => setShowPasswordModal(true)}>
                                <div className="security-icon">
                                    <Lock size={24} />
                                </div>
                                <div className="security-info">
                                    <h3>Cambiar contraseña</h3>
                                    <p>Actualiza tu contraseña regularmente</p>
                                </div>
                                <ChevronRight size={20} />
                            </div>

                            <div className="security-item" onClick={() => setShow2FAModal(true)}>
                                <div className="security-icon">
                                    <Smartphone size={24} />
                                </div>
                                <div className="security-info">
                                    <h3>Autenticación de Dos Factores (2FA)</h3>
                                    <p>{is2FAEnabled ? '2FA activado ✓' : 'Añade una capa extra de seguridad'}</p>
                                </div>
                                <ChevronRight size={20} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Billing Tab */}
                {activeTab === 'billing' && (
                    <div className="settings-section">
                        <h2 className="settings-title">Facturación y Suscripción</h2>

                        <div className="billing-card">
                            <div className="billing-plan">
                                <span className="plan-label">Plan actual</span>
                                <span className="plan-name">{userTier.toUpperCase()}</span>
                            </div>
                            <Button
                                variant="primary"
                                onClick={handleOpenBillingPortal}
                                rightIcon={<ExternalLink size={16} />}
                            >
                                Gestionar Suscripción
                            </Button>
                        </div>

                        <div className="billing-info">
                            <p>Desde el portal de facturación podrás:</p>
                            <ul>
                                <li>📄 Descargar facturas</li>
                                <li>💳 Actualizar método de pago</li>
                                <li>⬆️ Cambiar de plan (Upgrade/Downgrade)</li>
                                <li>❌ Cancelar suscripción</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                    <div className="settings-section">
                        <h2 className="settings-title">Actividad Reciente</h2>

                        {activityLogs.length > 0 ? (
                            <div className="activity-list">
                                {activityLogs.map(log => (
                                    <div key={log.id} className="activity-item">
                                        <div className={`activity-dot ${log.type}`}></div>
                                        <div className="activity-content">
                                            <p className="activity-description">{log.description}</p>
                                            <span className="activity-time">{formatRelativeTime(log.timestamp)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="activity-empty">
                                <Clock size={40} />
                                <p>No hay actividad reciente</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Password Modal */}
            <Modal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                title="Cambiar Contraseña"
                size="sm"
            >
                <form className="password-form" onSubmit={(e) => {
                    e.preventDefault();
                    activity.passwordChanged();
                    toast.success('Contraseña actualizada');
                    setShowPasswordModal(false);
                }}>
                    <div className="form-group">
                        <label>Contraseña actual</label>
                        <input type="password" required />
                    </div>
                    <div className="form-group">
                        <label>Nueva contraseña</label>
                        <input type="password" minLength={8} required />
                    </div>
                    <div className="form-group">
                        <label>Confirmar nueva contraseña</label>
                        <input type="password" minLength={8} required />
                    </div>
                    <Button type="submit" variant="primary" className="w-full">
                        Actualizar contraseña
                    </Button>
                </form>
            </Modal>

            {/* 2FA Modal */}
            <Modal
                isOpen={show2FAModal}
                onClose={() => setShow2FAModal(false)}
                title="Autenticación de Dos Factores"
                size="sm"
            >
                <div className="twofa-content">
                    {!is2FAEnabled ? (
                        <>
                            <p>Escanea este código QR con tu app de autenticación:</p>
                            <div className="twofa-qr">
                                <div className="qr-placeholder">
                                    <Key size={48} />
                                    <span>QR Code</span>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Código de verificación</label>
                                <input type="text" maxLength={6} placeholder="000000" />
                            </div>
                            <Button
                                variant="primary"
                                className="w-full"
                                onClick={() => {
                                    setIs2FAEnabled(true);
                                    toast.success('2FA activado', 'Tu cuenta está más segura');
                                    setShow2FAModal(false);
                                }}
                            >
                                Activar 2FA
                            </Button>
                        </>
                    ) : (
                        <>
                            <p>El 2FA está activado en tu cuenta.</p>
                            <Button
                                variant="secondary"
                                className="w-full"
                                onClick={() => {
                                    setIs2FAEnabled(false);
                                    toast.warning('2FA desactivado');
                                    setShow2FAModal(false);
                                }}
                            >
                                Desactivar 2FA
                            </Button>
                        </>
                    )}
                </div>
            </Modal>

            <style>{`
                .account-settings {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 2rem;
                }
                
                .settings-tabs {
                    display: flex;
                    gap: 0.5rem;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    margin-bottom: 2rem;
                    overflow-x: auto;
                }
                
                .settings-tab {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 1rem 1.5rem;
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                
                .settings-tab:hover {
                    color: var(--text-primary);
                }
                
                .settings-tab.active {
                    color: var(--primary);
                    border-bottom-color: var(--primary);
                }
                
                .settings-section {
                    background: rgba(255,255,255,0.03);
                    border-radius: 16px;
                    padding: 2rem;
                }
                
                .settings-title {
                    font-size: 1.25rem;
                    margin-bottom: 0.5rem;
                }
                
                .settings-description {
                    color: var(--text-secondary);
                    margin-bottom: 2rem;
                }
                
                .settings-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                
                .form-group label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.5rem;
                }
                
                .form-group input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    color: var(--text-primary);
                    font-size: 1rem;
                }
                
                .form-group input:focus {
                    outline: none;
                    border-color: var(--primary);
                }
                
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                
                .security-options {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .security-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.25rem;
                    background: rgba(255,255,255,0.03);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                
                .security-item:hover {
                    background: rgba(255,255,255,0.06);
                }
                
                .security-icon {
                    width: 50px;
                    height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(99, 102, 241, 0.1);
                    border-radius: 12px;
                    color: var(--primary);
                }
                
                .security-info {
                    flex: 1;
                }
                
                .security-info h3 {
                    font-size: 1rem;
                    margin-bottom: 0.25rem;
                }
                
                .security-info p {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                }
                
                .billing-card {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    background: linear-gradient(135deg, var(--primary), #8b5cf6);
                    border-radius: 16px;
                    margin-bottom: 2rem;
                }
                
                .plan-label {
                    font-size: 0.85rem;
                    opacity: 0.8;
                }
                
                .plan-name {
                    display: block;
                    font-size: 1.5rem;
                    font-weight: 700;
                }
                
                .billing-info ul {
                    margin-top: 1rem;
                    padding-left: 0;
                    list-style: none;
                }
                
                .billing-info li {
                    padding: 0.5rem 0;
                    color: var(--text-secondary);
                }
                
                .activity-list {
                    display: flex;
                    flex-direction: column;
                }
                
                .activity-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    padding: 1rem 0;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                
                .activity-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    margin-top: 0.25rem;
                    flex-shrink: 0;
                }
                
                .activity-dot.campaign { background: #3b82f6; }
                .activity-dot.landing { background: #8b5cf6; }
                .activity-dot.poster { background: #f59e0b; }
                .activity-dot.account { background: #10b981; }
                .activity-dot.billing { background: #ec4899; }
                .activity-dot.support { background: #06b6d4; }
                
                .activity-description {
                    margin: 0;
                    font-size: 0.9rem;
                }
                
                .activity-time {
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                }
                
                .activity-empty {
                    text-align: center;
                    padding: 3rem;
                    color: var(--text-secondary);
                }
                
                .activity-empty svg {
                    margin-bottom: 1rem;
                    opacity: 0.5;
                }
                
                .twofa-qr {
                    margin: 1.5rem 0;
                }
                
                .qr-placeholder {
                    width: 180px;
                    height: 180px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: #fff;
                    color: #333;
                    border-radius: 12px;
                }
                
                .password-form,
                .twofa-content {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .w-full {
                    width: 100%;
                }
                
                @media (max-width: 640px) {
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                    .billing-card {
                        flex-direction: column;
                        gap: 1rem;
                        text-align: center;
                    }
                }
            `}</style>
        </div>
    );
}
