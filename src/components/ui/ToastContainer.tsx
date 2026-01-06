/**
 * Toast Container Component
 * ==========================
 * Renders all active toasts
 */
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useToastStore, type ToastType } from '../../store/toastStore';

const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />
};

const styles: Record<ToastType, string> = {
    success: 'toast-success',
    error: 'toast-error',
    warning: 'toast-warning',
    info: 'toast-info'
};

export function ToastContainer() {
    const { toasts, removeToast } = useToastStore();

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`toast ${styles[toast.type]}`}
                >
                    <div className="toast-icon">
                        {icons[toast.type]}
                    </div>
                    <div className="toast-content">
                        <p className="toast-title">{toast.title}</p>
                        {toast.message && (
                            <p className="toast-message">{toast.message}</p>
                        )}
                        {toast.action && (
                            <button
                                className="toast-action"
                                onClick={toast.action.onClick}
                            >
                                {toast.action.label}
                            </button>
                        )}
                    </div>
                    <button
                        className="toast-close"
                        onClick={() => removeToast(toast.id)}
                    >
                        <X size={16} />
                    </button>
                </div>
            ))}

            <style>{`
                .toast-container {
                    position: fixed;
                    bottom: 1.5rem;
                    right: 1.5rem;
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    max-width: 400px;
                }
                
                .toast {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.75rem;
                    padding: 1rem;
                    border-radius: 12px;
                    background: rgba(30, 30, 30, 0.95);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.1);
                    box-shadow: 0 10px 40px rgba(0,0,0,0.4);
                    animation: toastSlideIn 0.3s ease;
                }
                
                @keyframes toastSlideIn {
                    from {
                        opacity: 0;
                        transform: translateX(100px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                .toast-icon {
                    flex-shrink: 0;
                    padding: 0.25rem;
                }
                
                .toast-success .toast-icon { color: #22c55e; }
                .toast-error .toast-icon { color: #ef4444; }
                .toast-warning .toast-icon { color: #f59e0b; }
                .toast-info .toast-icon { color: #3b82f6; }
                
                .toast-content {
                    flex: 1;
                }
                
                .toast-title {
                    font-weight: 600;
                    color: #fff;
                    margin: 0;
                    font-size: 0.9rem;
                }
                
                .toast-message {
                    color: rgba(255,255,255,0.7);
                    margin: 0.25rem 0 0;
                    font-size: 0.8rem;
                }
                
                .toast-action {
                    background: none;
                    border: none;
                    color: var(--primary, #6366f1);
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 0;
                    margin-top: 0.5rem;
                }
                
                .toast-action:hover {
                    text-decoration: underline;
                }
                
                .toast-close {
                    background: none;
                    border: none;
                    color: rgba(255,255,255,0.5);
                    cursor: pointer;
                    padding: 0.25rem;
                    flex-shrink: 0;
                }
                
                .toast-close:hover {
                    color: #fff;
                }
                
                @media (max-width: 480px) {
                    .toast-container {
                        left: 1rem;
                        right: 1rem;
                        max-width: none;
                    }
                }
            `}</style>
        </div>
    );
}
