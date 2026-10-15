"use client";
import {VistaReferencia} from '@/components/generative/escaparate/EscaparateReferencia';
import type {ComponentProps} from 'react';
export function DemoProposal({snapshot}:{snapshot:ComponentProps<typeof VistaReferencia>['snapshot']}){
 return <main><aside className="bg-emerald-950 text-white px-5 py-4 text-center text-sm" aria-label="Aviso de demostración"><strong>Propuesta de INNOVA</strong> · Vista de demostración para el negocio. Los contactos y reservas están desactivados hasta su aceptación.</aside><VistaReferencia snapshot={snapshot} proposal/></main>;
}
