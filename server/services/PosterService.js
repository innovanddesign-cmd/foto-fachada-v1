/**
 * PosterService.js
 * Server-side PDF generation using Puppeteer
 * Updated to match 2026 Aesthetics (Depth, Tactile Buttons, Consistency)
 */
import puppeteer from 'puppeteer';
import QRCode from 'qrcode';
import { appLogger } from './logger.js';
import { generateVisualDNAPalette } from './colorScience.js';

export class PosterService {
    /**
     * Generate a PDF poster
     * @param {object} config Poster configuration
     * @returns {Promise<Buffer>} PDF buffer
     */
    static async generatePosterPdf(config) {
        const {
            businessName,
            businessType,
            tagline,
            landingUrl,
            primaryColor, // Hex code
            phone,
            address
        } = config;

        appLogger.info({ businessName }, '🎨 Generating PDF Poster (Premium 2026)');

        // 1. Generate Consistent Palette
        const palette = generateVisualDNAPalette(primaryColor, 'modern');

        // 2. Generate QR Code
        const qrDataUrl = await QRCode.toDataURL(landingUrl, {
            errorCorrectionLevel: 'H',
            margin: 0, // No margin, we handle it in CSS
            color: {
                dark: palette.primary,
                light: '#ffffff'
            }
        });

        // 3. Generate CSS Logic (Mirrored from visualDNASiteBuilder.ts)
        const css = this.generateCSS(palette, businessType);

        // 4. Generate HTML
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
                
                ${css}
            </style>
        </head>
        <body>
            <!-- LEY 1: PROFUNDIDAD - Layered backgrounds -->
            <div class="poster-bg"></div>
            <div class="poster-overlay"></div>
            <div class="poster-texture"></div>

            <div class="content">
                <div class="business-type">${businessType}</div>
                <h1 class="business-name">${businessName}</h1>
                
                ${tagline ? `<div class="tagline">${tagline}</div>` : ''}

                <div class="qr-container">
                    <img src="${qrDataUrl}" class="qr-code" />
                </div>

                <div class="cta">ESCANEA AHORA</div>
                <div class="cta-sub">Para ofertas exclusivas</div>

                <div class="url-pill">
                    ${landingUrl.replace(/^https?:\/\//, '')}
                </div>
            </div>

            <div class="footer">
                ${phone ? `<div>Tel: ${phone}</div>` : ''}
                ${address ? `<div>${address}</div>` : ''}
                <div style="font-size: 14px; margin-top: 10px; opacity: 0.6;">Generado por Foto Fachada</div>
            </div>
        </body>
        </html>
        `;

        // 5. Render PDF
        let browser = null;
        try {
            browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();

            // Set viewport to A4 size (approximate for screen)
            await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

            await page.setContent(html, { waitUntil: 'networkidle0' });

            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '0', right: '0', bottom: '0', left: '0' }
            });

            return pdfBuffer;

        } catch (error) {
            appLogger.error({ error: error.message }, 'Failed to generate PDF');
            throw error;
        } finally {
            if (browser) await browser.close();
        }
    }

    /**
     * Generate CSS mirroring Frontend Logic
     */
    static generateCSS(palette, businessType) {
        // Unsplash keyword logic
        const keyword = encodeURIComponent(businessType || 'business');
        const bgImageUrl = `https://source.unsplash.com/1600x2400/?${keyword}`; // Portrait orientation for posters

        return `
            body {
                margin: 0;
                padding: 0;
                width: 210mm;
                height: 297mm;
                font-family: 'Inter', sans-serif;
                color: ${palette.text}; /* Use palette text color (white) */
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
                position: relative;
                overflow: hidden;
            }

            /* LEY 1: PROFUNDIDAD (Backgrounds) */
            .poster-bg {
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                background-image: url('${bgImageUrl}');
                background-size: cover;
                background-position: center;
                z-index: -3;
                filter: blur(4px) brightness(0.9);
            }

            .poster-overlay {
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                z-index: -2;
                background: linear-gradient(
                    135deg,
                    ${palette.overlay}99 0%, 
                    rgba(0,0,0,0.5) 50%,
                    ${palette.overlay}99 100%
                );
                /* Note: Backdrop-filter support in Puppeteer might be limited depending on version, 
                   but we include it. CSS opacity + blur layers are safer. */
            }

            .poster-texture {
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                z-index: -1;
                background: 
                    radial-gradient(circle at 20% 80%, ${palette.primary}44 0%, transparent 40%),
                    radial-gradient(circle at 80% 20%, ${palette.secondary}44 0%, transparent 40%);
            }

            /* CONTENT */
            .content {
                text-align: center;
                width: 180mm;
                z-index: 10;
                /* Glass effect for main card */
                background: rgba(255,255,255,0.05); /* Very subtle glass */
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 24px;
                padding: 3rem 2rem;
                box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
            }

            .business-type {
                font-size: 24px;
                text-transform: uppercase;
                letter-spacing: 4px;
                color: ${palette.primaryLight};
                font-weight: 600;
                margin-bottom: 20px;
            }

            .business-name {
                font-size: 64px;
                font-weight: 900;
                line-height: 1.1;
                margin: 0 0 30px 0;
                color: ${palette.text};
                text-shadow: 0 4px 20px rgba(0,0,0,0.3);
            }

            .tagline {
                font-size: 28px;
                font-weight: 400;
                color: ${palette.textSecondary};
                margin-bottom: 50px;
                line-height: 1.4;
            }

            /* QR CONTAINER - 2026 Tactile Style */
            .qr-container {
                background: #ffffff;
                padding: 25px;
                border-radius: 30px; /* High rounding */
                display: inline-block;
                margin-bottom: 40px;
                
                /* TACTILE SHADOW */
                box-shadow: 
                    0 20px 50px -10px ${palette.primary}66,
                    0 10px 20px rgba(0,0,0,0.2),
                    inset 0 2px 4px rgba(255,255,255,1), 
                    inset 0 -2px 4px rgba(0,0,0,0.1);
                border: 1px solid rgba(0,0,0,0.05);
            }

            .qr-code {
                width: 280px;
                height: 280px;
                display: block;
            }

            .cta {
                font-size: 48px;
                font-weight: 900;
                margin-bottom: 10px;
                letter-spacing: -1px;
                color: ${palette.text};
                text-shadow: 0 2px 10px rgba(0,0,0,0.3);
            }

            .cta-sub {
                font-size: 24px;
                color: ${palette.textSecondary};
                margin-bottom: 40px;
            }

            /* URL PILL - Tactile Button Style */
            .url-pill {
                background: linear-gradient(135deg, ${palette.primary} 0%, ${palette.primaryDark} 100%);
                color: ${palette.textOnPrimary};
                padding: 16px 40px;
                border-radius: 50px;
                font-size: 22px;
                font-weight: 700;
                display: inline-block;
                
                /* Tactile Shadows */
                box-shadow: 
                    0 10px 25px ${palette.primary}66, 
                    inset 0 1px 0 rgba(255,255,255,0.3), 
                    inset 0 -2px 0 rgba(0,0,0,0.2);
                border: 1px solid rgba(255,255,255,0.1);
            }

            .footer {
                position: absolute;
                bottom: 40px;
                width: 100%;
                text-align: center;
                font-size: 16px;
                color: ${palette.textSecondary};
                z-index: 10;
            }
        `;
    }
}

export default PosterService;
