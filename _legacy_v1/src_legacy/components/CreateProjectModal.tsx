import { useState } from 'react';
import { FolderPlus, Calendar, FileText, Sparkles } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import type { Project } from '../types';
import './CreateProjectModal.css';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: (project: Project) => void;
}

const CAMPAIGN_SUGGESTIONS = [
    { id: 'navidad', name: 'Navidad 2024', emoji: '🎄' },
    { id: 'blackfriday', name: 'Black Friday', emoji: '🛍️' },
    { id: 'rebajas', name: 'Rebajas de Enero', emoji: '🏷️' },
    { id: 'sanvalentin', name: 'San Valentín', emoji: '💕' },
    { id: 'verano', name: 'Verano 2025', emoji: '☀️' },
    { id: 'halloween', name: 'Halloween', emoji: '🎃' },
    { id: 'general', name: 'General', emoji: '📁' },
];

export function CreateProjectModal({ isOpen, onClose, onCreated }: CreateProjectModalProps) {
    const { addProject, userTier } = useAppStore();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [campaign, setCampaign] = useState('');
    const [customCampaign, setCustomCampaign] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSubmitting(true);

        // Simular pequeño delay para feedback visual
        await new Promise(resolve => setTimeout(resolve, 300));

        const selectedCampaign = campaign === 'custom'
            ? customCampaign.trim()
            : CAMPAIGN_SUGGESTIONS.find(c => c.id === campaign)?.name || undefined;

        const newProject: Project = {
            status: 'active',
            id: `project-${Date.now()}`,
            name: name.trim(),
            description: description.trim() || undefined,
            campaign: selectedCampaign,
            landings: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        addProject(newProject);
        onCreated(newProject);

        // Reset form
        setName('');
        setDescription('');
        setCampaign('');
        setCustomCampaign('');
        setIsSubmitting(false);
        onClose();
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setName('');
            setDescription('');
            setCampaign('');
            setCustomCampaign('');
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Nuevo Proyecto"
            description="Organiza tus landing pages por campañas"
            size="md"
            footer={
                <div className="modal-footer-actions">
                    <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        disabled={!name.trim()}
                        leftIcon={<FolderPlus size={18} />}
                    >
                        Crear Proyecto
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="create-project-form">
                {/* Icono decorativo */}
                <div className="form-hero">
                    <div className="hero-icon">
                        <Sparkles size={28} />
                    </div>
                </div>

                {/* Nombre del proyecto */}
                <Input
                    label="Nombre del proyecto"
                    placeholder="Ej: Peluquería Urban Cuts"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    leftIcon={<FileText size={18} />}
                    autoFocus
                />

                {/* Descripción */}
                <div className="form-group">
                    <label className="input-label">Descripción (opcional)</label>
                    <textarea
                        className="textarea"
                        placeholder="Breve descripción del proyecto..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                    />
                </div>

                {/* Campaña */}
                <div className="form-group">
                    <label className="input-label">
                        <Calendar size={16} />
                        Campaña (opcional)
                    </label>
                    <div className="campaign-grid">
                        {CAMPAIGN_SUGGESTIONS.map(suggestion => (
                            <button
                                key={suggestion.id}
                                type="button"
                                className={`campaign-card ${campaign === suggestion.id ? 'active' : ''}`}
                                onClick={() => setCampaign(campaign === suggestion.id ? '' : suggestion.id)}
                            >
                                <span className="campaign-emoji">{suggestion.emoji}</span>
                                <span className="campaign-name">{suggestion.name}</span>
                            </button>
                        ))}
                        <button
                            type="button"
                            className={`campaign-card custom ${campaign === 'custom' ? 'active' : ''}`}
                            onClick={() => setCampaign(campaign === 'custom' ? '' : 'custom')}
                        >
                            <span className="campaign-emoji">✨</span>
                            <span className="campaign-name">Personalizada</span>
                        </button>
                    </div>

                    {campaign === 'custom' && (
                        <Input
                            placeholder="Nombre de la campaña personalizada"
                            value={customCampaign}
                            onChange={(e) => setCustomCampaign(e.target.value)}
                            className="mt-3"
                        />
                    )}
                </div>

                {/* Tip para usuarios free */}
                {userTier === 'free' && (
                    <div className="upgrade-tip">
                        <Badge variant="warning">Free</Badge>
                        <span>Tienes 1 proyecto disponible. Actualiza para crear más.</span>
                    </div>
                )}
            </form>
        </Modal>
    );
}
