/**
 * Confirm Modal Component
 * ========================
 * Confirmation dialog for destructive actions
 */
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = '¿Estás seguro?',
    message,
    confirmText = 'Eliminar',
    cancelText = 'Cancelar',
    variant = 'danger',
    isLoading = false
}: ConfirmModalProps) {
    const variantStyles = {
        danger: {
            icon: 'text-red-500 bg-red-500/10',
            button: 'bg-red-500 hover:bg-red-600'
        },
        warning: {
            icon: 'text-amber-500 bg-amber-500/10',
            button: 'bg-amber-500 hover:bg-amber-600'
        },
        info: {
            icon: 'text-blue-500 bg-blue-500/10',
            button: 'bg-blue-500 hover:bg-blue-600'
        }
    };

    const styles = variantStyles[variant];

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <div className="confirm-modal-content">
                <div className={`confirm-modal-icon ${styles.icon}`}>
                    <AlertTriangle size={28} />
                </div>

                <h3 className="confirm-modal-title">{title}</h3>
                <p className="confirm-modal-message">{message}</p>

                <div className="confirm-modal-actions">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        className={styles.button}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Procesando...' : confirmText}
                    </Button>
                </div>
            </div>

            <style>{`
                .confirm-modal-content {
                    text-align: center;
                    padding: 1rem 0;
                }
                .confirm-modal-icon {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                }
                .confirm-modal-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: var(--text-primary, #fff);
                }
                .confirm-modal-message {
                    color: var(--text-secondary, rgba(255,255,255,0.7));
                    margin-bottom: 1.5rem;
                    line-height: 1.5;
                }
                .confirm-modal-actions {
                    display: flex;
                    gap: 0.75rem;
                    justify-content: center;
                }
                .confirm-modal-actions button {
                    min-width: 100px;
                }
            `}</style>
        </Modal>
    );
}
