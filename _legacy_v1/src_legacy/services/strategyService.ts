/**
 * Strategy Service
 * =================
 * Client-side service to interact with the AI strategy generation API
 */

// Client-side service to interact with the AI strategy generation API

// Re-defining client-side types to avoid direct server dependency if needed, 
// but for this mono-repo setup we might import types. 
// However, server types might not be exposed to client build. 
// Let's define safe client interfaces.

export interface ClientBrandData {
    name: string;
    businessType: string;
    style?: string;
    targetAudience?: string;
    description?: string;
    niche?: string;
    primaryColor?: string;
    location?: string;
}

export interface UIConfigField {
    key: string;
    label: string;
    type: 'text' | 'number' | 'color' | 'tel' | 'email' | 'textarea';
    default?: string | number;
    placeholder?: string;
}

export interface ClientStrategy {
    id: string;
    emoji: string;
    title: string;
    description: string;
    vibe_analysis: string;
    typography: string;
    visual_mechanic: string;
    ui_config_schema: UIConfigField[]; // using strict type instead of any[]
    code_template: string;
    _meta?: {
        generatedAt: string;
        seasonalContext: string[];
        index: number;
    };
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function generateStrategies(brandData: ClientBrandData): Promise<ClientStrategy[]> {
    try {
        const response = await fetch(`${API_URL}/api/generate-strategies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Auth header should be handled by global fetch interceptor or included here if using token from localStorage
                'Authorization': `Bearer ${localStorage.getItem('foto_fachada_jwt')}`
            },
            body: JSON.stringify({ brandData })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to generate strategies');
        }

        const data = await response.json();
        return data.strategies;
    } catch (error) {
        console.error('[StrategyService] Error:', error);
        throw error;
    }
}
