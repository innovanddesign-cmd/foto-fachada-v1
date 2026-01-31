/**
 * Configurator Wizard
 * ====================
 * Main component for the 3.5 Dynamic Configurator step.
 * Integrates DynamicForm and LivePreview.
 */
import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DynamicForm } from './DynamicForm';
import { LivePreview } from './LivePreview';
import type { ClientStrategy } from '../../../services/strategyService';
import { saveProposal } from '../../../services/proposalService';
import { Button } from '../../ui/Button';
import './ConfiguratorWizard.css';

interface ConfiguratorWizardProps {
    strategy: ClientStrategy;
    campaignId: string;
    onBack?: () => void;
    onComplete?: () => void;
}

export function ConfiguratorWizard({ strategy, campaignId, onBack, onComplete }: ConfiguratorWizardProps) {
    const { t } = useTranslation();
    const [values, setValues] = useState<Record<string, any>>({});
    const [saving, setSaving] = useState(false);

    // Initialize default values
    useEffect(() => {
        if (strategy && strategy.ui_config_schema) {
            const defaults: Record<string, any> = {};
            strategy.ui_config_schema.forEach((field) => {
                defaults[field.key] = field.default || '';
            });
            setValues(defaults);
        }
    }, [strategy]);

    const handleFieldChange = (key: string, value: any) => {
        setValues((prev) => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await saveProposal({
                campaign_id: campaignId,
                strategy_id: strategy.id,
                title: strategy.title,
                description: strategy.description,
                visual_mechanic: strategy.visual_mechanic,
                ui_config: values,
                code_template: strategy.code_template,
                status: 'saved'
            });

            if (onComplete) {
                onComplete();
            }
        } catch (error) {
            console.error('Failed to save configuration', error);
            // Ideally show toast error
            alert(t('common.error', 'Error al guardar la configuración'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="configurator-wizard">
            <div className="configurator-header">
                <button onClick={onBack} className="back-btn">
                    <ArrowLeft size={20} />
                    <span>{t('common.back', 'Volver')}</span>
                </button>
                <div className="steps-indicator">
                    <span className="step active">1. Configuración</span>
                    <span className="step-divider">/</span>
                    <span className="step">2. Landing</span>
                </div>
                <div className="spacer"></div>
            </div>

            <div className="configurator-content">
                <div className="config-panel left-panel">
                    <div className="panel-header">
                        <h2>{t('configurator.customize', 'Personaliza tu Estrategia')}</h2>
                        <p>{t('configurator.subtitle', 'Ajusta los textos y colores para que encajen con tu marca.')}</p>
                    </div>

                    <div className="form-wrapper custom-scrollbar">
                        <DynamicForm
                            schema={strategy.ui_config_schema}
                            values={values}
                            onChange={handleFieldChange}
                        />
                    </div>

                    <div className="panel-footer">
                        <Button
                            variant="primary"
                            className="w-full"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                'Guardando...'
                            ) : (
                                <>
                                    <Save size={18} className="mr-2" />
                                    {t('configurator.save_and_continue', 'Guardar y Continuar')}
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="config-panel right-panel">
                    <LivePreview
                        codeTemplate={strategy.code_template}
                        values={values}
                        title={strategy.title}
                    />
                </div>
            </div>
        </div>
    );
}
