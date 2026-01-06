/**
 * DynamicFormBuilder / WidgetConfigurator
 * ========================================
 * Dynamically generates form inputs based on AI-provided ui_config_schema.
 * Supports multiple field types with enhanced UX.
 */
import { useState, useEffect, useCallback } from 'react';
import { Phone, Mail, Type, Hash, Palette, AlignLeft, List, HelpCircle } from 'lucide-react';
import type { WidgetConfigField } from '../../types';

interface WidgetConfiguratorProps {
    schema: WidgetConfigField[];
    onChange: (values: Record<string, any>) => void;
    initialValues?: Record<string, any>;
}

// Icon mapping for field types
const fieldIcons: Record<string, any> = {
    text: Type,
    tel: Phone,
    email: Mail,
    number: Hash,
    color: Palette,
    textarea: AlignLeft,
    list: List,
};

export function WidgetConfigurator({ schema, onChange, initialValues = {} }: WidgetConfiguratorProps) {
    const [values, setValues] = useState<Record<string, any>>({});
    const [, setTouched] = useState<Record<string, boolean>>({});

    // Initialize with defaults and initial values
    useEffect(() => {
        const mergedValues: Record<string, any> = {};
        schema.forEach(field => {
            // Priority: initialValues > current values > defaults
            mergedValues[field.key] = initialValues[field.key] ?? values[field.key] ?? field.default ?? '';
        });
        setValues(mergedValues);
        onChange(mergedValues);
    }, [schema]); // Only re-run when schema changes

    const handleChange = useCallback((key: string, value: any) => {
        setValues(prev => {
            const newValues = { ...prev, [key]: value };
            onChange(newValues);
            return newValues;
        });
    }, [onChange]);

    const handleBlur = useCallback((key: string) => {
        setTouched(prev => ({ ...prev, [key]: true }));
    }, []);

    const getFieldIcon = (type: string) => {
        const Icon = fieldIcons[type] || HelpCircle;
        return <Icon size={16} className="text-slate-500" />;
    };

    const renderField = (field: WidgetConfigField) => {
        const baseInputClass = `
            w-full px-3 py-2.5 
            bg-slate-800/80 border border-slate-600/50 
            rounded-lg text-white 
            focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 
            outline-none transition-all duration-200
            placeholder:text-slate-500
        `;

        switch (field.type) {
            case 'text':
                return (
                    <div className="relative">
                        <input
                            type="text"
                            value={values[field.key] || ''}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            onBlur={() => handleBlur(field.key)}
                            placeholder={field.placeholder || 'Escribe aquí...'}
                            className={baseInputClass}
                        />
                    </div>
                );

            case 'number':
                return (
                    <input
                        type="number"
                        value={values[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        onBlur={() => handleBlur(field.key)}
                        placeholder={field.placeholder || '0'}
                        className={baseInputClass}
                    />
                );

            case 'tel':
                return (
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">+</span>
                        <input
                            type="tel"
                            value={values[field.key] || ''}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            onBlur={() => handleBlur(field.key)}
                            placeholder={field.placeholder || '34 600 123 456'}
                            className={`${baseInputClass} pl-7`}
                        />
                    </div>
                );

            case 'email':
                return (
                    <input
                        type="email"
                        value={values[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        onBlur={() => handleBlur(field.key)}
                        placeholder={field.placeholder || 'tu@email.com'}
                        className={baseInputClass}
                    />
                );

            case 'textarea':
                return (
                    <textarea
                        value={values[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        onBlur={() => handleBlur(field.key)}
                        placeholder={field.placeholder || 'Escribe tu texto aquí...'}
                        rows={3}
                        className={`${baseInputClass} resize-none`}
                    />
                );

            case 'color':
                return (
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <input
                                type="color"
                                value={values[field.key] || '#6366f1'}
                                onChange={(e) => handleChange(field.key, e.target.value)}
                                className="h-12 w-16 bg-transparent border-2 border-slate-600 rounded-lg cursor-pointer appearance-none overflow-hidden"
                                style={{
                                    backgroundColor: values[field.key] || '#6366f1',
                                }}
                            />
                        </div>
                        <div className="flex-1">
                            <input
                                type="text"
                                value={values[field.key] || '#6366f1'}
                                onChange={(e) => handleChange(field.key, e.target.value)}
                                placeholder="#FFFFFF"
                                className={`${baseInputClass} font-mono text-sm`}
                            />
                        </div>
                    </div>
                );

            case 'list':
                // For list type, we'll use a textarea with line-separated values
                return (
                    <div>
                        <textarea
                            value={values[field.key] || ''}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            onBlur={() => handleBlur(field.key)}
                            placeholder={field.placeholder || 'Opción 1\nOpción 2\nOpción 3'}
                            rows={4}
                            className={`${baseInputClass} resize-none font-mono text-sm`}
                        />
                        <p className="text-xs text-slate-500 mt-1">Una opción por línea</p>
                    </div>
                );

            default:
                // Fallback to text
                return (
                    <input
                        type="text"
                        value={values[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className={baseInputClass}
                    />
                );
        }
    };

    if (!schema || schema.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500">
                <HelpCircle size={32} className="mx-auto mb-2 opacity-50" />
                <p>No hay campos configurables para este widget</p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {schema.map((field, index) => (
                <div
                    key={field.key}
                    className="group animate-fadeIn"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    {/* Label with icon */}
                    <label className="flex items-center gap-2 mb-2">
                        <span className="p-1.5 bg-slate-700/50 rounded-md">
                            {getFieldIcon(field.type)}
                        </span>
                        <span className="text-sm font-medium text-slate-200">
                            {field.label}
                        </span>
                    </label>

                    {/* Field input */}
                    {renderField(field)}

                    {/* Helper text for variables */}
                    <p className="text-xs text-slate-600 mt-1 font-mono">
                        {'{{' + field.key + '}}'}
                    </p>
                </div>
            ))}

            {/* Summary */}
            <div className="pt-4 border-t border-slate-700/50">
                <p className="text-xs text-slate-500 text-center">
                    {schema.length} campos configurables • Los cambios se reflejan en tiempo real
                </p>
            </div>
        </div>
    );
}
