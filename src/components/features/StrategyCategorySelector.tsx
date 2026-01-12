/**
 * StrategyCategorySelector
 * ========================
 * Premium card selector for the 3 strategic categories:
 * - VENTAS (Sales) - For immediate revenue generation
 * - FIDELIZACIÓN (Loyalty) - For customer retention
 * - AUTORIDAD (Authority) - For building trust and credibility
 */
import { useState } from 'react';
import { ArrowRight, Sparkles, TrendingUp, Users, Award } from 'lucide-react';
import { STRATEGIC_CATEGORIES, type StrategicCategory, type StrategicAction } from '../../data/strategicCategories';
import './StrategyCategorySelector.css';

interface StrategyCategorySelectorProps {
    onSelectCategory: (category: StrategicCategory) => void;
    onSelectAction: (action: StrategicAction, category: StrategicCategory) => void;
    selectedCategory?: StrategicCategory | null;
    isLoading?: boolean;
}

// Map category ID to icon component
const categoryIcons = {
    VENTAS: TrendingUp,
    FIDELIZACION: Users,
    AUTORIDAD: Award,
};

export function StrategyCategorySelector({
    onSelectCategory,
    onSelectAction,
    selectedCategory,
    isLoading = false
}: StrategyCategorySelectorProps) {
    const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
    const [hoveredActionId, setHoveredActionId] = useState<number | null>(null);

    if (isLoading) {
        return (
            <div className="strategy-category-selector loading">
                <div className="loading-grid">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="category-card-skeleton">
                            <div className="skeleton-emoji" />
                            <div className="skeleton-title" />
                            <div className="skeleton-text" />
                            <div className="skeleton-text short" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // If a category is selected, show its actions
    if (selectedCategory) {
        return (
            <div className="strategy-category-selector actions-view">
                {/* Selected category header */}
                <div className="selected-category-header">
                    <button
                        className="back-button"
                        onClick={() => onSelectCategory(null as any)}
                        aria-label="Volver a categorías"
                    >
                        <ArrowRight className="rotate-180" size={20} />
                        <span>Cambiar categoría</span>
                    </button>
                    <div className="selected-badge" style={{
                        background: `linear-gradient(135deg, ${selectedCategory.glowColor}, transparent)`
                    }}>
                        <span className="selected-emoji">{selectedCategory.emoji}</span>
                        <span className="selected-title">{selectedCategory.title}</span>
                    </div>
                </div>

                {/* Actions grid */}
                <div className="actions-grid">
                    {selectedCategory.actions.map((action, index) => (
                        <div
                            key={action.id}
                            className={`action-card ${hoveredActionId === action.id ? 'hovered' : ''}`}
                            onClick={() => onSelectAction(action, selectedCategory)}
                            onMouseEnter={() => setHoveredActionId(action.id)}
                            onMouseLeave={() => setHoveredActionId(null)}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="action-icon">
                                <span>{action.emoji}</span>
                            </div>
                            <div className="action-content">
                                <h4 className="action-name">{action.name}</h4>
                                <p className="action-description">{action.description}</p>
                                <p className="action-example">{action.example}</p>
                            </div>
                            <div className="action-cta">
                                <ArrowRight size={18} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Info note */}
                <div className="actions-info">
                    <Sparkles size={16} />
                    <p>Selecciona una acción para configurar tu página personalizada</p>
                </div>
            </div>
        );
    }

    // Main category selection view
    return (
        <div className="strategy-category-selector">
            {/* Header */}
            <div className="selector-header">
                <div className="header-icon">
                    <Sparkles size={24} />
                </div>
                <div className="header-text">
                    <h2>¿Cuál es tu objetivo principal?</h2>
                    <p>Selecciona la estrategia que mejor se adapte a las necesidades actuales de tu negocio</p>
                </div>
            </div>

            {/* Category cards */}
            <div className="categories-grid">
                {STRATEGIC_CATEGORIES.map((category, index) => {
                    const Icon = categoryIcons[category.id];
                    const isHovered = hoveredCategoryId === category.id;

                    return (
                        <div
                            key={category.id}
                            className={`category-card ${isHovered ? 'hovered' : ''}`}
                            onClick={() => onSelectCategory(category)}
                            onMouseEnter={() => setHoveredCategoryId(category.id)}
                            onMouseLeave={() => setHoveredCategoryId(null)}
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            {/* Glow effect background */}
                            <div
                                className="card-glow"
                                style={{
                                    background: `radial-gradient(circle at center, ${category.glowColor}, transparent 70%)`
                                }}
                            />

                            {/* Gradient border */}
                            <div className={`card-border bg-gradient-to-br ${category.gradient}`} />

                            {/* Card content */}
                            <div className="card-inner">
                                {/* Emoji header */}
                                <div className="card-emoji-container">
                                    <span className="card-emoji">{category.emoji}</span>
                                    <div className="emoji-ring" />
                                </div>

                                {/* Title & tagline */}
                                <div className="card-title-wrapper">
                                    <h3 className="card-title">{category.title}</h3>
                                    <span className={`card-tagline bg-gradient-to-r ${category.gradient}`}>
                                        {category.tagline}
                                    </span>
                                </div>

                                {/* Description */}
                                <p className="card-description">{category.description}</p>

                                {/* Actions preview */}
                                <div className="card-actions-preview">
                                    {category.actions.map(action => (
                                        <span key={action.id} className="action-badge">
                                            {action.emoji} {action.name}
                                        </span>
                                    ))}
                                </div>

                                {/* CTA */}
                                <button className={`card-cta bg-gradient-to-r ${category.gradient}`}>
                                    <Icon size={18} />
                                    <span>Elegir {category.title.toLowerCase()}</span>
                                    <ArrowRight size={16} className="cta-arrow" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom note */}
            <div className="selector-note">
                <p>💡 <strong>Tip:</strong> Puedes crear múltiples páginas con diferentes estrategias para maximizar resultados</p>
            </div>
        </div>
    );
}
