import { useState } from 'react';
import { X, Sparkles, Users, Clock, Gamepad2, Trophy } from 'lucide-react';
import './StrategySelector.css';

interface Strategy {
    id: string;
    title: string;
    description: string;
    category: 'gamification' | 'social-proof' | 'urgency';
    icon: JSX.Element;
}

interface StrategySelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (strategyId: string) => void;
    currentStrategy?: string;
}

const AVAILABLE_STRATEGIES: Strategy[] = [
    {
        id: 'fortune-wheel',
        title: 'Ruleta de la Fortuna',
        description: 'Rueda interactiva con premios y descuentos',
        category: 'gamification',
        icon: <Trophy size={24} />
    },
    {
        id: 'social-wall',
        title: 'Muro Social',
        description: 'Galería de testimonios y fotos de clientes',
        category: 'social-proof',
        icon: <Users size={24} />
    },
    {
        id: 'flash-offer',
        title: 'Oferta Flash',
        description: 'Contador regresivo con oferta limitada',
        category: 'urgency',
        icon: <Clock size={24} />
    },
    {
        id: 'scratch-card',
        title: 'Rasca y Gana',
        description: 'Tarjeta interactiva para revelar premio',
        category: 'gamification',
        icon: <Gamepad2 size={24} />
    },
    {
        id: 'memory-game',
        title: 'Juego de Memoria',
        description: 'Mini-juego de matching con premios',
        category: 'gamification',
        icon: <Sparkles size={24} />
    }
];

const CATEGORY_LABELS = {
    'gamification': 'Gamificación',
    'social-proof': 'Prueba Social',
    'urgency': 'Urgencia'
};

export function StrategySelector({ isOpen, onClose, onSelect, currentStrategy }: StrategySelectorProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    if (!isOpen) return null;

    const filteredStrategies = selectedCategory
        ? AVAILABLE_STRATEGIES.filter(s => s.category === selectedCategory)
        : AVAILABLE_STRATEGIES;

    const handleSelect = (strategyId: string) => {
        onSelect(strategyId);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content strategy-selector" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Elige una Acción Interactiva</h2>
                    <button className="btn-icon" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Category Filters */}
                <div className="category-filters">
                    <button
                        className={`category-chip ${!selectedCategory ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(null)}
                    >
                        Todas
                    </button>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <button
                            key={key}
                            className={`category-chip ${selectedCategory === key ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(key)}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Strategies Grid */}
                <div className="strategies-grid">
                    {filteredStrategies.map((strategy) => (
                        <div
                            key={strategy.id}
                            className={`strategy-card ${currentStrategy === strategy.id ? 'current' : ''}`}
                            onClick={() => handleSelect(strategy.id)}
                        >
                            <div className="strategy-icon">
                                {strategy.icon}
                            </div>
                            <h3>{strategy.title}</h3>
                            <p>{strategy.description}</p>
                            {currentStrategy === strategy.id && (
                                <span className="current-badge">Actual</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
