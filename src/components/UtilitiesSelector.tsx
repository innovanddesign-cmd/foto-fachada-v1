/**
 * Utilities Selector Component
 * ============================
 * Checklist visual para seleccionar funciones de la landing.
 * Step 1: Selección multi-opción con iconos modernos.
 */

import React from 'react';
import { getGroupedUtilities } from '../data/utilitiesData';
import type { UtilityId } from '../types';
import './UtilitiesSelector.css';

interface UtilitiesSelectorProps {
    selected: UtilityId[];
    onChange: (selected: UtilityId[]) => void;
}

export const UtilitiesSelector: React.FC<UtilitiesSelectorProps> = ({
    selected,
    onChange
}) => {
    const groupedUtilities = getGroupedUtilities();

    const toggleUtility = (id: UtilityId) => {
        if (selected.includes(id)) {
            onChange(selected.filter(s => s !== id));
        } else {
            onChange([...selected, id]);
        }
    };

    const isSelected = (id: UtilityId) => selected.includes(id);

    return (
        <div className="utilities-selector">
            <div className="utilities-header">
                <h2 className="utilities-title">
                    <span className="utilities-icon">🧩</span>
                    Funciones para tu Landing
                </h2>
                <p className="utilities-subtitle">
                    Selecciona los botones que quieres incluir
                </p>
            </div>

            <div className="utilities-grid">
                {Object.entries(groupedUtilities).map(([category, utilities]) => (
                    <div key={category} className="utility-category">
                        <h3 className="category-title">{category}</h3>
                        <div className="utility-list">
                            {utilities.map(utility => (
                                <button
                                    key={utility.id}
                                    type="button"
                                    className={`utility-card ${isSelected(utility.id) ? 'selected' : ''}`}
                                    onClick={() => toggleUtility(utility.id)}
                                >
                                    <div className="utility-checkbox">
                                        {isSelected(utility.id) ? (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        ) : null}
                                    </div>
                                    <span className="utility-emoji">{utility.emoji}</span>
                                    <div className="utility-info">
                                        <span className="utility-name">{utility.name}</span>
                                        <span className="utility-desc">{utility.description}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {selected.length > 0 && (
                <div className="utilities-summary">
                    <span className="summary-count">{selected.length}</span>
                    <span className="summary-text">
                        {selected.length === 1 ? 'función seleccionada' : 'funciones seleccionadas'}
                    </span>
                </div>
            )}
        </div>
    );
};

export default UtilitiesSelector;
