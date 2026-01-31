/**
 * Strategy Card Component
 * ========================
 * Interactive card displaying an AI-generated strategy
 */
// import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { ClientStrategy } from '../../../services/strategyService';
import './StrategyCard.css';

interface StrategyCardProps {
    strategy: ClientStrategy;
    isSelected: boolean;
    onSelect: (strategy: ClientStrategy) => void;
}

export function StrategyCard({ strategy, isSelected, onSelect }: StrategyCardProps) {
    return (
        <div
            className={`strategy-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(strategy)}
        >
            <div className="strategy-card-emoji-wrapper">
                <span className="strategy-emoji">{strategy.emoji}</span>
                {isSelected && (
                    <div className="selected-indicator">
                        <Sparkles size={14} className="text-white" />
                    </div>
                )}
            </div>

            <div className="strategy-card-content">
                <h3 className="strategy-title">{strategy.title}</h3>
                <p className="strategy-description">{strategy.description}</p>

                <div className="strategy-meta">
                    <span className="strategy-tag">{strategy.visual_mechanic}</span>
                </div>
            </div>

            <div className="strategy-card-footer">
                <button className={`strategy-select-btn ${isSelected ? 'active' : ''}`}>
                    {isSelected ? 'Seleccionada' : 'Elegir esta estrategia'}
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
}
