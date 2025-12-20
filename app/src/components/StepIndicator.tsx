import { Camera, Sparkles, Target, Link, Layout, QrCode, Check } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import type { FlowStep } from '../types';
import './StepIndicator.css';

const STEPS: { id: FlowStep; name: string; Icon: React.FC<{ size?: number; className?: string }> }[] = [
    { id: 'upload', name: 'Foto', Icon: Camera },
    { id: 'analysis', name: 'Análisis', Icon: Sparkles },
    { id: 'strategy', name: 'Estrategias', Icon: Target },
    { id: 'links', name: 'Enlaces', Icon: Link },
    { id: 'design', name: 'Diseño', Icon: Layout },
    { id: 'poster', name: 'Cartel', Icon: QrCode }
];

const STEP_ORDER: FlowStep[] = ['upload', 'analysis', 'strategy', 'links', 'design', 'poster'];

export function StepIndicator() {
    const { currentStep } = useAppStore();
    const currentIndex = STEP_ORDER.indexOf(currentStep);

    return (
        <div className="step-indicator-container">
            <div className="step-indicator-track">
                {STEPS.map((step, idx) => {
                    const Icon = step.Icon;
                    const isCompleted = idx < currentIndex;
                    const isCurrent = idx === currentIndex;
                    const isPending = idx > currentIndex;

                    return (
                        <div key={step.id} className="step-wrapper">
                            <div
                                className={`step-circle ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''} ${isPending ? 'pending' : ''}`}
                            >
                                {isCompleted ? (
                                    <Check size={20} className="step-icon" />
                                ) : (
                                    <Icon size={20} className="step-icon" />
                                )}
                            </div>
                            <span className={`step-label ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                                {step.name}
                            </span>
                            {idx < STEPS.length - 1 && (
                                <div className={`step-connector ${isCompleted ? 'completed' : ''}`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
