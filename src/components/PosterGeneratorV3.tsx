import { useState, useRef, useEffect } from 'react';
import { Download, Printer, QrCode, Sparkles } from 'lucide-react';
import QRCode from 'qrcode';
import { useAppStore } from '../store/appStore';
import { Button } from './ui/Button';
import './PosterGeneratorV3.css';

export const PosterGeneratorV3 = () => {
    const { brandData, posterConfig, setPosterConfig, generatedBackgroundImage } = useAppStore();
    const [qrDataUrl, setQrDataUrl] = useState<string>('');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Force pro features if user is admin/unlimited (which we assume via this request)
    const hasWatermark = false; // userTier === 'free'; // Disable watermark for now as requested "sin limite"

    useEffect(() => {
        // Generate QR code
        const landingUrl = `https://land.fotofachada.com/${brandData?.name?.toLowerCase().replace(/\s+/g, '-') || 'landing'}`;

        if (brandData) {
            QRCode.toDataURL(landingUrl, {
                width: 500,
                margin: 2,
                color: {
                    dark: brandData.colors.primary,
                    light: '#FFFFFF'
                }
            }).then(url => {
                setQrDataUrl(url);
            });
        }
    }, [brandData]);

    const drawPoster = async (canvas: HTMLCanvasElement) => {
        if (!brandData) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // A4 dimensions at 300 DPI (International Standard)
        // 2480 x 3508 px
        // We will work at a slightly smaller scale for performance but high enough for print
        // Scale 0.5 of 300dpi -> 1240 x 1754
        canvas.width = 1240;
        canvas.height = 1754;

        const w = canvas.width;
        const h = canvas.height;
        const centerX = w / 2;

        // --- BACKGROUND ---
        if (generatedBackgroundImage) {
            try {
                const bgImage = await loadImage(generatedBackgroundImage);

                // Draw image cover
                const scale = Math.max(w / bgImage.width, h / bgImage.height);
                const x = (w - bgImage.width * scale) / 2;
                const y = (h - bgImage.height * scale) / 2;
                ctx.drawImage(bgImage, x, y, bgImage.width * scale, bgImage.height * scale);

                // Add overlay for readability
                ctx.fillStyle = 'rgba(0,0,0,0.65)';
                ctx.fillRect(0, 0, w, h);
            } catch (e) {
                drawGradientBackground(ctx, w, h, brandData);
            }
        } else {
            drawGradientBackground(ctx, w, h, brandData);
        }

        // --- ORNAMENTAL FRAME ---
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.strokeRect(40, 40, w - 80, h - 80);

        // Inner thin line
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(50, 50, w - 100, h - 100);

        // --- HEADER ---
        // Brand Name
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 90px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 20;
        ctx.fillText(brandData.name.toUpperCase(), centerX, 250);
        ctx.shadowBlur = 0;

        // Divider
        ctx.beginPath();
        ctx.moveTo(centerX - 100, 290);
        ctx.lineTo(centerX + 100, 290);
        ctx.strokeStyle = brandData.colors.accent;
        ctx.lineWidth = 6;
        ctx.stroke();

        // Subtitle / Business Type
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '300 48px "Inter", sans-serif'; // Lighter weight
        ctx.fillText(brandData.businessType.toUpperCase(), centerX, 360);

        // --- MAIN PROMISE / HERO TEXT ---
        // Can use posterConfig title if available, otherwise fallback
        const mainTitle = posterConfig?.title?.text || `¡Vive la experiencia ${brandData.name}!`;

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '800 110px "Inter", sans-serif'; // Very bold
        // Word wrap logic would be good here but valid for short titles
        wrapText(ctx, mainTitle, centerX, 600, w - 200, 120);

        // --- QR SECTION ---
        const qrBoxY = 850;
        const qrBoxSize = 650;

        // Glass effect container for QR
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';

        // Rounded rect
        roundRect(ctx, centerX - qrBoxSize / 2, qrBoxY, qrBoxSize, qrBoxSize, 40);
        ctx.fill();

        // QR Code Image
        if (qrDataUrl) {
            const qrImg = await loadImage(qrDataUrl);
            ctx.drawImage(qrImg, centerX - 250, qrBoxY + 50, 500, 500);
        }

        // --- CTA BELOW QR ---
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 54px "Inter", sans-serif';
        ctx.fillText("ESCANEA PARA ACCEDER", centerX, qrBoxY + 600);

        ctx.fillStyle = brandData.colors.primary;
        ctx.font = 'bold 36px "Inter", sans-serif';
        ctx.fillText("Ofertas exclusivas y menú digital", centerX, qrBoxY + 650);

        // --- FOOTER ---
        const footerY = h - 150;

        // Social icons simulation
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = '400 32px "Inter", sans-serif';
        ctx.fillText(`${brandData.name}  •  Síguenos en redes`, centerX, footerY);

        // Watermark handling
        if (hasWatermark) {
            ctx.save();
            ctx.translate(centerX, h - 80);
            ctx.font = '900 60px "Inter", sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillText('FOTO FACHADA FREE', 0, 0);
            ctx.restore();
        }
    };

    const drawGradientBackground = (ctx: CanvasRenderingContext2D, w: number, h: number, brand: any) => {
        const gradient = ctx.createLinearGradient(0, 0, w, h);
        gradient.addColorStop(0, brand.colors.primary);
        gradient.addColorStop(1, brand.colors.secondary);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Texture overlay (noise simulation)
        // Simple noise
        for (let i = 0; i < 5000; i++) {
            ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`;
            ctx.beginPath();
            ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    };

    const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    };

    const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
        const words = text.split(' ');
        let line = '';
        let currentY = y;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
    }

    // Polyfill-like helper for roundRect since ctx.roundRect might vary
    const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
        if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, r);
            return;
        }
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    };

    const handleDownload = async () => {
        if (!canvasRef.current || !brandData) return;
        setIsGenerating(true);

        try {
            const canvas = canvasRef.current;
            await drawPoster(canvas);

            // Trigger Download
            const link = document.createElement('a');
            link.download = `cartel-profesional-${brandData.name.toLowerCase().replace(/\s+/g, '-')}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!brandData) return null;

    return (
        <div className="poster-generator-v3 animate-fadeIn">
            <div className="section-header-v3">
                <div className="icon-badge">
                    <QrCode size={24} className="text-white" />
                </div>
                <div>
                    <h2 className="section-title">Generador de Cartelería Profesional</h2>
                    <p className="section-subtitle">Tu cartel listo para imprimir en alta definición</p>
                </div>
            </div>

            <div className="poster-layout-grid">
                {/* Preview Panel - Simplified CSS representation of what canvas will do */}
                <div className="poster-preview-panel glass-panel">
                    <div className="preview-label">Vista Previa A4</div>
                    <div className="paper-mockup relative overflow-hidden"
                        style={{
                            '--accent': brandData.colors.primary,
                            backgroundImage: generatedBackgroundImage ? `url(${generatedBackgroundImage})` : `linear-gradient(135deg, ${brandData.colors.primary}, ${brandData.colors.secondary})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        } as any}>

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/50" />

                        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-6 text-white">
                            <h2 className="text-3xl font-bold mb-2">{brandData.name}</h2>
                            <p className="opacity-80 mb-8">{brandData.businessType}</p>

                            <h1 className="text-4xl font-extrabold mb-8 leading-tight">
                                {posterConfig?.title?.text || `¡Vive la experiencia ${brandData.name}!`}
                            </h1>

                            <div className="bg-white p-4 rounded-xl shadow-lg mb-8">
                                <img src={qrDataUrl} alt="QR" className="w-48 h-48 object-contain" />
                                <p className="text-slate-900 font-bold mt-2 text-sm">ESCANEA AQUI</p>
                            </div>

                            <p className="text-sm opacity-75">{brandData.name} • Síguenos</p>
                        </div>
                    </div>
                </div>

                <div className="poster-controls glass-panel">
                    <h3 className="controls-title">Opciones de Descarga</h3>

                    <div className="control-group">
                        <div className="info-block">
                            <Sparkles size={18} className="text-yellow-400" />
                            <p>Diseño mejorado con imagen de fondo y tipografía profesional.</p>
                        </div>
                    </div>

                    <div className="action-buttons-stack">
                        <Button
                            variant="primary"
                            size="lg"
                            className="w-full"
                            onClick={handleDownload}
                            loading={isGenerating}
                            leftIcon={<Download size={20} />}
                        >
                            Descargar Cartel HD
                        </Button>

                        <div className="print-tips mt-4">
                            <Printer size={16} />
                            <p>Formato A4 optimizado (300 DPI). Ideal para imprimir en cualquier impresora estándar o imprenta.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden Canvas for generation */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
}
