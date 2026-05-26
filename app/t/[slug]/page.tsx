"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import { Loader2 } from 'lucide-react';
import { useTrackerQR } from '@/lib/tracking/TrackerQR';

/**
 * Página de Tracking QR (Mid-ware)
 * Ruta: /t/[slug]
 * 
 * 1. Registra el escaneo.
 * 2. Redirige a la landing pública /v/[slug].
 */
export default function TrackingPage() {
    const router = useRouter();
    const params = useParams();
    const slug = params?.slug as string;

    const [redirigiendo, setRedirigiendo] = useState(true);
    const campañas = useTiendaEstado((s) => s.campañas);

    // Id de campaña asociado al slug (en prod sería búsqueda en DB)
    // Aquí asumimos que el slug es el ID del escaparate
    const campaña = campañas.find(c => c.idEscaparate === slug || c.urlPublica?.includes(slug));

    // Activar tracking
    useTrackerQR({
        campañaId: campaña?.id || 'unknown_campaign',
        onScanRegistered: () => {
            // Redirigir tras registrar (pequeño delay para asegurar registro en store local)
            setTimeout(() => {
                router.replace(`/v/${slug}`);
            }, 500);
        }
    });

    // Fallback: Si no hay campaña o tarda mucho, redirigir igual
    useEffect(() => {
        const timeout = setTimeout(() => {
            router.replace(`/v/${slug}`);
        }, 2000);
        return () => clearTimeout(timeout);
    }, [slug, router]);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
            <p className="text-sm text-white/40 uppercase tracking-widest animate-pulse">
                Accediendo a experiencia...
            </p>
        </div>
    );
}
