/**
 * UploadStep - Estado UPLOAD
 * Interfaz limpia dedicada exclusivamente a la subida de foto
 * Transición automática a ANALYSIS al completar
 */

import { useCallback, useState, useRef } from 'react';
import { Camera, Upload, Image as ImageIcon, X, Sparkles } from 'lucide-react';
import { useEscaparateStore } from '../../store/escaparateStore';
import { Button } from '../ui/Button';
import './UploadStep.css';

export function UploadStep() {
    const { currentState, setMediaUrls, startAnalysis } = useEscaparateStore();
    const [isDragging, setIsDragging] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Obtener mediaUrls del estado actual
    const mediaUrls = currentState.step === 'UPLOAD' ? currentState.mediaUrls : [];

    // ─── HANDLERS DE ARCHIVOS ───────────────────────────────────

    const handleFiles = useCallback((files: FileList | File[]) => {
        const validFiles = Array.from(files).filter(file =>
            file.type.startsWith('image/')
        );

        if (validFiles.length === 0) return;

        // Crear URLs para preview
        const newUrls = validFiles.map(file => URL.createObjectURL(file));
        setMediaUrls([...mediaUrls, ...newUrls]);
    }, [mediaUrls, setMediaUrls]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleFileSelect = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(e.target.files);
        }
    }, [handleFiles]);

    const removeImage = useCallback((index: number) => {
        const newUrls = mediaUrls.filter((_, i) => i !== index);
        // Revocar URL para liberar memoria
        URL.revokeObjectURL(mediaUrls[index]);
        setMediaUrls(newUrls);
    }, [mediaUrls, setMediaUrls]);

    // ─── HANDLERS DE CÁMARA ─────────────────────────────────────

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Cámara trasera en móviles
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsCapturing(true);
        } catch (error) {
            console.error('Error accediendo a la cámara:', error);
        }
    }, []);

    const capturePhoto = useCallback(() => {
        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0);
            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    setMediaUrls([...mediaUrls, url]);
                }
            }, 'image/jpeg', 0.9);
        }

        stopCamera();
    }, [mediaUrls, setMediaUrls]);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCapturing(false);
    }, []);

    // ─── ACCIÓN PRINCIPAL ───────────────────────────────────────

    const handleStartAnalysis = useCallback(() => {
        if (mediaUrls.length > 0) {
            startAnalysis();
        }
    }, [mediaUrls, startAnalysis]);

    // ─── RENDER ─────────────────────────────────────────────────

    return (
        <div className="upload-step">
            <div className="upload-step__header">
                <h1 className="upload-step__title">
                    📸 Captura tu Fachada
                </h1>
                <p className="upload-step__description">
                    Sube una foto de la fachada de tu negocio y nuestra IA creará un escaparate digital personalizado
                </p>
            </div>

            {/* Vista de cámara */}
            {isCapturing ? (
                <div className="upload-step__camera">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="upload-step__video"
                    />
                    <div className="upload-step__camera-controls">
                        <Button variant="ghost" onClick={stopCamera}>
                            Cancelar
                        </Button>
                        <Button variant="primary" onClick={capturePhoto}>
                            <Camera size={20} />
                            Capturar
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Zona de drop */}
                    <div
                        className={`upload-step__dropzone ${isDragging ? 'upload-step__dropzone--active' : ''} ${mediaUrls.length > 0 ? 'upload-step__dropzone--has-images' : ''}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={mediaUrls.length === 0 ? handleFileSelect : undefined}
                    >
                        {mediaUrls.length === 0 ? (
                            <div className="upload-step__empty">
                                <div className="upload-step__icon">
                                    <ImageIcon size={48} strokeWidth={1.5} />
                                </div>
                                <p className="upload-step__empty-text">
                                    Arrastra tu foto aquí o haz clic para seleccionar
                                </p>
                                <p className="upload-step__empty-hint">
                                    JPG, PNG o WEBP • Máximo 10MB
                                </p>
                            </div>
                        ) : (
                            <div className="upload-step__preview">
                                {mediaUrls.map((url, index) => (
                                    <div key={url} className="upload-step__preview-item">
                                        <img src={url} alt={`Fachada ${index + 1}`} />
                                        <button
                                            className="upload-step__preview-remove"
                                            onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                                            aria-label="Eliminar imagen"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    className="upload-step__preview-add"
                                    onClick={(e) => { e.stopPropagation(); handleFileSelect(); }}
                                >
                                    <Upload size={24} />
                                    <span>Añadir más</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Botones de acción */}
                    <div className="upload-step__actions">
                        <Button
                            variant="secondary"
                            onClick={startCamera}
                            leftIcon={<Camera size={18} />}
                        >
                            Usar Cámara
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={handleFileSelect}
                            leftIcon={<Upload size={18} />}
                        >
                            Subir Archivo
                        </Button>
                    </div>

                    {/* Botón de análisis */}
                    {mediaUrls.length > 0 && (
                        <div className="upload-step__analyze">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleStartAnalysis}
                                leftIcon={<Sparkles size={20} />}
                                className="upload-step__analyze-btn"
                            >
                                Analizar Negocio y Crear Escaparate
                            </Button>
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleInputChange}
                        className="upload-step__input"
                    />
                </>
            )}
        </div>
    );
}
