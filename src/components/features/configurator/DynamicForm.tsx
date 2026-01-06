/**
 * Dynamic Form Component
 * =======================
 * Renders a form based on the UI Config Schema from AI
 */
// import React from 'react';
import type { UIConfigField } from '../../../services/strategyService';
import './DynamicForm.css';

interface DynamicFormProps {
    schema: UIConfigField[];
    values: Record<string, any>;
    onChange: (key: string, value: any) => void;
}

export function DynamicForm({ schema, values, onChange }: DynamicFormProps) {

    if (!schema || schema.length === 0) {
        return <div className="text-gray-400 italic">No configuration fields available.</div>;
    }

    return (
        <div className="dynamic-form space-y-6">
            {schema.map((field) => (
                <div key={field.key} className="form-group">
                    <label htmlFor={field.key} className="block text-sm font-medium text-gray-300 mb-2">
                        {field.label}
                    </label>

                    {field.type === 'textarea' ? (
                        <textarea
                            id={field.key}
                            value={values[field.key] || ''}
                            onChange={(e) => onChange(field.key, e.target.value)}
                            className="bg-gray-800/50 border border-gray-700 rounded-lg w-full p-3 text-white focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                            placeholder={field.placeholder || ''}
                        />
                    ) : field.type === 'color' ? (
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                id={field.key}
                                value={values[field.key] || '#000000'}
                                onChange={(e) => onChange(field.key, e.target.value)}
                                className="bg-transparent border-0 w-12 h-12 p-0 cursor-pointer rounded overflow-hidden"
                            />
                            <input
                                type="text"
                                value={values[field.key] || '#000000'}
                                onChange={(e) => onChange(field.key, e.target.value)}
                                className="bg-gray-800/50 border border-gray-700 rounded-lg p-2 text-white font-mono uppercase w-32"
                            />
                        </div>
                    ) : (
                        <input
                            type={field.type}
                            id={field.key}
                            value={values[field.key] || ''}
                            onChange={(e) => onChange(field.key, e.target.value)}
                            className="bg-gray-800/50 border border-gray-700 rounded-lg w-full p-3 text-white focus:ring-2 focus:ring-indigo-500"
                            placeholder={field.placeholder || ''}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
