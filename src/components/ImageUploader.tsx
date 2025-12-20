import React, { useCallback } from 'react';
import { Upload, Camera, Image as ImageIcon } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import './ImageUploader.css';

export function ImageUploader() {
    const { setUploadedImage, uploadedImage } = useAppStore();

    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, [setUploadedImage]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, [setUploadedImage]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    }, []);

    const clearImage = useCallback(() => {
        setUploadedImage(null);
    }, [setUploadedImage]);

    return (
        <div className="image-uploader">
            <div className="uploader-header">
                <Camera className="header-icon" />
                <h2>Sube una foto de la fachada</h2>
                <p className="text-muted">La IA extraerá el logo, colores y estilo del negocio</p>
            </div>

            {!uploadedImage ? (
                <div
                    className="dropzone"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <label htmlFor="image-upload" className="dropzone-content">
                        <div className="dropzone-icon-wrapper">
                            <Upload className="dropzone-icon" />
                        </div>
                        <p className="dropzone-text">
                            <span className="text-primary">Haz clic aquí</span> o arrastra una imagen
                        </p>
                        <p className="dropzone-hint">JPG, PNG o WEBP • Máx. 10MB</p>

                        <div className="mobile-camera-hint">
                            <Camera size={16} />
                            <span>En móvil puedes hacer una foto directa</span>
                        </div>
                    </label>
                    <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageUpload}
                        className="hidden-input"
                    />
                </div>
            ) : (
                <div className="preview-container">
                    <div className="image-preview">
                        <img src={uploadedImage} alt="Fachada del negocio" />
                        <div className="preview-overlay">
                            <button className="btn btn-secondary" onClick={clearImage}>
                                <ImageIcon size={16} />
                                Cambiar imagen
                            </button>
                        </div>
                    </div>
                    <div className="preview-info">
                        <div className="info-badge badge-success">
                            <Camera size={14} />
                            Imagen lista para analizar
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
