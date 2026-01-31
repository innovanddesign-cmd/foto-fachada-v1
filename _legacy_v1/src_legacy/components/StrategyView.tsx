import { Target, Lightbulb, TrendingUp, Calendar, MapPin } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import './StrategyView.css';

export function StrategyView() {
    const { strategies, isGeneratingStrategies } = useAppStore();

    if (isGeneratingStrategies) {
        return (
            <div className="strategy-view loading">
                <div className="loading-content">
                    <div className="loading-spinner">
                        <Target className="animate-spin" size={32} />
                    </div>
                    <h3>Generando estrategias personalizadas...</h3>
                    <p className="text-muted">Analizando el tipo de negocio, ubicación y temporada</p>
                </div>
            </div>
        );
    }

    if (strategies.length === 0) return null;

    return (
        <div className="strategy-view animate-fadeIn">
            <div className="section-header">
                <Target className="section-icon text-success" />
                <h2>Estrategias de Marketing</h2>
                <p className="text-muted">Personalizadas para tu negocio • No modificables</p>
            </div>

            <div className="strategies-grid">
                {strategies.map((strategy, index) => (
                    <div key={strategy.id} className="strategy-card">
                        <div className="strategy-number">{index + 1}</div>

                        <h3 className="strategy-title">{strategy.title}</h3>
                        <p className="strategy-description">{strategy.description}</p>

                        <div className="strategy-reasoning">
                            <Lightbulb size={16} />
                            <p>{strategy.reasoning}</p>
                        </div>

                        <div className="strategy-tactics">
                            <span className="tactics-label">Tácticas:</span>
                            <ul>
                                {strategy.tactics.map((tactic, idx) => (
                                    <li key={idx}>
                                        <TrendingUp size={12} />
                                        {tactic}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="strategy-context">
                            {strategy.seasonalContext && (
                                <div className="context-item">
                                    <Calendar size={14} />
                                    <span>{strategy.seasonalContext}</span>
                                </div>
                            )}
                            {strategy.locationContext && (
                                <div className="context-item">
                                    <MapPin size={14} />
                                    <span>{strategy.locationContext}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="strategies-note">
                <Lightbulb size={18} />
                <p>Estas estrategias han sido diseñadas específicamente para tu negocio y no se pueden modificar. Los enlaces en el siguiente paso sí serán personalizables.</p>
            </div>
        </div>
    );
}
