/**
 * Help Center Component
 * ======================
 * FAQs, WhatsApp support with client_id
 */
import { useState } from 'react';
import {
    HelpCircle,
    MessageCircle,
    ChevronDown,
    ChevronUp,
    // ExternalLink,
    Search
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useAppStore } from '../../store/appStore';
import { activity } from '../../services/activityLogService';

// ─────────────────────────────────────────────────────────────
// FAQ DATA
// ─────────────────────────────────────────────────────────────

const faqs = [
    {
        category: 'General',
        questions: [
            {
                q: '¿Cómo creo mi primera campaña?',
                a: 'Sube una foto de tu fachada o producto, nuestra IA analizará tu negocio y generará estrategias de marketing personalizadas. Selecciona la que más te guste y genera tu landing y cartel en un clic.'
            },
            {
                q: '¿Cuánto tiempo tardan en generarse las landings?',
                a: 'Las landings se generan en menos de 30 segundos. Los carteles en PDF de alta resolución tardan aproximadamente 1 minuto.'
            },
            {
                q: '¿Puedo editar mi landing después de crearla?',
                a: 'Sí, puedes solicitar cambios de textos, fotos o precios. Cada edición consume un crédito de actualización de tu plan.'
            }
        ]
    },
    {
        category: 'Facturación',
        questions: [
            {
                q: '¿Cómo cambio de plan?',
                a: 'Ve a Configuración > Facturación > Gestionar Suscripción. Desde ahí puedes hacer upgrade o downgrade de tu plan en cualquier momento.'
            },
            {
                q: '¿Cómo cancelo mi suscripción?',
                a: 'Desde el portal de facturación puedes cancelar tu suscripción. Mantendrás el acceso hasta el final del período ya pagado.'
            },
            {
                q: '¿Puedo obtener un reembolso?',
                a: 'Ofrecemos reembolso completo durante los primeros 7 días si no estás satisfecho. Contacta con soporte para procesarlo.'
            }
        ]
    },
    {
        category: 'Carteles y QR',
        questions: [
            {
                q: '¿Qué resolución tienen los carteles?',
                a: 'Los carteles se generan a 300 DPI en formato A4, listos para impresión profesional en cualquier imprenta.'
            },
            {
                q: '¿Cómo funciona el QR?',
                a: 'El código QR dirige a tu landing page personalizada. Cada escaneo se registra en tus estadísticas del dashboard.'
            },
            {
                q: '¿Puedo incluir mi logo en el QR?',
                a: 'Sí, nuestro QR estilizado incluye la inicial de tu negocio en el centro. En el plan Pro puedes subir tu logo completo.'
            }
        ]
    },
    {
        category: 'Soporte',
        questions: [
            {
                q: '¿Cuál es el horario de soporte?',
                a: 'Nuestro equipo está disponible de Lunes a Viernes de 9:00 a 19:00 (hora española). Vía WhatsApp respondemos en menos de 2 horas.'
            },
            {
                q: '¿Cómo contacto con soporte?',
                a: 'Usa el botón de chat en la esquina inferior derecha o escríbenos directamente a nuestro WhatsApp. Tu ID de cliente se envía automáticamente.'
            }
        ]
    }
];

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export function HelpCenter() {
    const { user } = useAppStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    const clientId = user?.id || 'guest';

    // WhatsApp number (replace with actual)
    const whatsappNumber = '34600000000';

    const handleContactSupport = () => {
        const message = encodeURIComponent(
            `Hola, necesito ayuda con mi cuenta.\n\n🆔 ID Cliente: ${clientId}\n📧 Email: ${user?.email || 'No registrado'}`
        );
        window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
        activity.supportContacted();
    };

    const toggleItem = (itemId: string) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(itemId)) {
            newExpanded.delete(itemId);
        } else {
            newExpanded.add(itemId);
        }
        setExpandedItems(newExpanded);
    };

    // Filter FAQs based on search
    const filteredFaqs = faqs.map(category => ({
        ...category,
        questions: category.questions.filter(
            q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                q.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(category => category.questions.length > 0);

    return (
        <div className="help-center">
            {/* Header */}
            <div className="help-header">
                <div className="help-icon">
                    <HelpCircle size={32} />
                </div>
                <h1>Centro de Ayuda</h1>
                <p>¿Tienes alguna pregunta? Estamos aquí para ayudarte.</p>
            </div>

            {/* Search */}
            <div className="help-search">
                <Search size={20} />
                <input
                    type="text"
                    placeholder="Buscar en las preguntas frecuentes..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Quick Actions */}
            <div className="help-actions">
                <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<MessageCircle size={20} />}
                    onClick={handleContactSupport}
                    className="contact-btn"
                >
                    Chat con Soporte
                </Button>
                <p className="help-note">
                    Tu ID de cliente <code>{clientId.slice(0, 8)}...</code> se enviará automáticamente
                </p>
            </div>

            {/* FAQs */}
            <div className="faq-sections">
                {filteredFaqs.map(category => (
                    <div key={category.category} className="faq-category">
                        <h2 className="faq-category-title">{category.category}</h2>
                        <div className="faq-list">
                            {category.questions.map((item, index) => {
                                const itemId = `${category.category}-${index}`;
                                const isExpanded = expandedItems.has(itemId);

                                return (
                                    <div key={itemId} className={`faq-item ${isExpanded ? 'expanded' : ''}`}>
                                        <button
                                            className="faq-question"
                                            onClick={() => toggleItem(itemId)}
                                        >
                                            <span>{item.q}</span>
                                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </button>
                                        {isExpanded && (
                                            <div className="faq-answer">
                                                {item.a}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {searchQuery && filteredFaqs.length === 0 && (
                <div className="no-results">
                    <p>No encontramos resultados para "{searchQuery}"</p>
                    <Button variant="secondary" onClick={handleContactSupport}>
                        Contactar con Soporte
                    </Button>
                </div>
            )}

            <style>{`
                .help-center {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 2rem;
                }
                
                .help-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                
                .help-icon {
                    width: 70px;
                    height: 70px;
                    margin: 0 auto 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, var(--primary), #8b5cf6);
                    border-radius: 20px;
                    color: #fff;
                }
                
                .help-header h1 {
                    font-size: 1.75rem;
                    margin-bottom: 0.5rem;
                }
                
                .help-header p {
                    color: var(--text-secondary);
                }
                
                .help-search {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem 1.25rem;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    margin-bottom: 2rem;
                }
                
                .help-search input {
                    flex: 1;
                    background: none;
                    border: none;
                    color: var(--text-primary);
                    font-size: 1rem;
                    outline: none;
                }
                
                .help-search svg {
                    color: var(--text-secondary);
                }
                
                .help-actions {
                    text-align: center;
                    margin-bottom: 3rem;
                    padding: 2rem;
                    background: rgba(99, 102, 241, 0.1);
                    border-radius: 16px;
                }
                
                .contact-btn {
                    margin-bottom: 1rem;
                }
                
                .help-note {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                }
                
                .help-note code {
                    background: rgba(255,255,255,0.1);
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                    font-family: monospace;
                }
                
                .faq-category {
                    margin-bottom: 2rem;
                }
                
                .faq-category-title {
                    font-size: 1rem;
                    color: var(--text-secondary);
                    margin-bottom: 1rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .faq-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                
                .faq-item {
                    background: rgba(255,255,255,0.03);
                    border-radius: 12px;
                    overflow: hidden;
                    transition: background 0.2s;
                }
                
                .faq-item:hover {
                    background: rgba(255,255,255,0.05);
                }
                
                .faq-item.expanded {
                    background: rgba(255,255,255,0.05);
                }
                
                .faq-question {
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.25rem;
                    background: none;
                    border: none;
                    color: var(--text-primary);
                    font-size: 0.95rem;
                    text-align: left;
                    cursor: pointer;
                }
                
                .faq-question span {
                    flex: 1;
                    padding-right: 1rem;
                }
                
                .faq-answer {
                    padding: 0 1.25rem 1.25rem;
                    color: var(--text-secondary);
                    line-height: 1.6;
                    animation: fadeIn 0.2s ease;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .no-results {
                    text-align: center;
                    padding: 2rem;
                    color: var(--text-secondary);
                }
                
                .no-results p {
                    margin-bottom: 1rem;
                }
            `}</style>
        </div>
    );
}
