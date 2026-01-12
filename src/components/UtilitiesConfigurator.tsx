/**
 * Utilities Configurator Component
 * ================================
 * Panel dinámico que muestra formularios solo para las utilidades seleccionadas.
 * Step 2: Configuración inteligente por utilidad.
 */

import React, { useState } from 'react';
import { getUtility } from '../data/utilitiesData';
import type { UtilityId, LandingUtilities } from '../types';
import './UtilitiesConfigurator.css';

interface UtilitiesConfiguratorProps {
    selected: UtilityId[];
    configs: LandingUtilities['configs'];
    onChange: (configs: LandingUtilities['configs']) => void;
}

export const UtilitiesConfigurator: React.FC<UtilitiesConfiguratorProps> = ({
    selected,
    configs,
    onChange
}) => {
    const [expandedId, setExpandedId] = useState<UtilityId | null>(selected[0] || null);

    const updateConfig = (utilityId: UtilityId, key: string, value: string) => {
        const newConfigs = {
            ...configs,
            [utilityId]: {
                ...(configs[utilityId] || {}),
                [key]: value
            }
        };
        onChange(newConfigs);
    };

    const getConfigValue = (utilityId: UtilityId, key: string): string => {
        return configs[utilityId]?.[key] || '';
    };

    const isComplete = (utilityId: UtilityId): boolean => {
        const utility = getUtility(utilityId);
        if (!utility) return false;

        return utility.fields
            .filter(f => f.required)
            .every(f => getConfigValue(utilityId, f.key).trim() !== '');
    };

    if (selected.length === 0) {
        return (
            <div className="configurator-empty">
                <span className="empty-icon">📋</span>
                <p>Selecciona al menos una función para configurar</p>
            </div>
        );
    }

    return (
        <div className="utilities-configurator">
            <div className="configurator-header">
                <h2 className="configurator-title">
                    <span className="configurator-icon">⚙️</span>
                    Configura tus funciones
                </h2>
                <p className="configurator-subtitle">
                    Completa los datos de cada botón seleccionado
                </p>
            </div>

            <div className="configurator-list">
                {selected.map(utilityId => {
                    const utility = getUtility(utilityId);
                    if (!utility) return null;

                    const isExpanded = expandedId === utilityId;
                    const complete = isComplete(utilityId);

                    return (
                        <div
                            key={utilityId}
                            className={`configurator-item ${isExpanded ? 'expanded' : ''} ${complete ? 'complete' : ''}`}
                        >
                            <button
                                type="button"
                                className="configurator-item-header"
                                onClick={() => setExpandedId(isExpanded ? null : utilityId)}
                            >
                                <span className="item-emoji">{utility.emoji}</span>
                                <span className="item-name">{utility.name}</span>
                                {complete ? (
                                    <span className="item-badge complete">✓ Listo</span>
                                ) : (
                                    <span className="item-badge pending">Pendiente</span>
                                )}
                                <svg
                                    className={`item-chevron ${isExpanded ? 'rotated' : ''}`}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>

                            {isExpanded && (
                                <div className="configurator-item-body">
                                    {utility.fields.map(field => (
                                        <div key={field.key} className="config-field">
                                            <label className="field-label">
                                                {field.label}
                                                {field.required && <span className="required">*</span>}
                                            </label>

                                            {field.type === 'textarea' || field.type === 'list' ? (
                                                <textarea
                                                    className="field-textarea"
                                                    placeholder={field.placeholder}
                                                    value={getConfigValue(utilityId, field.key)}
                                                    onChange={(e) => updateConfig(utilityId, field.key, e.target.value)}
                                                    rows={4}
                                                />
                                            ) : (
                                                <input
                                                    type={field.type === 'tel' ? 'tel' : field.type === 'url' ? 'url' : 'text'}
                                                    className="field-input"
                                                    placeholder={field.placeholder}
                                                    value={getConfigValue(utilityId, field.key)}
                                                    onChange={(e) => updateConfig(utilityId, field.key, e.target.value)}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="configurator-progress">
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{
                            width: `${(selected.filter(id => isComplete(id)).length / selected.length) * 100}%`
                        }}
                    />
                </div>
                <span className="progress-text">
                    {selected.filter(id => isComplete(id)).length} de {selected.length} completados
                </span>
            </div>
        </div>
    );
};

export default UtilitiesConfigurator;
