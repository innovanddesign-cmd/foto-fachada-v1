import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';
import './QRCodeGenerator.css';

interface QRCodeGeneratorProps {
    url: string;
    size?: number;
    downloadable?: boolean;
    title?: string;
}

export function QRCodeGenerator({
    url,
    size = 200,
    downloadable = true,
    title = 'Escanea para ver'
}: QRCodeGeneratorProps) {

    const handleDownload = () => {
        const svg = document.getElementById('qr-code-svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        canvas.width = size;
        canvas.height = size;

        img.onload = () => {
            ctx?.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'qr-code.png';
                    link.click();
                    URL.revokeObjectURL(url);
                }
            });
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    return (
        <div className="qr-code-generator">
            <div className="qr-code-container">
                <div className="qr-code-wrapper">
                    <QRCodeSVG
                        id="qr-code-svg"
                        value={url}
                        size={size}
                        level="H"
                        includeMargin={true}
                        bgColor="#ffffff"
                        fgColor="#000000"
                    />
                </div>
                {title && <p className="qr-title">{title}</p>}
            </div>

            {downloadable && (
                <button
                    onClick={handleDownload}
                    className="btn btn-secondary download-qr-btn"
                >
                    <Download size={16} />
                    Descargar QR
                </button>
            )}
        </div>
    );
}
