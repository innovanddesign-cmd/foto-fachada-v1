"use client";

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

interface QRPersonalizadoProps {
    url: string;
    color?: string;
    size?: number;
    logo?: string;
}

/**
 * QRPersonalizado — Generador de QR real con estilo Apple-Glass.
 * Usa la librería `qrcode` para generar matrices reales escaneables.
 */
export const QRPersonalizado = ({ url, color = "#000000", size = 200, logo }: QRPersonalizadoProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dataUrl, setDataUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!url) return;

        const generar = async () => {
            try {
                const dataUrl = await QRCode.toDataURL(url, {
                    width: size,
                    margin: 1,
                    color: {
                        dark: color,
                        light: '#FFFFFF',
                    },
                    errorCorrectionLevel: 'M',
                });
                setDataUrl(dataUrl);
            } catch (err) {
                console.error("Error generando QR:", err);
            }
        };

        generar();
    }, [url, color, size]);

    if (!dataUrl) {
        return (
            <div style={{ width: size, height: size }} className="bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
                <span className="text-gray-400 text-[10px] font-mono">QR...</span>
            </div>
        );
    }

    return (
        <div className="relative inline-block" style={{ width: size, height: size }}>
            <img
                src={dataUrl}
                alt={`QR: ${url}`}
                width={size}
                height={size}
                className="rounded-xl"
                style={{ imageRendering: 'pixelated' }}
            />
            {/* Logo overlay en el centro */}
            {logo && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 px-2 py-1">
                        <span className="font-black text-sm" style={{ color }}>{logo}</span>
                    </div>
                </div>
            )}
        </div>
    );
};
