/**
 * AdaptiveConfigStep - Estado ADAPTIVE_CONFIG
 * ============================================
 * Formulario dinámico que lee el UI Schema y genera campos adaptativos.
 * Incluye live preview y sugerencias de IA pre-rellenadas.
 */

import { useCallback, useState, useMemo, useEffect } from 'react';
import { Check, ChevronLeft, ChevronRight, Building, AlertCircle } from 'lucide-react';
import { useEscaparateStore, type ConfigFormData } from '../../store/escaparateStore';
import { useAppStore } from '../../store/appStore';
import { Button } from '../ui/Button';
import { LivePreviewPanel } from './LivePreviewPanel';
import {
    schemaToFormSchema,
    validateFormValues,
    getInitialValues,
    generateFinalConfig,
    type AdaptiveFormSchema,
    type FormStep,
    type FormGroup
} from '../../services/formSchemaEngine';
import './AdaptiveConfigStep.css';

// Iconos por tipo de campo
const FIELD_ICONS: Record<string, string> = {
    tel: '📞',
    url: '🔗',
    email: '✉️',
    text: '✏️',
    textarea: '📝',
    number: '🔢',
    file: '📁',
    list: '📋'
};

export function AdaptiveConfigStep() {
    const { currentState, updateConfig, completeDeploy } = useEscaparateStore();
    const { brandData } = useAppStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    // Obtener datos del estado actual
    const escaparateData = currentState.step === 'ADAPTIVE_CONFIG' ? currentState.data : null;
    const uiSchema = escaparateData?.uiSchema || null;
    const brandIdentity = escaparateData?.brandIdentity || null;

    // Generar schema del formulario desde el UI Schema
    const formSchema = useMemo<AdaptiveFormSchema | null>(() => {
        if (!uiSchema) return null;
        return schemaToFormSchema(uiSchema);
    }, [uiSchema]);

    // Valores iniciales pre-rellenados con sugerencias de IA
    const initialValues = useMemo(() => {
        if (!formSchema) return {};
        return getInitialValues(formSchema);
    }, [formSchema]);

    const [formValues, setFormValues] = useState<Record<string, string>>(initialValues);

    // Actualizar formValues cuando cambia initialValues
    useEffect(() => {
        if (Object.keys(initialValues).length > 0) {
            setFormValues(prev => ({
                ...initialValues,
                ...prev  // Mantener valores ya editados
            }));
        }
    }, [initialValues]);

    // Paso actual
    const currentStep: FormStep | null = formSchema?.steps[currentStepIndex] || null;
    const totalSteps = formSchema?.steps.length || 1;
    const isLastStep = currentStepIndex === totalSteps - 1;

    // ─── HANDLERS ───────────────────────────────────────────────

    const handleFieldChange = useCallback((fieldKey: string, value: string) => {
        setFormValues(prev => ({ ...prev, [fieldKey]: value }));
        // Limpiar error al editar
        if (errors[fieldKey]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldKey];
                return newErrors;
            });
        }
    }, [errors]);

    const handleNextStep = useCallback(() => {
        if (currentStepIndex < totalSteps - 1) {
            setCurrentStepIndex(prev => prev + 1);
        }
    }, [currentStepIndex, totalSteps]);

    const handlePrevStep = useCallback(() => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    }, [currentStepIndex]);

    const handleSubmit = useCallback(async () => {
        if (!formSchema) return;

        // Validar formulario completo
        const { valid, errors: validationErrors } = validateFormValues(formSchema, formValues);
        if (!valid) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            // Generar configuración final
            const finalConfig = generateFinalConfig(formSchema, formValues);

            // Guardar configuración
            updateConfig(formValues as Partial<ConfigFormData>);

            // Simular tiempo de deploy
            await new Promise(r => setTimeout(r, 1500));

            // Generar URL final
            const businessName = escaparateData?.brandData?.name || brandData?.name || 'demo';
            const landingUrl = `${window.location.origin}/p/${businessName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

            completeDeploy({
                landingUrl,
                posterPdfUrl: '#',
                qrCodeImage: '#',
                publishedAt: new Date(),
                success: true
            });

            console.log('[AdaptiveConfig] ✅ Deploy completado:', finalConfig);

        } catch (error) {
            console.error('[AdaptiveConfig] Error:', error);
            setErrors({ submit: 'Error al publicar. Inténtalo de nuevo.' });
        }

        setIsSubmitting(false);
    }, [formSchema, formValues, updateConfig, completeDeploy, escaparateData, brandData]);

    // ─── RENDER FIELD ──────────────────────────────────────────

    const renderField = useCallback((group: FormGroup, field: typeof group.fields[0]) => {
        const fieldKey = `${group.component_id}_${field.key}`;
        const hasError = !!errors[fieldKey];
        const hasValue = !!formValues[fieldKey];
        const icon = FIELD_ICONS[field.type] || '✏️';

        return (
            <div
                key={fieldKey}
                className={`config-step__field ${hasError ? 'config-step__field--error' : ''} ${hasValue ? 'config-step__field--filled' : ''}`}
            >
                <label className="config-step__label">
                    <span className="config-step__label-icon">{icon}</span>
                    <span>{field.label}</span>
                    {field.required && <span className="config-step__required">*</span>}
                </label>

                {field.type === 'textarea' ? (
                    <textarea
                        value={formValues[fieldKey] || ''}
                        onChange={e => handleFieldChange(fieldKey, e.target.value)}
                        placeholder={field.placeholder}
                        className="config-step__textarea"
                        rows={3}
                    />
                ) : (
                    <input
                        type={field.type === 'tel' ? 'tel' : field.type === 'number' ? 'number' : field.type === 'url' ? 'url' : 'text'}
                        value={formValues[fieldKey] || ''}
                        onChange={e => handleFieldChange(fieldKey, e.target.value)}
                        placeholder={field.placeholder}
                        className="config-step__input"
                    />
                )}

                {hasError && (
                    <span className="config-step__error">
                        <AlertCircle size={14} />
                        {errors[fieldKey]}
                    </span>
                )}
            </div>
        );
    }, [formValues, errors, handleFieldChange]);

    // ─── RENDER ─────────────────────────────────────────────────

    // Fallback si no hay UISchema
    if (!formSchema || !currentStep) {
        return (
            <div className="config-step config-step--loading">
                <div className="config-step__header">
                    <h1>⚙️ Configurando tu Escaparate</h1>
                    <p>Preparando el formulario personalizado...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="config-step config-step--with-preview">
            {/* Panel principal del formulario */}
            <div className="config-step__main">
                <div className="config-step__header">
                    <h1 className="config-step__title">
                        {currentStep.icon} {currentStep.title}
                    </h1>
                    <p className="config-step__description">
                        Completa los datos para que tu escaparate cobre vida.
                        {brandIdentity?.tono_copywriting === 'casual' && ' ¡Ya casi está listo!'}
                    </p>

                    {/* Indicador de pasos */}
                    {formSchema.uses_stepper && (
                        <div className="config-step__stepper">
                            {formSchema.steps.map((step, idx) => (
                                <div
                                    key={step.id}
                                    className={`config-step__stepper-item ${idx === currentStepIndex ? 'config-step__stepper-item--active' : ''} ${idx < currentStepIndex ? 'config-step__stepper-item--completed' : ''}`}
                                    onClick={() => idx < currentStepIndex && setCurrentStepIndex(idx)}
                                >
                                    <span className="config-step__stepper-icon">{step.icon}</span>
                                    <span className="config-step__stepper-label">{step.title}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <form className="config-step__form" onSubmit={e => e.preventDefault()}>
                    {currentStep.groups.map(group => (
                        <div key={group.component_id} className="config-step__group">
                            <div className="config-step__group-header">
                                <span className="config-step__group-icon">{group.icon}</span>
                                <div className="config-step__group-info">
                                    <h3 className="config-step__group-title">{group.title}</h3>
                                    <p className="config-step__group-description">{group.description}</p>
                                </div>
                            </div>
                            <div className="config-step__group-fields">
                                {group.fields.map(field => renderField(group, field))}
                            </div>
                        </div>
                    ))}

                    {errors.submit && (
                        <div className="config-step__submit-error">
                            <AlertCircle size={16} />
                            {errors.submit}
                        </div>
                    )}

                    <div className="config-step__actions">
                        {formSchema.uses_stepper && currentStepIndex > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handlePrevStep}
                                leftIcon={<ChevronLeft size={18} />}
                            >
                                Anterior
                            </Button>
                        )}

                        {formSchema.uses_stepper && !isLastStep ? (
                            <Button
                                type="button"
                                variant="primary"
                                onClick={handleNextStep}
                                rightIcon={<ChevronRight size={18} />}
                            >
                                Siguiente
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                variant="primary"
                                size="lg"
                                disabled={isSubmitting}
                                onClick={handleSubmit}
                                leftIcon={isSubmitting ? <Building size={18} className="animate-spin" /> : <Check size={18} />}
                                className="config-step__submit"
                            >
                                {isSubmitting ? 'Publicando...' : 'Publicar Mi Escaparate'}
                            </Button>
                        )}
                    </div>
                </form>

                {/* Indicador de progreso */}
                <div className="config-step__progress">
                    <span>
                        {Object.values(formValues).filter(v => v?.trim()).length} / {formSchema.total_fields} campos completados
                    </span>
                </div>
            </div>

            {/* Panel de live preview */}
            <div className="config-step__preview">
                <LivePreviewPanel
                    schema={uiSchema}
                    brandIdentity={brandIdentity}
                    formValues={formValues}
                />
            </div>
        </div>
    );
}
