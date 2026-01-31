/**
 * Widget Generation Service
 * Auto-generates widget pages for campaigns
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface WidgetGenerationResponse {
    success: boolean;
    message: string;
    strategy: {
        title: string;
        description: string;
    };
    widgets: Array<{
        id: string;
        title: string;
        emoji: string;
        url: string;
        slug: string;
    }>;
    campaignId: string;
    proposalId: string;
}

/**
 * Automatically generates 3 widget pages for a campaign
 * This calls the backend endpoint that:
 * 1. Generates 1 optimized strategy with 3 widgets
 * 2. Creates 3 individual functional web pages
 * 3. Returns public URLs for each widget
 */
export async function autoGenerateWidgets(campaignId: string): Promise<WidgetGenerationResponse> {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('No authentication token found');
    }

    console.log('[WidgetService] Starting auto-generation for campaign:', campaignId);

    const response = await fetch(`${API_BASE}/campaigns/${campaignId}/auto-generate`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }

    const data = await response.json();

    console.log('[WidgetService] ✅ Widgets generated:', data.widgets.length);

    return data;
}

/**
 * Check if widgets have been generated for a campaign
 */
export async function checkWidgetsGenerated(campaignId: string): Promise<boolean> {
    const token = localStorage.getItem('token');

    if (!token) {
        return false;
    }

    try {
        const response = await fetch(`${API_BASE}/campaigns/${campaignId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            return false;
        }

        const data = await response.json();

        // Check if campaign has widgets (check for widget_pages in response)
        // This would need to be added to the backend campaign GET endpoint
        return data.campaign?.hasWidgets || false;
    } catch (error) {
        console.error('[WidgetService] Error checking widgets:', error);
        return false;
    }
}
