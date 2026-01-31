/**
 * Strategies Tab Component
 * =========================
 * Main container for Strategy Generation
 */
import { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StrategyCard } from './StrategyCard';
import { StrategiesSkeleton } from './StrategiesSkeleton';
import { generateStrategies, type ClientStrategy, type ClientBrandData } from '../../../services/strategyService';
import { Button } from '../../ui/Button';
import './StrategiesTab.css';

interface StrategiesTabProps {
    brandData?: ClientBrandData;
    onStrategySelect?: (strategy: ClientStrategy) => void;
}

export function StrategiesTab({ brandData, onStrategySelect }: StrategiesTabProps) {
    const { t } = useTranslation();
    const [strategies, setStrategies] = useState<ClientStrategy[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Mock brand data if not provided (for development/testing)
    const activeBrandData = brandData || {
        name: 'Mi Negocio Local',
        businessType: 'Local Comercial',
        style: 'Moderno',
        targetAudience: 'Clientes locales'
    };

    useEffect(() => {
        // Auto-load strategies on mount if not loaded
        if (strategies.length === 0 && !loading) {
            handleGenerate();
        }
    }, []);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await generateStrategies(activeBrandData);
            setStrategies(data);
        } catch (err) {
            console.error(err);
            setError(t('strategies.error', 'Hubo un error generando las estrategias. Por favor intenta de nuevo.'));
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (strategy: ClientStrategy) => {
        setSelectedId(strategy.id);
        if (onStrategySelect) {
            onStrategySelect(strategy);
        }
    };

    return (
        <div className="strategies-tab">
            <div className="strategies-header text-center mb-8">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-indigo-500/10 text-indigo-400 mb-4">
                    <Sparkles size={24} />
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">
                    {t('strategies.title', 'Elige tu Estrategia Digital')}
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    {t('strategies.subtitle', 'Nuestra IA ha analizado tu negocio y el contexto actual para generar estas 3 propuestas únicas. Elige la que mejor conecte con tus objetivos.')}
                </p>
            </div>

            {error ? (
                <div className="error-container text-center p-8 bg-red-500/10 rounded-2xl border border-red-500/20 max-w-lg mx-auto">
                    <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">{t('common.error', 'Ocurrió un error')}</h3>
                    <p className="text-red-300 mb-6">{error}</p>
                    <Button onClick={handleGenerate} variant="primary">
                        <RefreshCw size={18} className="mr-2" />
                        {t('common.retry', 'Reintentar')}
                    </Button>
                </div>
            ) : (
                <>
                    {loading ? (
                        <div className="loading-container">
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-medium text-white animate-pulse">
                                    {t('strategies.generating', 'Analizando vibe, tendencias y contexto...')}
                                </h3>
                            </div>
                            <StrategiesSkeleton />
                        </div>
                    ) : (
                        <div className="strategies-grid">
                            {strategies.map((strategy) => (
                                <StrategyCard
                                    key={strategy.id}
                                    strategy={strategy}
                                    isSelected={selectedId === strategy.id}
                                    onSelect={handleSelect}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
