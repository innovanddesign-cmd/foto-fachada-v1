/**
 * StrategicSelectionView
 * ======================
 * New strategic selection flow that replaces the widget engine.
 * Flow: Category Selection → Action Selection → No-Code Form → Page Generation
 */
import { useState, useCallback } from 'react';
import { ArrowLeft, Target, Sparkles, ExternalLink, Copy, Check } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { StrategyCategorySelector } from './StrategyCategorySelector';
import { ActionConfigForm } from './ActionConfigForm';
import { generateSimplePage } from '../../services/strategicActionsService';
import { Button } from '../ui/Button';
import type { StrategicCategory, StrategicAction } from '../../data/strategicCategories';
import './StrategicSelectionView.css';

type ViewState = 'categories' | 'actions' | 'config' | 'success';

interface GeneratedPage {
    url: string;
    slug: string;
    title: string;
}

export function StrategicSelectionView() {
    const { brandData, setCurrentStep } = useAppStore();

    const [viewState, setViewState] = useState<ViewState>('categories');
    const [selectedCategory, setSelectedCategory] = useState<StrategicCategory | null>(null);
    const [selectedAction, setSelectedAction] = useState<StrategicAction | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPage, setGeneratedPage] = useState<GeneratedPage | null>(null);
    const [copied, setCopied] = useState(false);

    // Handle category selection
    const handleCategorySelect = useCallback((category: StrategicCategory) => {
        setSelectedCategory(category);
        setViewState('actions');
    }, []);

    // Handle action selection
    const handleActionSelect = useCallback((action: StrategicAction, category: StrategicCategory) => {
        setSelectedAction(action);
        setSelectedCategory(category);
        setViewState('config');
    }, []);

    // Handle form submission - generate page
    const handleConfirmConfig = useCallback(async (config: Record<string, any>) => {
        if (!selectedAction || !selectedCategory || !brandData) return;

        setIsGenerating(true);

        try {
            const result = await generateSimplePage(
                selectedAction,
                selectedCategory,
                config,
                brandData
            );

            if (result.success && result.page) {
                setGeneratedPage({
                    url: result.url || '',
                    slug: result.page.slug,
                    title: result.page.title,
                });
                setViewState('success');
            } else {
                console.error('Page generation failed:', result.error);
            }
        } catch (error) {
            console.error('Error generating page:', error);
        } finally {
            setIsGenerating(false);
        }
    }, [selectedAction, selectedCategory, brandData]);

    // Handle back navigation
    const handleBack = useCallback(() => {
        switch (viewState) {
            case 'actions':
                setSelectedCategory(null);
                setViewState('categories');
                break;
            case 'config':
                setSelectedAction(null);
                setViewState('actions');
                break;
            case 'success':
                setViewState('categories');
                setSelectedCategory(null);
                setSelectedAction(null);
                setGeneratedPage(null);
                break;
        }
    }, [viewState]);

    // Copy URL to clipboard
    const handleCopyUrl = useCallback(() => {
        if (generatedPage?.url) {
            navigator.clipboard.writeText(generatedPage.url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [generatedPage]);

    // Continue to next step in main flow
    const handleContinue = useCallback(() => {
        setCurrentStep('links');
    }, [setCurrentStep]);

    // ─────────────────────────────────────────────────────────────
    // SUCCESS VIEW
    // ─────────────────────────────────────────────────────────────
    if (viewState === 'success' && generatedPage) {
        return (
            <div className="strategic-selection-view success-view">
                <div className="success-card">
                    <div className="success-icon">
                        <Check size={48} />
                    </div>
                    <h2>¡Página Generada!</h2>
                    <p className="success-subtitle">
                        Tu página <strong>{selectedAction?.name}</strong> está lista
                    </p>

                    <div className="generated-url-box">
                        <span className="url-text">{generatedPage.url}</span>
                        <button
                            className="copy-btn"
                            onClick={handleCopyUrl}
                            title="Copiar URL"
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                    </div>

                    <div className="success-actions">
                        <Button
                            variant="ghost"
                            onClick={() => window.open(generatedPage.url, '_blank')}
                            leftIcon={<ExternalLink size={18} />}
                        >
                            Ver página
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleContinue}
                        >
                            Continuar al diseño
                        </Button>
                    </div>

                    <button className="create-another" onClick={handleBack}>
                        + Crear otra página
                    </button>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────
    // CONFIG VIEW (No-Code Form)
    // ─────────────────────────────────────────────────────────────
    if (viewState === 'config' && selectedAction && selectedCategory) {
        return (
            <div className="strategic-selection-view">
                <ActionConfigForm
                    action={selectedAction}
                    category={selectedCategory}
                    brandData={brandData}
                    onBack={handleBack}
                    onConfirm={handleConfirmConfig}
                    isLoading={isGenerating}
                />
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────
    // CATEGORY/ACTIONS SELECTION VIEW
    // ─────────────────────────────────────────────────────────────
    return (
        <div className="strategic-selection-view">
            {/* Header with back button when in actions view */}
            {viewState === 'actions' && (
                <div className="view-header">
                    <button className="back-link" onClick={handleBack}>
                        <ArrowLeft size={18} />
                        <span>Volver a categorías</span>
                    </button>
                </div>
            )}

            {/* Section header */}
            <div className="section-header-v3 mb-6">
                <div className="icon-badge">
                    <Target size={24} className="text-white" />
                </div>
                <div>
                    <h2 className="section-title">
                        {viewState === 'categories'
                            ? 'Selección Estratégica'
                            : `${selectedCategory?.emoji} ${selectedCategory?.title}`
                        }
                    </h2>
                    <p className="section-subtitle">
                        {viewState === 'categories'
                            ? 'Elige el objetivo principal para tu negocio'
                            : selectedCategory?.tagline
                        }
                    </p>
                </div>
            </div>

            {/* Category/Action Selector */}
            <StrategyCategorySelector
                onSelectCategory={handleCategorySelect}
                onSelectAction={handleActionSelect}
                selectedCategory={viewState === 'actions' ? selectedCategory : null}
            />

            {/* Info note */}
            <div className="ai-note-card glass-panel mt-8">
                <div className="note-content">
                    <Sparkles size={20} className="text-primary-400 flex-shrink-0" />
                    <div>
                        <p className="font-medium text-white mb-1">
                            Páginas optimizadas para conversión
                        </p>
                        <p className="text-sm text-slate-400">
                            Cada acción genera una página premium con diseño profesional,
                            optimizada para móvil y lista para compartir.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
