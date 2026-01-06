/**
 * Request Changes Modal
 * ======================
 * Modal for requesting campaign changes (uses credits)
 */
import { useState } from 'react';
import { AlertCircle, FileEdit, Image, DollarSign, HelpCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { requestChanges, getUserCredits, type ChangeRequest } from '../../services/campaignActionsService';
import type { Project } from '../../types';

interface RequestChangesModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project | null;
}

const changeTypes = [
    { id: 'text', label: 'Textos', icon: <FileEdit size={20} />, description: 'Títulos, descripciones, botones' },
    { id: 'images', label: 'Imágenes', icon: <Image size={20} />, description: 'Fotos de fondo, galería' },
    { id: 'prices', label: 'Precios', icon: <DollarSign size={20} />, description: 'Precios, ofertas, descuentos' },
    { id: 'other', label: 'Otros', icon: <HelpCircle size={20} />, description: 'Colores, enlaces, QR' }
];

export function RequestChangesModal({ isOpen, onClose, project }: RequestChangesModalProps) {
    const [selectedType, setSelectedType] = useState<ChangeRequest['requestType']>('text');
    const [description, setDescription] = useState('');
    const [urgency, setUrgency] = useState<ChangeRequest['urgency']>('normal');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const credits = getUserCredits();

    const handleSubmit = async () => {
        if (!project || !description.trim()) return;

        setIsSubmitting(true);

        const success = await requestChanges({
            campaignId: project.id,
            requestType: selectedType,
            description: description.trim(),
            urgency
        });

        setIsSubmitting(false);

        if (success) {
            setDescription('');
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Solicitar Cambios"
            size="md"
        >
            <div className="request-changes">
                {/* Credits Warning */}
                <div className="credits-info">
                    <AlertCircle size={18} />
                    <span>
                        Tienes <strong>{credits.updates}</strong> créditos de actualización.
                        Esta solicitud usará 1 crédito.
                    </span>
                </div>

                {/* Change Type */}
                <div className="form-section">
                    <label>¿Qué quieres cambiar?</label>
                    <div className="type-grid">
                        {changeTypes.map(type => (
                            <button
                                key={type.id}
                                className={`type-option ${selectedType === type.id ? 'selected' : ''}`}
                                onClick={() => setSelectedType(type.id as ChangeRequest['requestType'])}
                            >
                                <div className="type-icon">{type.icon}</div>
                                <span className="type-label">{type.label}</span>
                                <span className="type-desc">{type.description}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div className="form-section">
                    <label>Describe los cambios detalladamente</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Ej: Cambiar el título por 'Nueva Colección Verano 2026', actualizar el precio de 29€ a 24.99€..."
                        rows={4}
                    />
                </div>

                {/* Urgency */}
                <div className="form-section">
                    <label>Prioridad</label>
                    <div className="urgency-options">
                        <button
                            className={`urgency-btn ${urgency === 'normal' ? 'selected' : ''}`}
                            onClick={() => setUrgency('normal')}
                        >
                            Normal (24-48h)
                        </button>
                        <button
                            className={`urgency-btn urgent ${urgency === 'urgent' ? 'selected' : ''}`}
                            onClick={() => setUrgency('urgent')}
                        >
                            Urgente (12h) +1 crédito
                        </button>
                    </div>
                </div>

                {/* Actions */}
                <div className="form-actions">
                    <Button variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={!description.trim() || isSubmitting || credits.updates < 1}
                    >
                        {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                    </Button>
                </div>
            </div>

            <style>{`
                .request-changes {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                
                .credits-info {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem;
                    background: rgba(245, 158, 11, 0.1);
                    border: 1px solid rgba(245, 158, 11, 0.3);
                    border-radius: 10px;
                    color: #f59e0b;
                    font-size: 0.9rem;
                }
                
                .form-section label {
                    display: block;
                    margin-bottom: 0.75rem;
                    font-weight: 500;
                }
                
                .type-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.75rem;
                }
                
                .type-option {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 1rem;
                    background: rgba(255,255,255,0.03);
                    border: 2px solid transparent;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .type-option:hover {
                    background: rgba(255,255,255,0.06);
                }
                
                .type-option.selected {
                    border-color: var(--primary);
                    background: rgba(99, 102, 241, 0.1);
                }
                
                .type-icon {
                    color: var(--primary);
                }
                
                .type-label {
                    font-weight: 500;
                }
                
                .type-desc {
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                    text-align: center;
                }
                
                .form-section textarea {
                    width: 100%;
                    padding: 1rem;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 10px;
                    color: var(--text-primary);
                    font-size: 0.95rem;
                    resize: vertical;
                    font-family: inherit;
                }
                
                .form-section textarea:focus {
                    outline: none;
                    border-color: var(--primary);
                }
                
                .urgency-options {
                    display: flex;
                    gap: 0.75rem;
                }
                
                .urgency-btn {
                    flex: 1;
                    padding: 0.75rem 1rem;
                    background: rgba(255,255,255,0.05);
                    border: 2px solid transparent;
                    border-radius: 10px;
                    color: var(--text-primary);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .urgency-btn:hover {
                    background: rgba(255,255,255,0.08);
                }
                
                .urgency-btn.selected {
                    border-color: var(--primary);
                }
                
                .urgency-btn.urgent.selected {
                    border-color: #f59e0b;
                    background: rgba(245, 158, 11, 0.1);
                }
                
                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                    padding-top: 1rem;
                    border-top: 1px solid rgba(255,255,255,0.1);
                }
            `}</style>
        </Modal>
    );
}
