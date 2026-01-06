/**
 * Empty State Component
 * ======================
 * Elegant empty states for no-data scenarios
 */
import type { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    variant?: 'default' | 'waiting' | 'error';
}

export function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    onAction,
    variant = 'default'
}: EmptyStateProps) {
    const variantStyles = {
        default: 'empty-state-default',
        waiting: 'empty-state-waiting',
        error: 'empty-state-error'
    };

    return (
        <div className={`empty-state ${variantStyles[variant]}`}>
            {icon && (
                <div className="empty-state-icon">
                    {icon}
                </div>
            )}

            <h3 className="empty-state-title">{title}</h3>

            {description && (
                <p className="empty-state-description">{description}</p>
            )}

            {actionLabel && onAction && (
                <Button
                    variant="primary"
                    size="lg"
                    onClick={onAction}
                    className="empty-state-action"
                >
                    {actionLabel}
                </Button>
            )}

            {variant === 'waiting' && (
                <div className="empty-state-pulse">
                    <div className="pulse-dot"></div>
                    <div className="pulse-dot"></div>
                    <div className="pulse-dot"></div>
                </div>
            )}

            <style>{`
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 3rem 2rem;
                    min-height: 300px;
                }
                
                .empty-state-icon {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1.5rem;
                    background: var(--bg-surface, rgba(255,255,255,0.05));
                    color: var(--text-secondary, rgba(255,255,255,0.6));
                }
                
                .empty-state-icon svg {
                    width: 36px;
                    height: 36px;
                }
                
                .empty-state-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: var(--text-primary, #fff);
                    margin-bottom: 0.5rem;
                }
                
                .empty-state-description {
                    color: var(--text-secondary, rgba(255,255,255,0.6));
                    max-width: 320px;
                    line-height: 1.5;
                    margin-bottom: 1.5rem;
                }
                
                .empty-state-action {
                    min-width: 200px;
                }
                
                /* Waiting variant */
                .empty-state-waiting .empty-state-icon {
                    animation: pulse 2s ease-in-out infinite;
                }
                
                .empty-state-pulse {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: 1rem;
                }
                
                .pulse-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: var(--primary, #6366f1);
                    animation: pulseDot 1.4s ease-in-out infinite;
                }
                
                .pulse-dot:nth-child(2) { animation-delay: 0.2s; }
                .pulse-dot:nth-child(3) { animation-delay: 0.4s; }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                }
                
                @keyframes pulseDot {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.2); opacity: 1; }
                }
                
                /* Error variant */
                .empty-state-error .empty-state-icon {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                }
            `}</style>
        </div>
    );
}

/**
 * Metric Empty State (for dashboard counters)
 */
interface MetricEmptyStateProps {
    label: string;
}

export function MetricEmptyState({ label }: MetricEmptyStateProps) {
    return (
        <div className="metric-empty">
            <span className="metric-empty-value">—</span>
            <span className="metric-empty-label">{label}</span>

            <style>{`
                .metric-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.25rem;
                    opacity: 0.6;
                }
                .metric-empty-value {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                }
                .metric-empty-label {
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                }
            `}</style>
        </div>
    );
}
