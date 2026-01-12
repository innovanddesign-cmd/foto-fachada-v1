/**
 * ActionConfigForm
 * ================
 * No-Code configuration form for strategic actions.
 * Dynamically generates form fields based on the action's configSchema.
 * Includes live preview of the generated page.
 */
import { useState, useEffect, useCallback } from 'react';
import {
    ArrowLeft,
    Check,
    Loader2,
    Eye,
    Settings2,
    Sparkles,
    Wand2
} from 'lucide-react';
import { Button } from '../ui/Button';
import { WidgetConfigurator } from './WidgetConfigurator';
import type { StrategicAction, StrategicCategory } from '../../data/strategicCategories';
import type { BrandData } from '../../types';
import './ActionConfigForm.css';

interface ActionConfigFormProps {
    action: StrategicAction;
    category: StrategicCategory;
    brandData: BrandData | null;
    onBack: () => void;
    onConfirm: (config: Record<string, any>) => void;
    isLoading?: boolean;
}

export function ActionConfigForm({
    action,
    category,
    brandData,
    onBack,
    onConfirm,
    isLoading = false
}: ActionConfigFormProps) {
    const [config, setConfig] = useState<Record<string, any>>({});
    const [activeTab, setActiveTab] = useState<'config' | 'preview'>('config');
    const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
    const [previewHtml, setPreviewHtml] = useState<string>('');

    // Initialize config with defaults
    useEffect(() => {
        const initialConfig: Record<string, any> = {};
        action.configSchema.forEach(field => {
            initialConfig[field.key] = field.default || '';
        });
        setConfig(initialConfig);
    }, [action]);

    // Generate preview HTML whenever config changes
    useEffect(() => {
        if (Object.keys(config).length === 0) return;

        setIsGeneratingPreview(true);

        // Simulate preview generation (in production, this would call the actual generator)
        const timer = setTimeout(() => {
            const html = generatePreviewHtml(action, config, brandData, category);
            setPreviewHtml(html);
            setIsGeneratingPreview(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [config, action, brandData, category]);

    const handleConfigChange = useCallback((newConfig: Record<string, any>) => {
        setConfig(newConfig);
    }, []);

    const handleConfirm = useCallback(() => {
        onConfirm(config);
    }, [config, onConfirm]);

    // Check if form has required fields filled
    const isFormValid = action.configSchema.some(field => {
        const value = config[field.key];
        return value && value.toString().trim() !== '';
    });

    return (
        <div className="action-config-form">
            {/* Header */}
            <div className="config-header">
                <button className="back-btn" onClick={onBack} aria-label="Volver">
                    <ArrowLeft size={20} />
                </button>

                <div className="header-info">
                    <div className="header-badges">
                        <span
                            className="category-badge"
                            style={{
                                background: `linear-gradient(135deg, ${category.glowColor}, transparent)`
                            }}
                        >
                            {category.emoji} {category.title}
                        </span>
                    </div>
                    <h2 className="header-title">
                        <span className="action-emoji">{action.emoji}</span>
                        {action.name}
                    </h2>
                    <p className="header-description">{action.description}</p>
                </div>

                <Button
                    variant="primary"
                    onClick={handleConfirm}
                    disabled={!isFormValid || isLoading}
                    rightIcon={isLoading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                >
                    {isLoading ? 'Generando...' : 'Crear Página'}
                </Button>
            </div>

            {/* Main content */}
            <div className="config-content">
                {/* Left panel - Configuration */}
                <div className="config-panel">
                    {/* Tabs */}
                    <div className="panel-tabs">
                        <button
                            className={`tab ${activeTab === 'config' ? 'active' : ''}`}
                            onClick={() => setActiveTab('config')}
                        >
                            <Settings2 size={16} />
                            Configuración
                        </button>
                        <button
                            className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('preview')}
                        >
                            <Eye size={16} />
                            Vista Previa
                        </button>
                    </div>

                    {/* Tab content */}
                    <div className="panel-content">
                        {activeTab === 'config' && (
                            <div className="config-form-container">
                                <div className="form-intro">
                                    <Wand2 size={20} className="intro-icon" />
                                    <div>
                                        <h4>Personaliza tu página</h4>
                                        <p>Completa los campos para generar tu página {action.name.toLowerCase()}</p>
                                    </div>
                                </div>

                                <WidgetConfigurator
                                    schema={action.configSchema}
                                    onChange={handleConfigChange}
                                    initialValues={config}
                                />

                                {brandData && (
                                    <div className="brand-info-card">
                                        <Sparkles size={16} />
                                        <p>
                                            La página usará los colores y estilo de <strong>{brandData.name}</strong>
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'preview' && (
                            <div className="preview-container">
                                {isGeneratingPreview ? (
                                    <div className="preview-loading">
                                        <Loader2 size={32} className="animate-spin" />
                                        <p>Generando vista previa...</p>
                                    </div>
                                ) : (
                                    <div className="preview-frame">
                                        <div className="preview-header">
                                            <div className="preview-dots">
                                                <span className="dot red" />
                                                <span className="dot yellow" />
                                                <span className="dot green" />
                                            </div>
                                            <span className="preview-url">preview.fotofachada.com/{action.pageTemplate}</span>
                                        </div>
                                        <iframe
                                            srcDoc={previewHtml}
                                            title="Vista previa"
                                            className="preview-iframe"
                                            sandbox="allow-scripts"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Generates preview HTML based on action type and config
 */
function generatePreviewHtml(
    action: StrategicAction,
    config: Record<string, any>,
    brandData: BrandData | null,
    category: StrategicCategory
): string {
    const brandName = brandData?.name || 'Tu Negocio';

    const gradientMap: Record<string, string> = {
        VENTAS: 'linear-gradient(135deg, #f59e0b, #ef4444)',
        FIDELIZACION: 'linear-gradient(135deg, #10b981, #06b6d4)',
        AUTORIDAD: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
    };

    const gradient = gradientMap[category.id];

    // Base template
    let content = '';

    switch (action.pageTemplate) {
        case 'flash-offer':
            content = `
                <div class="offer-badge">⚡ OFERTA FLASH</div>
                <h1>${config.producto || 'Producto destacado'}</h1>
                <div class="prices">
                    <span class="original">${config.precio_original || '0'}€</span>
                    <span class="offer">${config.precio_oferta || '0'}€</span>
                </div>
                <p class="urgency">${config.mensaje_urgencia || '¡Oferta limitada!'}</p>
                <p class="timer">⏰ ${config.tiempo_limite || 'Solo hoy'}</p>
                <button class="cta">¡Lo quiero!</button>
            `;
            break;

        case 'discount-coupon':
            content = `
                <div class="discount-circle">
                    <span class="percentage">${config.porcentaje || '0'}%</span>
                    <span class="off">DTO</span>
                </div>
                <h1>Descuento Especial</h1>
                ${config.codigo_cupon ? `<div class="coupon-code">Código: <strong>${config.codigo_cupon}</strong></div>` : ''}
                <p class="applies-to">${config.productos_aplicables || 'En productos seleccionados'}</p>
                ${config.condiciones ? `<p class="conditions">* ${config.condiciones}</p>` : ''}
                <button class="cta">Usar cupón</button>
            `;
            break;

        case 'loyalty-points':
            content = `
                <div class="program-icon">🎯</div>
                <h1>${config.nombre_programa || 'Club de Puntos'}</h1>
                <div class="points-info">
                    <p>Por cada euro, ganas <strong>${config.puntos_por_euro || '1'} punto</strong></p>
                    <p class="reward">Con ${config.puntos_recompensa || '100'} puntos: <strong>${config.recompensa || 'Recompensa'}</strong></p>
                </div>
                <button class="cta">Unirme gratis</button>
            `;
            break;

        case 'vip-club':
            const benefits = (config.beneficios || '').split('\n').filter(Boolean);
            content = `
                <div class="vip-crown">👑</div>
                <h1>${config.nombre_club || 'Club VIP'}</h1>
                <ul class="benefits">
                    ${benefits.map((b: string) => `<li>✓ ${b}</li>`).join('') || '<li>✓ Beneficios exclusivos</li>'}
                </ul>
                ${config.cuota ? `<p class="price">${config.cuota}€/mes</p>` : '<p class="price">¡Gratis!</p>'}
                <button class="cta">${config.cta || 'Hazte VIP'}</button>
            `;
            break;

        case 'expert-guide':
            const steps = (config.pasos || '').split('\n').filter(Boolean);
            content = `
                <div class="guide-icon">📚</div>
                <h1>${config.titulo_guia || 'Guía de Experto'}</h1>
                <p class="intro">${config.introduccion || ''}</p>
                <ol class="steps">
                    ${steps.map((s: string) => `<li>${s}</li>`).join('') || '<li>Contenido de la guía...</li>'}
                </ol>
                <button class="cta">${config.cta_final || 'Consúltanos'}</button>
            `;
            break;

        case 'testimonials':
            content = `
                <h1>Lo que dicen nuestros clientes</h1>
                <div class="testimonials">
                    ${config.testimonio_1_nombre ? `
                        <div class="testimonial">
                            <p>"${config.testimonio_1_texto || ''}"</p>
                            <span class="author">— ${config.testimonio_1_nombre}</span>
                        </div>
                    ` : ''}
                    ${config.testimonio_2_nombre ? `
                        <div class="testimonial">
                            <p>"${config.testimonio_2_texto || ''}"</p>
                            <span class="author">— ${config.testimonio_2_nombre}</span>
                        </div>
                    ` : ''}
                </div>
                <button class="cta">${config.cta || 'Únete a ellos'}</button>
            `;
            break;

        default:
            content = `
                <h1>${action.name}</h1>
                <p>${action.description}</p>
                <button class="cta">Continuar</button>
            `;
    }

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body {
                    font-family: 'Inter', -apple-system, sans-serif;
                    background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
                    color: #f8fafc;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    text-align: center;
                }
                h1 { 
                    font-size: 1.75rem; 
                    font-weight: 800; 
                    margin-bottom: 1rem;
                    background: ${gradient};
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                p { color: #94a3b8; margin-bottom: 0.75rem; }
                .offer-badge, .discount-circle, .program-icon, .vip-crown, .guide-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }
                .offer-badge {
                    background: ${gradient};
                    color: white;
                    padding: 0.5rem 1.5rem;
                    border-radius: 100px;
                    font-size: 0.9rem;
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                }
                .prices { margin: 1rem 0; }
                .original { 
                    text-decoration: line-through; 
                    color: #64748b; 
                    font-size: 1.25rem;
                    margin-right: 0.5rem;
                }
                .offer { 
                    font-size: 2.5rem; 
                    font-weight: 800; 
                    color: #f59e0b; 
                }
                .urgency { color: #f87171; font-weight: 600; }
                .timer { color: #94a3b8; font-size: 0.9rem; margin: 0.5rem 0 1.5rem; }
                .discount-circle {
                    width: 120px;
                    height: 120px;
                    background: ${gradient};
                    border-radius: 50%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                }
                .percentage { font-size: 2rem; font-weight: 800; color: white; }
                .off { font-size: 0.9rem; color: rgba(255,255,255,0.8); }
                .coupon-code {
                    background: rgba(99, 102, 241, 0.2);
                    border: 2px dashed #6366f1;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    margin: 1rem 0;
                    font-family: monospace;
                }
                .applies-to { font-size: 0.85rem; }
                .conditions { font-size: 0.75rem; color: #64748b; }
                .points-info { margin: 1.5rem 0; }
                .reward { color: #10b981; font-size: 1.1rem; margin-top: 0.5rem; }
                .benefits { 
                    list-style: none; 
                    text-align: left; 
                    margin: 1.5rem 0;
                    padding: 0 1rem;
                }
                .benefits li { 
                    padding: 0.5rem 0; 
                    border-bottom: 1px solid rgba(100,116,139,0.2);
                    color: #e2e8f0;
                }
                .price { font-size: 1.5rem; font-weight: 700; color: #10b981; margin: 1rem 0; }
                .steps { 
                    text-align: left; 
                    margin: 1.5rem 0; 
                    padding-left: 1.5rem;
                    color: #cbd5e1;
                }
                .steps li { padding: 0.5rem 0; }
                .testimonials { margin: 1.5rem 0; }
                .testimonial {
                    background: rgba(71, 85, 105, 0.2);
                    border-radius: 12px;
                    padding: 1.25rem;
                    margin-bottom: 1rem;
                    text-align: left;
                }
                .testimonial p { color: #e2e8f0; font-style: italic; }
                .author { color: #6366f1; font-weight: 600; font-size: 0.9rem; }
                .cta {
                    background: ${gradient};
                    color: white;
                    border: none;
                    padding: 1rem 2.5rem;
                    font-size: 1rem;
                    font-weight: 700;
                    border-radius: 12px;
                    cursor: pointer;
                    margin-top: 1rem;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .cta:hover {
                    transform: scale(1.05);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                .brand-footer {
                    margin-top: 2rem;
                    font-size: 0.8rem;
                    color: #64748b;
                }
            </style>
        </head>
        <body>
            ${content}
            <p class="brand-footer">Powered by ${brandName}</p>
        </body>
        </html>
    `;
}
