import { Layout, Check, Lock, Sparkles } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import './DesignPickerV3.css';

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
        description: 'Diseño limpio y profesional',
        preview: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        isPremium: false
    },
    {
        id: 'minimal',
        name: 'Innova / Dark',
        description: 'Estilo nocturno y neón',
        preview: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        isPremium: false
    },
    {
        id: 'bold',
        name: 'Tropical / Mango',
        description: 'Vibrante y divertido',
        preview: 'linear-gradient(135deg, #FDBB2D 0%, #22C1C3 100%)',
        isPremium: true
    },
    {
        id: 'elegant',
        name: 'Corporate / Tech',
        description: 'Sofisticado y tecnológico',
        preview: 'linear-gradient(180deg, #00c6ff 0%, #0072ff 100%)',
        isPremium: true
    }
];

export function DesignPickerV3() {
    const { selectedTemplate, setSelectedTemplate, userTier, brandData } = useAppStore();

    const canAccessPremium = userTier !== 'free';

    const handleSelectTemplate = (template: TemplatePreview) => {
        if (template.isPremium && !canAccessPremium) {
            return; // Can't select premium template
        }
        setSelectedTemplate(template.id);
    };

    return (
        <div className="design-picker-v3 glass-panel">
            <div className="section-header-v3">
                <div className="icon-wrapper">
                    <Layout size={24} className="text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Elige un diseño</h2>
                    <p className="text-sm text-gray-400">Selecciona el estilo visual para tu landing page</p>
                </div>
            </div>

            <div className="templates-grid-v3">
                {TEMPLATES.map((template) => {
                    const isSelected = selectedTemplate === template.id;
                    const isLocked = template.isPremium && !canAccessPremium;

                    return (
                        <div
                            key={template.id}
                            className={`template-card-v3 ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}
                            onClick={() => handleSelectTemplate(template)}
                        >
                            <div
                                className="template-preview-v3"
                                style={{ background: template.preview }}
                            >
                                {/* Mini preview of landing structure */}
                                <div className="preview-content-v3">
                                    <div
                                        className="preview-header-v3"
                                        style={{
                                            background: brandData?.colors.primary || '#6366F1',
                                            opacity: 0.9
                                        }}
                                    >
                                        <div className="preview-logo-v3" />
                                        <div className="preview-title-v3" />
                                    </div>
                                    <div className="preview-links-v3">
                                        <div className="preview-link-v3" />
                                        <div className="preview-link-v3" />
                                        <div className="preview-link-v3" />
                                    </div>
                                </div>

                                {isLocked && (
                                    <div className="locked-overlay-v3">
                                        <div className="lock-icon-circle">
                                            <Lock size={20} className="text-white" />
                                        </div>
                                        <span className="premium-text">
                                            <Sparkles size={12} fill="currentColor" /> Premium
                                        </span>
                                    </div>
                                )}

                                {isSelected && !isLocked && (
                                    <div className="selected-badge-v3">
                                        <Check size={18} className="text-white" />
                                    </div>
                                )}
                            </div>

                            <div className="template-info-v3">
                                <h3 className="template-name-v3">
                                    {template.name}
                                </h3>
                                <p className="template-description-v3">{template.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {!canAccessPremium && (
                <div className="upgrade-prompt-v3">
                    <Sparkles size={16} className="text-yellow-400" />
                    <span>Actualiza a <strong>Plan Plus</strong> para desbloquear diseños premium</span>
                </div>
            )}
        </div>
    );
}
