import { Target, Lightbulb, TrendingUp, Calendar, MapPin, Sparkles } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import './StrategyViewV3.css';

export function StrategyViewV3() {
    const { strategies, isGeneratingStrategies } = useAppStore();

    if (isGeneratingStrategies) {
        return (
            <div className="strategy-view-v3 loading-state glass-panel">
                <div className="loader-container">
                    <div className="glow-loader"></div>
                    <Target className="loader-icon text-white animate-pulse" size={48} />
                </div>
                <h3>Diseñando estrategias personalizadas...</h3>
                <p className="loading-subtitle">Nuestra IA está analizando tu negocio para crear el plan perfecto</p>

                <div className="loading-steps">
                    <div className="step active">
                        <div className="step-dot"></div>
                        <span>Analizando mercado local</span>
                    </div>
                    <div className="step active">
                        <div className="step-dot"></div>
                        <span>Identificando cliente ideal</span>
                    </div>
                    <div className="step pending">
                        <div className="step-dot"></div>
                        <span>Generando tácticas de conversión</span>
                    </div>
                </div>
            </div>
        );
    }

    if (strategies.length === 0) return null;

    return (
        <div className="strategy-view-v3 animate-fadeIn">
            <div className="section-header-v3">
                <div className="icon-badge">
                    <Target size={24} className="text-white" />
                </div>
                <div>
                    <h2 className="section-title">Estrategias de Marketing</h2>
                    <p className="section-subtitle">Plan de acción generado por IA para tu negocio</p>
                </div>
            </div>

            <div className="strategies-grid-v3">
                {strategies.map((strategy, index) => (
                    <div key={strategy.id} className="strategy-card-v3 glass-panel" style={{ '--delay': `${index * 0.15}s` } as any}>
                        <div className="card-header">
                            <div className="strategy-number">0{index + 1}</div>
                            <h3 className="strategy-title">{strategy.title}</h3>
                        </div>

                        <p className="strategy-description">{strategy.description}</p>

                        <div className="strategy-reasoning-box">
                            <div className="reasoning-header">
                                <Lightbulb size={14} className="text-yellow-400" />
                                <span>Por qué funcionará</span>
                            </div>
                            <p>{strategy.reasoning}</p>
                        </div>

                        <div className="strategy-tactics-list">
                            <span className="tactics-label">Tácticas Clave</span>
                            <ul>
                                {strategy.tactics.map((tactic, idx) => (
                                    <li key={idx}>
                                        <TrendingUp size={14} className="text-success-400" />
                                        {tactic}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="strategy-footer">
                            {strategy.seasonalContext && (
                                <div className="context-tag seasonal">
                                    <Calendar size={12} />
                                    {strategy.seasonalContext}
                                </div>
                            )}
                            {strategy.locationContext && (
                                <div className="context-tag location">
                                    <MapPin size={12} />
                                    {strategy.locationContext}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="ai-note-card glass-panel">
                <div className="note-content">
                    <Sparkles size={20} className="text-primary-400" />
                    <p>
                        Estas estrategias son el cimiento de tu presencia digital.
                        En el siguiente paso, convertiremos estas ideas en <strong>enlaces accionables</strong> para tu landing page.
                    </p>
                </div>
            </div>
        </div>
    );
}
