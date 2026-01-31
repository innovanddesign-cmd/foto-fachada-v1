/**
 * EscaparateEngine - Motor de Escaparates Digitales Generativos
 * Componente orquestador principal que reemplaza la lógica de appView
 * SPA pura con transiciones elásticas <200ms
 */

import { useEffect, useMemo } from 'react';
import { useEscaparateStore, STEP_ORDER, STEP_LABELS } from '../store/escaparateStore';
import { startAutoSave, stopAutoSave, checkForRecoverableSession } from '../services/persistence';
import { StateTransition } from './ui/StateTransition';

// Importar pasos
import { UploadStep } from './steps/UploadStep';
import { AnalysisStep } from './steps/AnalysisStep';
import { ShowcaseStep } from './steps/ShowcaseStep';
import { PosterValidationStep } from './steps/PosterValidationStep';
import { AdaptiveConfigStep } from './steps/AdaptiveConfigStep';
import { DeployStep } from './steps/DeployStep';

import './EscaparateEngine.css';

// CSS imports para los steps
import './steps/UploadStep.css';
import './steps/AnalysisStep.css';
import './steps/ShowcaseStep.css';
import './steps/PosterValidationStep.css';
import './steps/AdaptiveConfigStep.css';
import './steps/DeployStep.css';
import './ui/StateTransition.css';

export function EscaparateEngine() {
    const store = useEscaparateStore();
    const { currentState, sessionId, isDirty, markSaved, stateHistory } = store;
    const currentStep = currentState.step;

    // ─── PERSISTENCIA AUTO-SAVE ─────────────────────────────────

    useEffect(() => {
        // Iniciar auto-guardado
        startAutoSave(
            () => ({ sessionId, currentState, stateHistory, isDirty }),
            markSaved
        );

        return () => stopAutoSave();
    }, [sessionId, currentState, stateHistory, isDirty, markSaved]);

    // ─── RECUPERACIÓN DE SESIÓN ─────────────────────────────────

    useEffect(() => {
        const checkRecovery = async () => {
            await checkForRecoverableSession();
            // La recuperación ya maneja el estado interno si es necesario
        };

        checkRecovery();
    }, []);

    // ─── INDICADOR DE PROGRESO ──────────────────────────────────

    const progressPercentage = useMemo(() => {
        const currentIndex = STEP_ORDER.indexOf(currentStep);
        return ((currentIndex + 1) / STEP_ORDER.length) * 100;
    }, [currentStep]);

    const stepInfo = useMemo(() => {
        const currentIndex = STEP_ORDER.indexOf(currentStep);
        return {
            current: currentIndex + 1,
            total: STEP_ORDER.length,
            label: STEP_LABELS[currentStep]
        };
    }, [currentStep]);

    // ─── RENDERIZADO DE PASO ACTUAL ─────────────────────────────

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 'UPLOAD':
                return <UploadStep />;
            case 'ANALYSIS':
                return <AnalysisStep />;
            case 'SHOWCASE':
                return <ShowcaseStep />;
            case 'POSTER_VALIDATION':
                return <PosterValidationStep />;
            case 'ADAPTIVE_CONFIG':
                return <AdaptiveConfigStep />;
            case 'DEPLOY':
                return <DeployStep />;
            default:
                return <UploadStep />;
        }
    };

    // Determinar dirección de animación
    const animationDirection = useMemo(() => {
        if (stateHistory.length < 2) return 'forward';
        const previousStep = stateHistory[stateHistory.length - 2];
        const prevIndex = STEP_ORDER.indexOf(previousStep);
        const currIndex = STEP_ORDER.indexOf(currentStep);
        return currIndex > prevIndex ? 'forward' : 'backward';
    }, [stateHistory, currentStep]);

    // ─── RENDER ─────────────────────────────────────────────────

    return (
        <div className="escaparate-engine">
            {/* Barra de progreso */}
            <div className="escaparate-engine__progress">
                <div className="escaparate-engine__progress-bar">
                    <div
                        className="escaparate-engine__progress-fill"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
                <div className="escaparate-engine__progress-info">
                    <span className="escaparate-engine__progress-step">
                        Paso {stepInfo.current} de {stepInfo.total}
                    </span>
                    <span className="escaparate-engine__progress-label">
                        {stepInfo.label}
                    </span>
                </div>
            </div>

            {/* Indicadores de pasos */}
            <div className="escaparate-engine__steps">
                {STEP_ORDER.map((step, index) => {
                    const currentIndex = STEP_ORDER.indexOf(currentStep);
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const isUpcoming = index > currentIndex;

                    return (
                        <div
                            key={step}
                            className={`escaparate-engine__step-dot ${isCompleted ? 'escaparate-engine__step-dot--completed' : ''} ${isCurrent ? 'escaparate-engine__step-dot--current' : ''} ${isUpcoming ? 'escaparate-engine__step-dot--upcoming' : ''}`}
                            title={STEP_LABELS[step]}
                        >
                            {isCompleted ? '✓' : index + 1}
                        </div>
                    );
                })}
            </div>

            {/* Contenido principal con transición */}
            <div className="escaparate-engine__content">
                <StateTransition stateKey={currentStep} direction={animationDirection}>
                    {renderCurrentStep()}
                </StateTransition>
            </div>

            {/* Indicador de guardado */}
            {isDirty && (
                <div className="escaparate-engine__saving">
                    Guardando...
                </div>
            )}
        </div>
    );
}
