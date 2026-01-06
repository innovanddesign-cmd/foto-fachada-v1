/**
 * GenerativeWidgetSelector
 * ========================
 * Displays AI-generated strategy cards for user selection.
 * Each card shows emoji, title, description, and a preview of config fields.
 */
import { useState } from 'react';
import { Sparkles, Zap, Settings2, Code2, ChevronRight, Star } from 'lucide-react';
import type { GenerativeStrategy } from '../../types';

interface GenerativeWidgetSelectorProps {
    strategies: GenerativeStrategy[];
    onSelect: (strategy: GenerativeStrategy) => void;
    isLoading?: boolean;
}

export function GenerativeWidgetSelector({ strategies, onSelect, isLoading }: GenerativeWidgetSelectorProps) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                        <div className="bg-slate-800/50 rounded-2xl p-6 h-64">
                            <div className="w-12 h-12 bg-slate-700 rounded-xl mb-4" />
                            <div className="h-6 bg-slate-700 rounded w-3/4 mb-3" />
                            <div className="h-4 bg-slate-700/50 rounded w-full mb-2" />
                            <div className="h-4 bg-slate-700/50 rounded w-2/3" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!strategies || strategies.length === 0) {
        return (
            <div className="text-center py-12 text-slate-400">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay estrategias generadas todavía.</p>
                <p className="text-sm mt-1">Haz clic en "Generar Estrategias" para comenzar.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {strategies.map((strategy, index) => {
                const isHovered = hoveredId === strategy.id;
                const configFieldCount = strategy.ui_config_schema?.length || 0;
                const codeSize = strategy.code_template?.length || 0;

                return (
                    <div
                        key={strategy.id || index}
                        className="relative group cursor-pointer"
                        onClick={() => onSelect(strategy)}
                        onMouseEnter={() => setHoveredId(strategy.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* Glow effect */}
                        <div
                            className={`
                                absolute -inset-0.5 rounded-2xl 
                                bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 
                                opacity-0 group-hover:opacity-75 
                                transition-all duration-300 blur-sm
                                ${isHovered ? 'opacity-75' : ''}
                            `}
                        />

                        {/* Card */}
                        <div
                            className={`
                                relative h-full 
                                bg-gradient-to-br from-slate-900 to-slate-800 
                                border border-slate-700/50 rounded-2xl 
                                p-6 
                                transition-all duration-300
                                ${isHovered ? 'transform -translate-y-1 shadow-2xl' : 'shadow-lg'}
                                flex flex-col
                            `}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div
                                    className={`
                                        text-5xl filter drop-shadow-lg
                                        transition-transform duration-300
                                        ${isHovered ? 'transform scale-110' : ''}
                                    `}
                                >
                                    {strategy.emoji || '🚀'}
                                </div>
                                <div className="flex items-center gap-1">
                                    {index === 0 && (
                                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full flex items-center gap-1">
                                            <Star size={10} fill="currentColor" />
                                            Top
                                        </span>
                                    )}
                                    <div className="p-2 bg-slate-700/50 rounded-full">
                                        <Zap size={14} className="text-yellow-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                                {strategy.title}
                            </h3>

                            {/* Description */}
                            <p className="text-slate-400 text-sm flex-grow mb-4 line-clamp-3">
                                {strategy.description}
                            </p>

                            {/* Stats */}
                            <div className="flex items-center gap-3 mb-4 text-xs text-slate-500">
                                <div className="flex items-center gap-1">
                                    <Settings2 size={12} />
                                    <span>{configFieldCount} campos</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Code2 size={12} />
                                    <span>{Math.round(codeSize / 1024)}KB código</span>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <button
                                className={`
                                    w-full py-3 rounded-xl font-medium
                                    flex items-center justify-center gap-2
                                    transition-all duration-300
                                    ${isHovered
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                                    }
                                `}
                            >
                                <Sparkles size={16} className={isHovered ? 'animate-pulse' : ''} />
                                <span>Configurar Widget</span>
                                <ChevronRight size={16} className={`transition-transform ${isHovered ? 'translate-x-1' : ''}`} />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
