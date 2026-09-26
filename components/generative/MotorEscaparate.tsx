"use client";
import {useTiendaEstado} from '@/store/useTiendaEstado';
import {EscaparateReferencia} from './escaparate/EscaparateReferencia';
export const MotorEscaparate=()=>{
 const adn=useTiendaEstado(s=>s.adnMarca);const analizando=useTiendaEstado(s=>s.analizando);
 if(analizando)return <div role="status" className="p-10 text-center text-white">Preparando escaparate…</div>;
 if(!adn)return null;
 return <EscaparateReferencia/>;
};
