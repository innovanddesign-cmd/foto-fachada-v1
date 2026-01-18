/**
 * AnalysisStep - Estado ANALYSIS
 * Fase de procesamiento con feedback visual progresivo
 * Transición automática a SHOWCASE al completar
 */

import { useEffect, useState, useCallback } from 'react';
import { Sparkles, Brain, Palette, Target, Zap } from 'lucide-react';
import { useEscaparateStore, type EscaparateData } from '../../store/escaparateStore';
import { useAppStore } from '../../store/appStore';
import type { LandingPageConfig } from '../../types';
import './AnalysisStep.css';

// Fases del análisis con porcentajes
const ANALYSIS_PHASES = [
    { id: 'detect', label: 'Detectando marca y nombre...', icon: Brain, progress: 20 },
    { id: 'colors', label: 'Extrayendo paleta de colores...', icon: Palette, progress: 40 },
    { id: 'audience', label: 'Identificando audiencia objetivo...', icon: Target, progress: 60 },
    { id: 'design', label: 'Generando diseño de escaparate...', icon: Sparkles, progress: 80 },
    { id: 'final', label: 'Finalizando tu escaparate digital...', icon: Zap, progress: 100 },
];

export function AnalysisStep() {
    const { currentState, updateAnalysisProgress, completeAnalysis } = useEscaparateStore();
    const { setBrandData, setLinks, setLandingConfig } = useAppStore();

    const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    // Obtener progreso actual
    const progress = currentState.step === 'ANALYSIS' ? currentState.progress : 0;
    const currentPhase = currentState.step === 'ANALYSIS' ? currentState.currentPhase : '';

    // Ejecutar análisis
    const runAnalysis = useCallback(async () => {
        if (currentState.step !== 'ANALYSIS') return;

        const mediaUrls = currentState.mediaUrls;

        try {
            // Fase 1: Detectando ADN de marca
            updateAnalysisProgress(20, ANALYSIS_PHASES[0].label);
            setCurrentPhaseIndex(0);
            await delay(600);

            // Fase 2: Extrayendo paleta cromática
            updateAnalysisProgress(40, ANALYSIS_PHASES[1].label);
            setCurrentPhaseIndex(1);

            // Usar el nuevo motor de ADN de marca
            const { analyzeBrandDNA, getMockBrandDNA } = await import('../../services/brandDNAEngine');
            let brandResult;

            try {
                const { blobToBase64 } = await import('../../services/imageUtils');
                const base64Images = await Promise.all(
                    mediaUrls.map(url => blobToBase64(url))
                );
                brandResult = await analyzeBrandDNA(base64Images);
            } catch {
                console.log('[AnalysisStep] Usando datos mock para ADN de marca');
                brandResult = getMockBrandDNA();
            }

            if (!brandResult.success || !brandResult.brandData || !brandResult.identity) {
                brandResult = getMockBrandDNA();
            }

            const { brandData, identity: brandIdentity } = brandResult;

            // Actualizar store antiguo para compatibilidad
            setBrandData(brandData!);

            // Fase 3: Identificando audiencia y generando UI Schema
            updateAnalysisProgress(60, ANALYSIS_PHASES[2].label);
            setCurrentPhaseIndex(2);
            await delay(500);

            // Generar UI Schema dinámico
            const { generateUISchema, getMockUISchema } = await import('../../services/uiSchemaGenerator');
            let schemaResult;

            try {
                schemaResult = await generateUISchema(brandIdentity!, brandData!);
            } catch {
                console.log('[AnalysisStep] Usando schema mock');
                schemaResult = getMockUISchema(brandIdentity!, brandData!);
            }

            const uiSchema = schemaResult.schema;
            console.log('[AnalysisStep] UI Schema generado:', uiSchema?.variability_seed);

            // Fase 4: Generando diseño de landing
            updateAnalysisProgress(80, ANALYSIS_PHASES[3].label);
            setCurrentPhaseIndex(3);
            await delay(600);

            // Generar links y landing config para compatibilidad
            const { getMockLinks } = await import('../../services/marketingAgent');
            const links = getMockLinks();
            setLinks(links);

            // Generar landingConfig compatible usando la paleta cromática
            const landingConfig: LandingPageConfig = {
                background: {
                    type: 'gradient',
                    value: brandIdentity!.palette.gradiente_sugerido
                },
                header: {
                    logoSize: 90,
                    titleColor: '#ffffff',
                    subtitleColor: brandIdentity!.palette.color_superficie,
                    layout: 'centered'
                },
                buttons: {
                    style: 'glass',
                    background: brandIdentity!.palette.color_superficie,
                    textColor: '#ffffff',
                    shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
                },
                separators: {
                    top: 'none',
                    bottom: 'none',
                    color: brandIdentity!.palette.color_principal
                },
                font: `${brandIdentity!.fonts.headline}, ${brandIdentity!.fonts.body}, sans-serif`
            };

            setLandingConfig(landingConfig);

            // Fase 5: Finalización
            updateAnalysisProgress(100, ANALYSIS_PHASES[4].label);
            setCurrentPhaseIndex(4);
            await delay(400);

            // Completar análisis y transicionar a SHOWCASE
            const escaparateData: EscaparateData = {
                brandData: brandData!,
                brandIdentity,
                uiSchema,
                landingConfig,
                links,
                generatedAt: new Date(),
                version: 2  // Versión 2 con UI Schema generativo
            };

            setIsComplete(true);

            // Pequeño delay para mostrar el 100% antes de transicionar
            await delay(300);
            completeAnalysis(escaparateData);

        } catch (error) {
            console.error('[AnalysisStep] Error durante el análisis:', error);

            // Fallback completo con datos mock
            const { getMockBrandDNA } = await import('../../services/brandDNAEngine');
            const { getMockUISchema } = await import('../../services/uiSchemaGenerator');
            const { getMockLinks } = await import('../../services/marketingAgent');

            const brandResult = getMockBrandDNA();
            const { brandData, identity: brandIdentity } = brandResult;
            const schemaResult = getMockUISchema(brandIdentity!, brandData!);
            const links = getMockLinks();

            const landingConfig: LandingPageConfig = {
                background: {
                    type: 'gradient',
                    value: brandIdentity!.palette.gradiente_sugerido
                },
                header: {
                    logoSize: 90,
                    titleColor: '#ffffff',
                    subtitleColor: brandIdentity!.palette.color_superficie,
                    layout: 'centered'
                },
                buttons: {
                    style: 'glass',
                    background: brandIdentity!.palette.color_superficie,
                    textColor: '#ffffff',
                    shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
                },
                separators: {
                    top: 'none',
                    bottom: 'none',
                    color: brandIdentity!.palette.color_principal
                },
                font: `${brandIdentity!.fonts.headline}, ${brandIdentity!.fonts.body}, sans-serif`
            };

            setBrandData(brandData!);
            setLinks(links);
            setLandingConfig(landingConfig);

            const escaparateData: EscaparateData = {
                brandData: brandData!,
                brandIdentity,
                uiSchema: schemaResult.schema,
                landingConfig,
                links,
                generatedAt: new Date(),
                version: 2
            };

            completeAnalysis(escaparateData);
        }
    }, [currentState, updateAnalysisProgress, completeAnalysis, setBrandData, setLinks, setLandingConfig]);

    // Iniciar análisis al montar
    useEffect(() => {
        if (currentState.step === 'ANALYSIS' && currentState.progress === 0) {
            runAnalysis();
        }
    }, [currentState, runAnalysis]);

    const currentPhaseData = ANALYSIS_PHASES[currentPhaseIndex];
    const PhaseIcon = currentPhaseData?.icon || Sparkles;

    return (
        <div className="analysis-step">
            <div className="analysis-step__content">
                {/* Icono animado */}
                <div className={`analysis-step__icon ${isComplete ? 'analysis-step__icon--complete' : ''}`}>
                    <div className="analysis-step__icon-ring" />
                    <div className="analysis-step__icon-ring analysis-step__icon-ring--delayed" />
                    <PhaseIcon size={48} className="analysis-step__icon-inner" />
                </div>

                {/* Texto de fase */}
                <div className="analysis-step__phase">
                    <h2 className="analysis-step__title">
                        {isComplete ? '¡Escaparate listo!' : 'Analizando tu negocio'}
                    </h2>
                    <p className="analysis-step__label">
                        {currentPhase || ANALYSIS_PHASES[0].label}
                    </p>
                </div>

                {/* Barra de progreso */}
                <div className="analysis-step__progress">
                    <div className="analysis-step__progress-track">
                        <div
                            className="analysis-step__progress-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="analysis-step__progress-text">{progress}%</span>
                </div>

                {/* Indicadores de fase */}
                <div className="analysis-step__phases">
                    {ANALYSIS_PHASES.map((phase, index) => {
                        const Icon = phase.icon;
                        const isActive = index === currentPhaseIndex;
                        const isCompleted = index < currentPhaseIndex;

                        return (
                            <div
                                key={phase.id}
                                className={`analysis-step__phase-dot ${isActive ? 'analysis-step__phase-dot--active' : ''} ${isCompleted ? 'analysis-step__phase-dot--completed' : ''}`}
                            >
                                <Icon size={16} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// Helper
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
