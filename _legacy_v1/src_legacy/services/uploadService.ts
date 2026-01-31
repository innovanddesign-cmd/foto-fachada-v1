/**
 * Upload Service
 * ===============
 * Handles image uploads to backend with progress tracking
 */

// API URL from environment
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

/**
 * Upload progress callback type
 */
export type ProgressCallback = (progress: number) => void;

/**
 * Upload result interface
 */
export interface UploadResult {
    success: boolean;
    url?: string;
    id?: string;
    error?: string;
}

/**
 * Upload options
 */
export interface UploadOptions {
    clientId?: string;
    campaignId?: string;
    onProgress?: ProgressCallback;
}

/**
 * Upload image to server with progress tracking
 * Uses XMLHttpRequest for progress events (fetch doesn't support upload progress)
 */
export function uploadImage(
    file: Blob,
    filename: string,
    options: UploadOptions = {}
): Promise<UploadResult> {
    return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();

        // Append file and metadata
        formData.append('image', file, filename);
        if (options.clientId) formData.append('clientId', options.clientId);
        if (options.campaignId) formData.append('campaignId', options.campaignId);

        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable && options.onProgress) {
                const progress = Math.round((event.loaded / event.total) * 100);
                options.onProgress(progress);
            }
        });

        // Handle completion
        xhr.addEventListener('load', () => {
            try {
                const response = JSON.parse(xhr.responseText);

                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve({
                        success: true,
                        url: response.url,
                        id: response.id
                    });
                } else {
                    resolve({
                        success: false,
                        error: response.error || `Error del servidor: ${xhr.status}`
                    });
                }
            } catch {
                resolve({
                    success: false,
                    error: 'Error procesando respuesta del servidor'
                });
            }
        });

        // Handle errors
        xhr.addEventListener('error', () => {
            resolve({
                success: false,
                error: 'Error de conexión. Verifica tu internet.'
            });
        });

        xhr.addEventListener('abort', () => {
            resolve({
                success: false,
                error: 'Upload cancelado'
            });
        });

        // Open connection and send
        xhr.open('POST', `${API_URL}/uploads/image`);
        xhr.withCredentials = true; // Include cookies for auth
        xhr.send(formData);
    });
}

/**
 * Upload multiple images sequentially with combined progress
 */
export async function uploadMultipleImages(
    files: Array<{ blob: Blob; filename: string }>,
    options: UploadOptions = {}
): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    const totalFiles = files.length;
    let completedFiles = 0;

    for (const file of files) {
        const result = await uploadImage(file.blob, file.filename, {
            ...options,
            onProgress: (fileProgress) => {
                // Calculate combined progress
                const overallProgress = Math.round(
                    ((completedFiles * 100) + fileProgress) / totalFiles
                );
                options.onProgress?.(overallProgress);
            }
        });

        results.push(result);
        completedFiles++;
    }

    return results;
}

/**
 * Cancel an ongoing upload (for future implementation with AbortController)
 */
export function createUploadController(): {
    upload: (file: Blob, filename: string, options?: UploadOptions) => Promise<UploadResult>;
    cancel: () => void;
} {
    let xhr: XMLHttpRequest | null = null;

    return {
        upload: (file, filename, options = {}) => {
            return new Promise((resolve) => {
                xhr = new XMLHttpRequest();
                const formData = new FormData();

                formData.append('image', file, filename);
                if (options.clientId) formData.append('clientId', options.clientId);
                if (options.campaignId) formData.append('campaignId', options.campaignId);

                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable && options.onProgress) {
                        options.onProgress(Math.round((event.loaded / event.total) * 100));
                    }
                });

                xhr.addEventListener('load', () => {
                    try {
                        const response = JSON.parse(xhr!.responseText);
                        resolve({
                            success: xhr!.status >= 200 && xhr!.status < 300,
                            url: response.url,
                            id: response.id,
                            error: response.error
                        });
                    } catch {
                        resolve({ success: false, error: 'Error procesando respuesta' });
                    }
                });

                xhr.addEventListener('error', () => {
                    resolve({ success: false, error: 'Error de conexión' });
                });

                xhr.addEventListener('abort', () => {
                    resolve({ success: false, error: 'Upload cancelado' });
                });

                xhr.open('POST', `${API_URL}/uploads/image`);
                xhr.withCredentials = true;
                xhr.send(formData);
            });
        },
        cancel: () => {
            if (xhr) {
                xhr.abort();
                xhr = null;
            }
        }
    };
}
