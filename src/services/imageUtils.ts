/**
 * Image Utilities
 * ================
 * Client-side image validation and compression
 */

// Supported image formats
export const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
export const MIN_WIDTH = 1280;
export const MIN_HEIGHT = 720;
export const MAX_SIZE_MB = 5;
export const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

/**
 * Validation result interface
 */
export interface ValidationResult {
    valid: boolean;
    error?: string;
    width?: number;
    height?: number;
    originalSize?: number;
}

/**
 * Validates image format (MIME type)
 */
export function validateImageFormat(file: File): boolean {
    return SUPPORTED_FORMATS.includes(file.type);
}

/**
 * Validates image dimensions
 * @returns Promise with validation result including dimensions
 */
export function validateImageDimensions(file: File): Promise<ValidationResult> {
    return new Promise((resolve) => {
        // First check format
        if (!validateImageFormat(file)) {
            resolve({
                valid: false,
                error: `Formato no soportado. Usa JPG, PNG o WEBP.`,
                originalSize: file.size
            });
            return;
        }

        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            const width = img.naturalWidth;
            const height = img.naturalHeight;

            if (width < MIN_WIDTH || height < MIN_HEIGHT) {
                resolve({
                    valid: false,
                    error: `Imagen muy pequeña (${width}x${height}). Mínimo: ${MIN_WIDTH}x${MIN_HEIGHT}px.`,
                    width,
                    height,
                    originalSize: file.size
                });
            } else {
                resolve({
                    valid: true,
                    width,
                    height,
                    originalSize: file.size
                });
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve({
                valid: false,
                error: 'Error al cargar la imagen. El archivo puede estar corrupto.',
                originalSize: file.size
            });
        };

        img.src = url;
    });
}

/**
 * Compress image to target size
 * Uses canvas API to re-encode with lower quality
 */
export function compressImage(
    file: File,
    maxSizeMB: number = MAX_SIZE_MB,
    maxWidth: number = 2048
): Promise<{ blob: Blob; compressed: boolean; originalSize: number; newSize: number }> {
    return new Promise((resolve, reject) => {
        const maxBytes = maxSizeMB * 1024 * 1024;

        // If already small enough, return as-is
        if (file.size <= maxBytes) {
            resolve({
                blob: file,
                compressed: false,
                originalSize: file.size,
                newSize: file.size
            });
            return;
        }

        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            // Calculate new dimensions (maintain aspect ratio)
            let width = img.naturalWidth;
            let height = img.naturalHeight;

            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            // Create canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Canvas context not available'));
                return;
            }

            // Draw image
            ctx.drawImage(img, 0, 0, width, height);

            // Try different quality levels to hit target size
            const outputFormat = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
            let quality = 0.85;
            let attempts = 0;
            const maxAttempts = 5;

            const tryCompress = () => {
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Compression failed'));
                            return;
                        }

                        // If still too big and we have attempts left, try lower quality
                        if (blob.size > maxBytes && attempts < maxAttempts && quality > 0.3) {
                            attempts++;
                            quality -= 0.15;
                            tryCompress();
                            return;
                        }

                        resolve({
                            blob,
                            compressed: true,
                            originalSize: file.size,
                            newSize: blob.size
                        });
                    },
                    outputFormat,
                    quality
                );
            };

            tryCompress();
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image for compression'));
        };

        img.src = url;
    });
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Check if device is mobile
 */
export function isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
}

/**
 * Create a preview URL for an image
 */
export function createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
}

/**
 * Revoke a preview URL to free memory
 */
export function revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
}

/**
 * Converts a blob URL to a base64 string
 */
export async function blobToBase64(blobUrl: string): Promise<string> {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
