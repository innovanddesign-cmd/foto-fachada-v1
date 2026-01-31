/**
 * StrategyViewV3
 * ==============
 * Main view for the Generative Widget Engine.
 * - Selection Mode: Shows AI-generated strategy cards
 * - Configuration Mode: Shows form builder + live preview
 */
import { useState, useCallback } from 'react';
import { Target, Sparkles, ArrowLeft, Check, Code2, Eye, Loader2 } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { GenerativeWidgetSelector } from './features/GenerativeWidgetSelector';
import { WidgetConfigurator } from './features/WidgetConfigurator';
import { LiveWidgetPreview } from './features/LiveWidgetPreview';
import { Button } from './ui/Button';
import type { GenerativeStrategy } from '../types';
import './StrategyViewV3.css';

export function StrategyViewV3() {
    const {
        strategies,
        isGeneratingStrategies,
        selectedStrategy,
        setSelectedStrategy,
        widgetConfig,
        setWidgetConfig,
        setCurrentStep,
        brandData,
    } = useAppStore();

    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'config' | 'code'>('config');

    const handleStrategySelect = useCallback((strategy: GenerativeStrategy) => {
        // Initialize config with defaults from schema
        const initialConfig: Record<string, any> = {};
        strategy.ui_config_schema?.forEach(field => {
            initialConfig[field.key] = field.default || '';
        });

        setWidgetConfig(initialConfig);
        setSelectedStrategy(strategy as any);
    }, [setSelectedStrategy, setWidgetConfig]);

    const handleConfigChange = useCallback((newConfig: Record<string, any>) => {
        setWidgetConfig(newConfig);
    }, [setWidgetConfig]);

    const handleConfirmStrategy = useCallback(async () => {
        if (!selectedStrategy) return;

        setIsSaving(true);

        try {
            // Process the code template with final config values
            const strategy = selectedStrategy as unknown as GenerativeStrategy;
            let finalCode = strategy.code_template || '';

            Object.entries(widgetConfig).forEach(([key, value]) => {
                const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'gi');
                finalCode = finalCode.replace(pattern, String(value || ''));
            });

            // Store the finalized widget in the strategy
            const finalizedStrategy = {
                ...strategy,
                _finalizedCode: finalCode,
                _finalConfig: widgetConfig,
                _finalizedAt: new Date().toISOString()
            };

            // Update the selected strategy with finalized data
            setSelectedStrategy(finalizedStrategy as any);

            // Log for debugging
            console.log('[StrategyView] Widget finalized:', {
                id: strategy.id,
                configKeys: Object.keys(widgetConfig),
                codeLength: finalCode.length
            });

            // Move to next step
            // Since the widget IS the main value prop, we might skip links
            // and go directly to design, or we can include links as secondary CTAs
            setCurrentStep('links');

        } catch (error) {
            console.error('[StrategyView] Error saving widget:', error);
        } finally {
            setIsSaving(false);
        }
    }, [selectedStrategy, widgetConfig, setSelectedStrategy, setCurrentStep]);

    const handleBack = useCallback(() => {
        setSelectedStrategy(null);
        setWidgetConfig({});
    }, [setSelectedStrategy, setWidgetConfig]);

    // ─────────────────────────────────────────────────────────────
    // LOADING STATE
    // ─────────────────────────────────────────────────────────────
    if (isGeneratingStrategies) {
        return (
            <div className="strategy-view-v3 loading-state glass-panel">
                <div className="loader-container">
                    <div className="glow-loader"></div>
                    <Target className="loader-icon text-white animate-pulse" size={48} />
                </div>
                <h3>Diseñando estrategias personalizadas...</h3>
                <p className="loading-subtitle">
                    {brandData?.name
                        ? `Creando widgets únicos para ${brandData.name}`
                        : 'Nuestra IA está programando widgets interactivos'
                    }
                </p>

                <div className="loading-steps">
                    <div className="step active">
                        <div className="step-dot"></div>
                        <span>Analizando tipo de negocio</span>
                    </div>
                    <div className="step active">
                        <div className="step-dot"></div>
                        <span>Detectando contexto estacional</span>
                    </div>
                    <div className="step pending">
                        <div className="step-dot"></div>
                        <span>Programando widgets únicos</span>
                    </div>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────
    // EMPTY STATE
    // ─────────────────────────────────────────────────────────────
    if (!strategies || strategies.length === 0) {
        return null;
    }

    // ─────────────────────────────────────────────────────────────
    // CONFIGURATION MODE
    // ─────────────────────────────────────────────────────────────
    if (selectedStrategy && (selectedStrategy as any).code_template) {
        const strategy = selectedStrategy as unknown as GenerativeStrategy;

        return (
            <div className="strategy-view-v3 animate-fadeIn">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={handleBack}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                        aria-label="Volver"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <span className="text-3xl">{strategy.emoji}</span>
                            {strategy.title}
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">
                            {strategy.description}
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={handleConfirmStrategy}
                        disabled={isSaving}
                        rightIcon={isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                    >
                        {isSaving ? 'Guardando...' : 'Confirmar y Continuar'}
                    </Button>
                </div>

                {/* Main content grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-280px)] min-h-[500px]">
                    {/* LEFT PANEL: CONFIGURATION */}
                    <div className="glass-panel overflow-hidden flex flex-col">
                        {/* Tabs */}
                        <div className="flex border-b border-slate-700/50">
                            <button
                                onClick={() => setActiveTab('config')}
                                className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'config'
                                    ? 'text-white bg-slate-800/50 border-b-2 border-indigo-500'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                                    }`}
                            >
                                <Sparkles size={16} />
                                Personalización
                            </button>
                            <button
                                onClick={() => setActiveTab('code')}
                                className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'code'
                                    ? 'text-white bg-slate-800/50 border-b-2 border-indigo-500'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                                    }`}
                            >
                                <Code2 size={16} />
                                Código
                            </button>
                        </div>

                        {/* Tab content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {activeTab === 'config' && (
                                <WidgetConfigurator
                                    schema={strategy.ui_config_schema || []}
                                    onChange={handleConfigChange}
                                    initialValues={widgetConfig}
                                />
                            )}

                            {activeTab === 'code' && (
                                <div className="space-y-4">
                                    <p className="text-sm text-slate-400">
                                        Código HTML/CSS/JS generado por IA. Las variables <code className="text-indigo-400">{'{{variable}}'}</code> serán reemplazadas automáticamente.
                                    </p>
                                    <pre className="bg-slate-900 p-4 rounded-lg text-xs text-slate-300 overflow-x-auto max-h-[400px] overflow-y-auto font-mono">
                                        {strategy.code_template}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANEL: LIVE PREVIEW */}
                    <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
                        {/* Preview header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
                            <div className="flex items-center gap-2">
                                <Eye size={16} className="text-indigo-400" />
                                <span className="text-sm font-medium text-slate-300">Vista Previa en Vivo</span>
                            </div>
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                            </div>
                        </div>

                        {/* Preview iframe */}
                        <div className="flex-1">
                            <LiveWidgetPreview
                                code={strategy.code_template}
                                configValues={widgetConfig}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────
    // SELECTION MODE
    // ─────────────────────────────────────────────────────────────
    return (
        <div className="strategy-view-v3 animate-fadeIn">
            {/* Section header */}
            <div className="section-header-v3 mb-8">
                <div className="icon-badge">
                    <Target size={24} className="text-white" />
                </div>
                <div>
                    <h2 className="section-title">Estrategias Generadas por IA</h2>
                    <p className="section-subtitle">
                        {brandData?.name
                            ? `Widgets personalizados para ${brandData.name}`
                            : 'Selecciona una estrategia para configurar tu widget interactivo'
                        }
                    </p>
                </div>
            </div>

            {/* Strategy cards */}
            <GenerativeWidgetSelector
                strategies={strategies as unknown as GenerativeStrategy[]}
                onSelect={handleStrategySelect}
                isLoading={isGeneratingStrategies}
            />

            {/* Info card */}
            <div className="ai-note-card glass-panel mt-8">
                <div className="note-content">
                    <Sparkles size={20} className="text-primary-400 flex-shrink-0" />
                    <div>
                        <p className="font-medium text-white mb-1">
                            Widgets 100% generados por IA
                        </p>
                        <p className="text-sm text-slate-400">
                            Cada estrategia incluye código HTML/CSS/JS único.
                            Selecciona una para personalizar textos, colores y más.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
