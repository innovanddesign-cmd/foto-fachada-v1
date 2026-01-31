/**
 * Widget Generation Progress Component
 * Shows progress bar while widgets are being generated
 */
import React from 'react';
import { Sparkles, Check, Loader2 } from 'lucide-react';
import type { WidgetGenerationProgress } from '../services/widgetPageGenerator';

interface WidgetProgressProps {
    progress: WidgetGenerationProgress;
    widgetNames: string[];
}

export const WidgetProgress: React.FC<WidgetProgressProps> = ({ progress, widgetNames }) => {
    const percentage = Math.round((progress.current / progress.total) * 100);

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '16px',
            padding: '24px',
            marginTop: '20px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {progress.status === 'generating' ? (
                        <Loader2 size={20} color="white" className="animate-spin" />
                    ) : progress.status === 'complete' ? (
                        <Check size={20} color="white" />
                    ) : (
                        <Sparkles size={20} color="white" />
                    )}
                </div>
                <div>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                        {progress.status === 'complete'
                            ? '¡Widgets Generados!'
                            : 'Generando Widgets Funcionales'}
                    </h4>
                    <p style={{ margin: 0, fontSize: '13px', opacity: 0.7 }}>
                        {progress.message}
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                height: '8px',
                overflow: 'hidden',
                marginBottom: '16px'
            }}>
                <div style={{
                    background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7)',
                    height: '100%',
                    width: `${percentage}%`,
                    transition: 'width 0.5s ease-out',
                    borderRadius: '8px'
                }} />
            </div>

            {/* Widget List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {widgetNames.map((name, index) => {
                    const isComplete = index < progress.current;
                    const isCurrent = index === progress.current - 1 && progress.status === 'generating';

                    return (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px 12px',
                                background: isComplete
                                    ? 'rgba(34, 197, 94, 0.1)'
                                    : isCurrent
                                        ? 'rgba(99, 102, 241, 0.1)'
                                        : 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '8px',
                                border: `1px solid ${isComplete
                                        ? 'rgba(34, 197, 94, 0.3)'
                                        : isCurrent
                                            ? 'rgba(99, 102, 241, 0.3)'
                                            : 'rgba(255, 255, 255, 0.1)'
                                    }`,
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                background: isComplete
                                    ? '#22c55e'
                                    : isCurrent
                                        ? '#6366f1'
                                        : 'rgba(255, 255, 255, 0.1)',
                                color: isComplete || isCurrent ? 'white' : 'inherit'
                            }}>
                                {isComplete ? <Check size={14} /> : index + 1}
                            </div>
                            <span style={{
                                fontSize: '14px',
                                opacity: isComplete || isCurrent ? 1 : 0.5
                            }}>
                                {name}
                            </span>
                            {isCurrent && (
                                <Loader2 size={16} className="animate-spin" style={{ marginLeft: 'auto' }} />
                            )}
                            {isComplete && (
                                <span style={{
                                    marginLeft: 'auto',
                                    fontSize: '12px',
                                    color: '#22c55e'
                                }}>
                                    ✓ Listo
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            <style>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default WidgetProgress;
