import { useState, useRef, useEffect } from 'react';
import { QrCode, Download, Printer, Crown } from 'lucide-react';
import QRCode from 'qrcode';
import { useAppStore } from '../store/appStore';
import './PosterGenerator.css';

export function PosterGenerator() {
    const { brandData, links, userTier } = useAppStore();
    const [qrDataUrl, setQrDataUrl] = useState<string>('');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const hasWatermark = userTier === 'free';

    useEffect(() => {
        // Generate QR code
        const landingUrl = `https://tu-dominio.com/${brandData?.name?.toLowerCase().replace(/\s+/g, '-') || 'landing'}`;

        QRCode.toDataURL(landingUrl, {
            width: 200,
            margin: 2,
            color: {
                dark: brandData?.colors.primary || '#000000',
                light: '#FFFFFF'
            }
        }).then(url => {
            setQrDataUrl(url);
        });
    }, [brandData]);

    const handleDownload = () => {
        if (!canvasRef.current || !brandData) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // A4 dimensions at 96 DPI (standard screen)
        canvas.width = 794;
        canvas.height = 1123;

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, brandData.colors.primary);
        gradient.addColorStop(1, brandData.colors.secondary);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // White content area
        ctx.fillStyle = '#FFFFFF';
        ctx.roundRect(40, 40, canvas.width - 80, canvas.height - 80, 20);
        ctx.fill();

        // Business name
        ctx.fillStyle = brandData.colors.primary;
        ctx.font = 'bold 48px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(brandData.name, canvas.width / 2, 120);

        // Business type
        ctx.fillStyle = '#666666';
        ctx.font = '24px Inter, sans-serif';
        ctx.fillText(brandData.businessType, canvas.width / 2, 160);

        // Tagline
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 28px Inter, sans-serif';
        ctx.fillText('¡Descubre nuestras ofertas!', canvas.width / 2, 240);

        // QR Code
        if (qrDataUrl) {
            const qrImage = new Image();
            qrImage.onload = () => {
                ctx.drawImage(qrImage, canvas.width / 2 - 150, 280, 300, 300);

                // Links preview
                ctx.font = '18px Inter, sans-serif';
                ctx.fillStyle = '#555';
                let y = 640;
                links.slice(0, 3).forEach(link => {
                    ctx.fillText(`${link.emoji} ${link.name}`, canvas.width / 2, y);
                    y += 35;
                });

                // CTA
                ctx.fillStyle = brandData.colors.primary;
                ctx.font = 'bold 22px Inter, sans-serif';
                ctx.fillText('Escanea y gana premios', canvas.width / 2, 800);

                // Watermark if free tier
                if (hasWatermark) {
                    ctx.save();
                    ctx.globalAlpha = 0.15;
                    ctx.fillStyle = '#000';
                    ctx.font = 'bold 60px Inter, sans-serif';
                    ctx.translate(canvas.width / 2, canvas.height - 200);
                    ctx.rotate(-0.3);
                    ctx.fillText('FOTO FACHADA', 0, 0);
                    ctx.restore();
                }

                // Download
                const link = document.createElement('a');
                link.download = `cartel-${brandData.name.toLowerCase().replace(/\s+/g, '-')}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            };
            qrImage.src = qrDataUrl;
        }
    };

    if (!brandData) return null;

    return (
        <div className="poster-generator animate-fadeIn">
            <div className="section-header">
                <QrCode className="section-icon text-secondary" />
                <h2>Tu Cartel con QR</h2>
                <p className="text-muted">Listo para imprimir y pegar en el escaparate</p>
            </div>

            <div className="poster-preview-container">
                <div
                    className="poster-preview"
                    style={{
                        background: `linear-gradient(135deg, ${brandData.colors.primary}, ${brandData.colors.secondary})`
                    }}
                >
                    <div className="poster-content">
                        <h1 style={{ color: brandData.colors.primary }}>{brandData.name}</h1>
                        <p className="business-type">{brandData.businessType}</p>

                        <div className="qr-section">
                            <p className="qr-cta">¡Descubre nuestras ofertas!</p>
                            {qrDataUrl && (
                                <img src={qrDataUrl} alt="QR Code" className="qr-code" />
                            )}
                            <p className="qr-instruction">Escanea con tu móvil</p>
                        </div>

                        <div className="poster-links">
                            {links.slice(0, 3).map(link => (
                                <span key={link.id} className="poster-link">
                                    {link.emoji} {link.name}
                                </span>
                            ))}
                        </div>

                        {hasWatermark && (
                            <div className="watermark">FOTO FACHADA</div>
                        )}
                    </div>
                </div>

                {hasWatermark && (
                    <div className="watermark-warning">
                        <Crown size={16} />
                        <span>Actualiza a Premium para quitar la marca de agua</span>
                    </div>
                )}
            </div>

            <div className="poster-actions">
                <button className="btn btn-primary btn-lg" onClick={handleDownload}>
                    <Download size={20} />
                    Descargar Cartel A4
                </button>
                <button className="btn btn-secondary btn-lg">
                    <Printer size={20} />
                    Imprimir
                </button>
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
}
