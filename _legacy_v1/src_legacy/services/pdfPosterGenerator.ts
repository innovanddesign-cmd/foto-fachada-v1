/**
 * PDF Poster Generator (Frontend Service)
 * ========================================
 * Client-side interface for the Backend Poster Service (Puppeteer).
 * Now delegates heavy lifting to the server for high-quality rendering.
 */
// import { generatePosterPdf } from './backendService'; // Removed unused import 
// Actually, let's call fetch directly or use a helper. 
// I'll implement the fetch call here directly to minimize dependency on backendService changes if possible, 
// OR I should use the backendService. 
// Let's use direct fetch for clarity as this is a specific service.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

interface PrintPosterConfig {
    businessName: string;
    businessType: string;
    tagline?: string;
    landingUrl: string;
    primaryColor: string;
    secondaryColor?: string;
    phone?: string;
    address?: string;
}

/**
 * Download poster PDF from backend
 */
export async function downloadPrintPoster(config: PrintPosterConfig): Promise<void> {
    try {
        console.log('[PosterService] 🖨️ Requesting poster generation...');

        const response = await fetch(`${API_URL}/posters/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(config),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        // Get Blob from response
        const blob = await response.blob();

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Sanitize filename
        const safeName = config.businessName.toLowerCase().replace(/[^a-z0-9]/g, '_');
        link.download = `cartel_${safeName}_${Date.now()}.pdf`;

        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log('[PosterService] ✅ Poster downloaded successfully');

    } catch (error) {
        console.error('[PosterService] Download failed:', error);
        throw error;
    }
}

// Deprecated client-side function kept for type compatibility if needed, but throwing error
export async function generatePrintPoster(config: PrintPosterConfig): Promise<any> {
    console.warn('generatePrintPoster is deprecated. Use downloadPrintPoster.');
    return downloadPrintPoster(config);
}

export type { PrintPosterConfig };
