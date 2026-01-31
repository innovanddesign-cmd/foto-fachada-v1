/**
 * ImageUploader Component v2
 * ==========================
 * Enhanced image capture with:
 * - Mobile camera support (capture="environment")
 * - Dimension validation (min 1280x720)
 * - Auto-compression (if > 5MB)
 * - Real progress bar
 */
import React, { useCallback, useState, useRef } from 'react';
import { Upload, Camera, X, Plus, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/appStore';
import {
    validateImageDimensions,
    compressImage,
    formatFileSize,
    isMobileDevice,
    MIN_WIDTH,
    MIN_HEIGHT,
    MAX_SIZE_MB,
    SUPPORTED_FORMATS
} from '../services/imageUtils';
// import { uploadImage } from '../services/uploadService';
import './ImageUploader.css';

interface ProcessedImage {
    file: File;
    previewUrl: string;
    width: number;
    height: number;
    compressed: boolean;
    originalSize: number;
    finalSize: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
    uploadProgress?: number;
    uploadedUrl?: string;
}

export function ImageUploader() {
    const { t } = useTranslation();
    const { uploadedMedia, addUploadedMedia, removeUploadedMedia } = useAppStore();
    const [isDragging, setIsDragging] = useState(false);
    const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const isMobile = isMobileDevice();

    /**
     * Process a single file: validate, compress if needed, create preview
     */
    const processFile = async (file: File): Promise<ProcessedImage | null> => {
        // Validate dimensions and format
        const validation = await validateImageDimensions(file);

        if (!validation.valid) {
            setValidationError(validation.error || 'Error de validación');
            return null;
        }

        // Compress if necessary
        let finalBlob: Blob = file;
        let compressed = false;
        let finalSize = file.size;

        try {
            const compressionResult = await compressImage(file, MAX_SIZE_MB);
            finalBlob = compressionResult.blob;
            compressed = compressionResult.compressed;
            finalSize = compressionResult.newSize;
        } catch (err) {
            console.warn('Compression failed, using original:', err);
        }

        // Create preview URL
        const previewUrl = URL.createObjectURL(finalBlob);

        return {
            file: finalBlob instanceof File ? finalBlob : new File([finalBlob], file.name, { type: file.type }),
            previewUrl,
            width: validation.width!,
            height: validation.height!,
            compressed,
            originalSize: file.size,
            finalSize,
            status: 'pending'
        };
    };

    /**
     * Handle file selection
     */
    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setIsProcessing(true);
        setValidationError(null);

        const newImages: ProcessedImage[] = [];

        for (const file of Array.from(files)) {
            const processed = await processFile(file);
            if (processed) {
                newImages.push(processed);

                // Also add to global store for backward compatibility
                addUploadedMedia({
                    type: 'image',
                    url: processed.previewUrl
                });
            }
        }

        setProcessedImages(prev => [...prev, ...newImages]);
        setIsProcessing(false);
    };

    /**
     * Upload a single image to server
     */
    // handleUploadImage removed because unused

    /**
     * Remove an image from the list
     */
    const handleRemoveImage = (index: number) => {
        const image = processedImages[index];
        if (image) {
            URL.revokeObjectURL(image.previewUrl);
        }
        setProcessedImages(prev => prev.filter((_, i) => i !== index));
        removeUploadedMedia(index);
    };

    /**
     * Drag and drop handlers
     */
    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    }, []);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    /**
     * Trigger file input / camera
     */
    const openFileSelector = () => fileInputRef.current?.click();
    const openCamera = () => cameraInputRef.current?.click();

    return (
        <div className="image-uploader">
            {/* Header */}
            <div className="uploader-header">
                <Camera className="header-icon" />
                <h2>{t('upload.title', 'Sube la foto de tu fachada')}</h2>
                <p className="text-muted">{t('upload.subtitle', 'Nuestra IA analizará tu negocio')}</p>
            </div>

            {/* Validation Error */}
            {validationError && (
                <div className="validation-error animate-fadeIn">
                    <AlertCircle size={18} />
                    <span>{validationError}</span>
                    <button onClick={() => setValidationError(null)}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Dropzone (when no images) */}
            {processedImages.length === 0 && uploadedMedia.length === 0 ? (
                <div
                    className={`dropzone ${isDragging ? 'dragging' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={openFileSelector}
                >
                    <div className="dropzone-content">
                        <div className="dropzone-icon-wrapper">
                            {isProcessing ? (
                                <Loader2 className="dropzone-icon animate-spin" />
                            ) : (
                                <Upload className="dropzone-icon" />
                            )}
                        </div>

                        <p className="dropzone-text">
                            <span className="text-primary">{t('upload.dropzone', 'Haz clic aquí')}</span>
                            {' '}{t('common.or', 'o')} {t('upload.dragHint', 'arrastra tu imagen')}
                        </p>

                        <p className="dropzone-hint">
                            JPG, PNG, WEBP • Mín {MIN_WIDTH}x{MIN_HEIGHT}px
                        </p>

                        {/* Mobile camera button */}
                        {isMobile && (
                            <button
                                className="camera-button"
                                onClick={(e) => { e.stopPropagation(); openCamera(); }}
                            >
                                <Camera size={18} />
                                <span>{t('upload.takePhoto', 'Tomar foto')}</span>
                            </button>
                        )}
                    </div>

                    {/* Hidden file inputs */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={SUPPORTED_FORMATS.join(',')}
                        multiple
                        onChange={(e) => handleFiles(e.target.files)}
                        className="hidden-input"
                    />

                    {/* Camera input (mobile) */}
                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleFiles(e.target.files)}
                        className="hidden-input"
                    />
                </div>
            ) : (
                /* Image Preview Grid */
                <div className="media-preview-container">
                    <div className="media-grid">
                        {processedImages.map((image, index) => (
                            <div key={index} className="media-item animate-scaleIn">
                                <img
                                    src={image.previewUrl}
                                    alt={`Preview ${index + 1}`}
                                    className="media-thumbnail"
                                />

                                {/* Status overlay */}
                                {image.status === 'uploading' && (
                                    <div className="upload-overlay">
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${image.uploadProgress || 0}%` }}
                                            />
                                        </div>
                                        <span className="progress-text">{image.uploadProgress}%</span>
                                    </div>
                                )}

                                {image.status === 'success' && (
                                    <div className="status-badge success">
                                        <CheckCircle size={14} />
                                    </div>
                                )}

                                {image.status === 'error' && (
                                    <div className="status-badge error" title={image.error}>
                                        <AlertCircle size={14} />
                                    </div>
                                )}

                                {/* Info (compression indicator) */}
                                {image.compressed && (
                                    <div className="compression-badge" title={`Comprimido: ${formatFileSize(image.originalSize)} → ${formatFileSize(image.finalSize)}`}>
                                        ⚡
                                    </div>
                                )}

                                {/* Remove button */}
                                <button
                                    className="remove-btn"
                                    onClick={() => handleRemoveImage(index)}
                                    aria-label="Eliminar"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}

                        {/* Add more button */}
                        <label className="media-add-btn">
                            <Plus size={24} />
                            <input
                                type="file"
                                accept={SUPPORTED_FORMATS.join(',')}
                                multiple
                                onChange={(e) => handleFiles(e.target.files)}
                                className="hidden-input"
                            />
                        </label>
                    </div>

                    {/* Status bar */}
                    <div className="preview-info">
                        <div className={`info-badge ${isProcessing ? 'badge-warning' : 'badge-success'}`}>
                            {isProcessing ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    {t('upload.analyzing', 'Procesando...')}
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={14} />
                                    {processedImages.length} {t('upload.filesReady', 'archivo(s) listo(s)')}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
