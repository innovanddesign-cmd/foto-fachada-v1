/**
 * Auto Links View Component
 * =========================
 * Muestra los 3 widgets auto-seleccionados por IA con botón de configuración.
 */

import { useState, useEffect } from 'react';
import { Settings, Check, ExternalLink, Loader, Sparkles } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { autoSelectActions, getConfigValues, type AutoSelectedActions, type SelectedAction } from '../services/actionSelectorService';
import { generateSimplePage } from '../services/strategicActionsService';
import { extractBusinessDNA } from '../services/businessDNAService';
import './AutoLinksView.css';

interface GeneratedPage {
    actionId: number;
    url: string;
    slug: string;
}

export function AutoLinksView() {
    const { brandData, setLinks } = useAppStore();
    const [selectedActions, setSelectedActions] = useState<AutoSelectedActions | null>(null);
    const [generatedPages, setGeneratedPages] = useState<GeneratedPage[]>([]);
    const [generating, setGenerating] = useState(false);
    const [configModalOpen, setConfigModalOpen] = useState<string | null>(null);
    const [editedConfigs, setEditedConfigs] = useState<Record<string, Record<string, string>>>({});

    useEffect(() => {
        if (brandData) {
            const dna = extractBusinessDNA(brandData);
            const actions = autoSelectActions(brandData, dna);
            setSelectedActions(actions);

            if (actions) {
                setEditedConfigs({
                    venta: getConfigValues(actions.venta.config),
                    fidelizar: getConfigValues(actions.fidelizar.config),
                    autoridad: getConfigValues(actions.autoridad.config)
                });
            }
        }
    }, [brandData]);

    const handleGenerateAll = async () => {
        if (!selectedActions || !brandData) return;

        setGenerating(true);
        const pages: GeneratedPage[] = [];

        try {
            for (const [key, data] of Object.entries(selectedActions)) {
                const result = await generateSimplePage(
                    data.action,
                    data.category,
                    editedConfigs[key] || {},
                    brandData
                );
                if (result.success && result.page) {
                    pages.push({
                        actionId: data.action.id,
                        url: result.url || '',
                        slug: result.page.slug
                    });
                }
            }

            setGeneratedPages(pages);

            setLinks(pages.map(p => ({
                id: `link-${p.actionId}`,
                name: getActionName(p.actionId),
                description: '',
                url: p.url,
                emoji: getActionEmoji(p.actionId),
                type: 'gamification' as const,
                engagement: 'high' as const,
                conversion: 'high' as const,
                isPremium: false,
                regenerateCount: 0
            })));

        } catch (error) {
            console.error('[AutoLinksView] Error generating pages:', error);
        }

        setGenerating(false);
    };

    const updateConfig = (blockId: string, key: string, value: string) => {
        setEditedConfigs(prev => ({
            ...prev,
            [blockId]: { ...(prev[blockId] || {}), [key]: value }
        }));
    };

    if (!selectedActions) {
        return (
            <div className="auto-links-view loading">
                <Loader className="animate-spin" size={32} />
                <p>Analizando tu negocio...</p>
            </div>
        );
    }

    const blocks: { id: string; data: SelectedAction; color: string }[] = [
        { id: 'venta', data: selectedActions.venta, color: '#22c55e' },
        { id: 'fidelizar', data: selectedActions.fidelizar, color: '#8b5cf6' },
        { id: 'autoridad', data: selectedActions.autoridad, color: '#f59e0b' }
    ];

    return (
        <div className="auto-links-view">
            <div className="links-header">
                <h2 className="links-title">
                    <Sparkles size={24} />
                    Tus 3 Páginas Marketing
                </h2>
                <p className="links-subtitle">Personalizadas automáticamente para tu negocio</p>
            </div>

            <div className="links-grid">
                {blocks.map(({ id, data, color }) => {
                    const page = generatedPages.find(p => p.actionId === data.action.id);
                    const config = editedConfigs[id] || {};

                    return (
                        <div key={id} className={`link-block ${page ? 'generated' : ''}`}
                            style={{ '--block-color': color } as React.CSSProperties}>
                            <div className="block-header">
                                <div className="action-icon">{data.action.emoji}</div>
                                <div className="action-info">
                                    <h3>{data.action.name}</h3>
                                    <span className="category-tag">{data.category.title}</span>
                                </div>
                                <button className="config-btn" onClick={() => setConfigModalOpen(id)} title="Configurar">
                                    <Settings size={18} />
                                </button>
                            </div>

                            <p className="action-description">{data.action.description}</p>

                            <div className="ai-reason">
                                <span className="reason-label">🤖 IA:</span>
                                <span className="reason-text">{data.reason}</span>
                            </div>

                            <div className="config-preview">
                                {Object.entries(config).slice(0, 2).map(([key, value]) => (
                                    <div key={key} className="config-item">
                                        <span className="config-key">{key}:</span>
                                        <span className="config-value">{value || '—'}</span>
                                    </div>
                                ))}
                            </div>

                            {page && (
                                <div className="generated-badge">
                                    <Check size={14} />
                                    <span>Página generada</span>
                                    <a href={page.url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink size={14} />
                                    </a>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {generatedPages.length === 0 && (
                <button className="generate-all-btn" onClick={handleGenerateAll} disabled={generating}>
                    {generating ? (
                        <><Loader className="animate-spin" size={20} /> Generando páginas...</>
                    ) : (
                        <><Sparkles size={20} /> Generar las 3 páginas</>
                    )}
                </button>
            )}

            {generatedPages.length === 3 && (
                <div className="all-generated">
                    <Check size={20} />
                    <span>¡Las 3 páginas están listas! Continúa para crear tu landing.</span>
                </div>
            )}

            {configModalOpen && (
                <div className="config-modal-overlay" onClick={() => setConfigModalOpen(null)}>
                    <div className="config-modal" onClick={e => e.stopPropagation()}>
                        <h3>Configurar {blocks.find(b => b.id === configModalOpen)?.data.action.name}</h3>

                        <div className="config-fields">
                            {Object.entries(blocks.find(b => b.id === configModalOpen)?.data.config || {}).map(([key, field]) => (
                                <div key={key} className="config-field">
                                    <label>{field.label}</label>
                                    <input
                                        type="text"
                                        value={editedConfigs[configModalOpen]?.[key] || field.value}
                                        onChange={(e) => updateConfig(configModalOpen, key, e.target.value)}
                                        placeholder={field.placeholder}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="modal-actions">
                            <button onClick={() => setConfigModalOpen(null)}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function getActionName(actionId: number): string {
    const names: Record<number, string> = {
        1: 'Oferta Flash', 2: 'Comparador Pro', 3: 'Rasca y Gana',
        4: 'Rachas de Visita', 5: 'Producto Gancho', 6: 'Trae a un Amigo',
        7: 'Feedback + Incentivo', 8: 'Guía del Experto', 9: 'Recomendado para Ti'
    };
    return names[actionId] || 'Acción';
}

function getActionEmoji(actionId: number): string {
    const emojis: Record<number, string> = {
        1: '⚡', 2: '🏆', 3: '🎰', 4: '🔥', 5: '🎁', 6: '👥', 7: '📝', 8: '📚', 9: '🎯'
    };
    return emojis[actionId] || '🎯';
}

export default AutoLinksView;
