/**
 * Delete Confirm Modal
 * =====================
 * Premium modal for confirming destructive actions
 */
import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import './DeleteConfirmModal.css';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
    itemType?: string;
    isDeleting?: boolean;
    requireConfirmation?: boolean;
}

export function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    itemType = 'campaña',
    isDeleting = false,
    requireConfirmation = true
}: DeleteConfirmModalProps) {
    const { t } = useTranslation();
    const [confirmText, setConfirmText] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && requireConfirmation) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
        if (!isOpen) {
            setConfirmText('');
        }
    }, [isOpen, requireConfirmation]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const isConfirmValid = !requireConfirmation || confirmText === itemName;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isConfirmValid && !isDeleting) {
            onConfirm();
        }
    };

    return (
        <div className="delete-modal-overlay" onClick={onClose}>
            <div
                className="delete-modal animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="delete-modal-header">
                    <div className="delete-icon-wrapper">
                        <AlertTriangle size={24} />
                    </div>
                    <button className="delete-modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="delete-modal-content">
                    <h2>{t('common.delete', 'Eliminar')} {itemType}</h2>
                    <p className="delete-warning">
                        {t('common.deleteWarning', 'Esta acción no se puede deshacer. Se eliminarán permanentemente:')}
                    </p>

                    <ul className="delete-items-list">
                        <li>El {itemType} "<strong>{itemName}</strong>"</li>
                        <li>Todas las landings asociadas</li>
                        <li>Los archivos subidos</li>
                        <li>Las métricas y estadísticas</li>
                    </ul>

                    {requireConfirmation && (
                        <form onSubmit={handleSubmit}>
                            <label className="confirm-label">
                                {t('common.typeToConfirm', 'Escribe')} <strong>"{itemName}"</strong> {t('common.toConfirm', 'para confirmar')}:
                            </label>
                            <input
                                ref={inputRef}
                                type="text"
                                className="confirm-input"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder={itemName}
                                disabled={isDeleting}
                            />
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="delete-modal-footer">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        {t('common.cancel', 'Cancelar')}
                    </Button>
                    <Button
                        variant="primary"
                        className="delete-confirm-btn"
                        onClick={onConfirm}
                        disabled={!isConfirmValid || isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <span className="spinner-small" />
                                {t('common.deleting', 'Eliminando...')}
                            </>
                        ) : (
                            <>
                                <Trash2 size={16} />
                                {t('common.deleteConfirm', 'Eliminar definitivamente')}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
