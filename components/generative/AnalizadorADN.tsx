"use client";
import { useRef, useState } from 'react';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import { AIService, AISignInRequired, AIQuotaNotice, identidadManual } from '@/services/ai';
import { LoginForm } from '@/components/auth/LoginForm';
import type { AdnMarca } from '@/lib/estado/tipos-estado';
import { aiCampaignId } from '@/lib/ai/campaign';

export const AnalizadorADN = () => {
    const image = useTiendaEstado(s => s.imagenSubida);
    const [busy, setBusy] = useState(false);
    const pending = useRef(false);
    const [login, setLogin] = useState(false);
    const [quote, setQuote] = useState<{mode:string;cost?:number;remaining?:number;balance?:number;initial?:boolean}|null>(null);
    async function quoteCost() {
      setBusy(true); setError('');
      try { const r=await fetch('/api/ai-quote?operation=analysis&initial=true&campaignId='+aiCampaignId(),{cache:'no-store'}); const a=await r.json(); if(r.status===401){setLogin(true);return;} if(!r.ok)throw Error(a.error); setQuote(a); setLogin(false); }
      catch(e) {setError(e instanceof Error?e.message:'No se pudo consultar el coste.');}
      finally {setBusy(false);}
    }
    const [error, setError] = useState('');
    function complete(adn: AdnMarca) {
        useTiendaEstado.setState({ adnMarca: adn, analizando: false });
    }
    async function analyze() {
        if (pending.current || !image?.urlImagen || !quote) return;
        pending.current = true;
        setBusy(true); setError(''); setLogin(false);
        try {
            let base64 = image.urlImagen;
            if (base64.startsWith('blob:') || base64.startsWith('http')) {
                const response = await fetch(base64);
                if (!response.ok) throw new Error('No se pudo abrir la foto.');
                const blob = await response.blob();
                base64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = () => reject(new Error('No se pudo leer la foto.'));
                    reader.readAsDataURL(blob);
                });
            }
            complete(await AIService.analizarImagen(base64, quote.cost, aiCampaignId(),quote.initial));
        } catch (e) {
            setQuote(null);
            if (e instanceof AISignInRequired) setLogin(true);
            else if (e instanceof AIQuotaNotice) setError(e.message);
            else setError('No se pudo analizar la foto. Puedes continuar manualmente.');
        } finally { pending.current = false; setBusy(false); }
    }
    return <section className="space-y-5" aria-busy={busy}>
        <h2 className="text-xl font-semibold">¿Cómo quieres preparar tu escaparate?</h2>
        <p className="studio-muted">Puedes completar los datos tú mismo, gratis y sin registrarte. Para analizar la foto con IA necesitas una cuenta.</p>
        <div className="flex flex-wrap gap-3">
            <button className="studio-primary" disabled={busy} onClick={() => complete(identidadManual())}>Continuar sin IA</button>
            <button className="studio-button" disabled={busy} onClick={() => void (quote ? analyze() : quoteCost())}>{busy ? 'Preparando…' : quote ? quote.mode==='credits' ? `Analizar foto · ${quote.cost} créditos` : 'Analizar foto · 1 uso de IA' : 'Consultar coste del análisis'}</button>
        </div>
        {quote && <p className="studio-muted">{quote.mode==='credits' ? `Saldo disponible: ${quote.balance} créditos.` : `Usos disponibles en este periodo: ${quote.remaining}.`} El consumo se realiza al pulsar Analizar.</p>}
        {busy && <p role="status">Preparando la identidad del negocio…</p>}
        {error && <p role="alert">{error}</p>}
        {login && <div className="studio-panel"><p className="mb-5" role="status">Inicia sesión para analizar la foto. Tu borrador se conserva.</p><LoginForm onSuccess={() => void quoteCost()} /></div>}
    </section>;
};
