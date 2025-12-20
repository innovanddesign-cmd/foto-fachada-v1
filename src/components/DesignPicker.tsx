import { Layout, Check, Lock } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import './DesignPicker.css';

interface TemplatePreview {
    id: 'modern' | 'minimal' | 'bold' | 'elegant';
    name: string;
    description: string;
    preview: string;
    isPremium: boolean;
}

const TEMPLATES: TemplatePreview[] = [
    {
        id: 'modern',
        name: 'Moderno',
        description: 'Diseño limpio y profesional para cualquier negocio',
        preview: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        isPremium: false
    },
    {
        id: 'minimal',
        name: 'Innova / Dark',
        description: 'Estilo nocturno con texturas y acentos de neón (Innova style)',
        preview: 'linear-gradient(135deg, #232526 0%, #414345 100%)', // Approximate dark texture feel
        isPremium: false
    },
    {
        id: 'bold',
        name: 'Tropical / Mango',
        description: 'Vibrante, divertido y con ondas (Mango Mania style)',
        preview: 'linear-gradient(135deg, #FDBB2D 0%, #22C1C3 100%)', // Gold to Teal
        isPremium: true
    },
    {
        id: 'elegant',
        name: 'Corporate / Tech',
        description: 'Sofisticado, azulado y digital (GMCE style)',
        preview: 'linear-gradient(180deg, #00c6ff 0%, #0072ff 100%)',
        isPremium: true
    }
];

export function DesignPicker() {
    const { selectedTemplate, setSelectedTemplate, userTier, brandData } = useAppStore();

    const canAccessPremium = userTier !== 'free';

    const handleSelectTemplate = (template: TemplatePreview) => {
        if (template.isPremium && !canAccessPremium) {
            return; // Can't select premium template
        }
        setSelectedTemplate(template.id);
    };

    return (
        <div className="design-picker animate-fadeIn">
            <div className="section-header">
                <Layout className="section-icon text-primary" />
                <h2>Elige un diseño</h2>
                <p className="text-muted">Selecciona el estilo de tu landing page</p>
            </div>

            <div className="templates-grid">
                {TEMPLATES.map((template) => {
                    const isSelected = selectedTemplate === template.id;
                    const isLocked = template.isPremium && !canAccessPremium;

                    return (
                        <div
                            key={template.id}
                            className={`template-card ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}
                            onClick={() => handleSelectTemplate(template)}
                        >
                            <div
                                className="template-preview"
                                style={{ background: template.preview }}
                            >
                                {/* Mini preview of landing structure */}
                                <div className="preview-content">
                                    <div
                                        className="preview-header"
                                        style={{
                                            background: brandData?.colors.primary || '#6366F1',
                                            opacity: 0.9
                                        }}
                                    >
                                        <div className="preview-logo" />
                                        <div className="preview-title" />
                                    </div>
                                    <div className="preview-links">
                                        <div className="preview-link" />
                                        <div className="preview-link" />
                                        <div className="preview-link" />
                                    </div>
                                </div>

                                {isLocked && (
                                    <div className="locked-overlay">
                                        <Lock size={24} />
                                        <span>Premium</span>
                                    </div>
                                )}

                                {isSelected && !isLocked && (
                                    <div className="selected-badge">
                                        <Check size={20} />
                                    </div>
                                )}
                            </div>

                            <div className="template-info">
                                <h3 className="template-name">
                                    {template.name}
                                    {template.isPremium && <span className="premium-tag">PRO</span>}
                                </h3>
                                <p className="template-description">{template.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {!canAccessPremium && (
                <div className="upgrade-prompt">
                    <Lock size={18} />
                    <p>Actualiza a <strong>Plan Plus</strong> para acceder a todos los diseños</p>
                    <button className="btn btn-primary">
                        Ver planes
                    </button>
                </div>
            )}
        </div>
    );
}
