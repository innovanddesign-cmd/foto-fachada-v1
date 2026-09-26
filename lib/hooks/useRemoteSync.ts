"use client";
import {useState,useEffect,useCallback,useRef} from 'react';
import {createClient} from '@/lib/supabase/client';
import {loadCampaignsRemote,saveCampaignRemote,publishCampaign,unpublishCampaign} from '@/lib/supabase/persistence';
import type {RemoteCampaign} from '@/lib/supabase/persistence';
import type {User} from '@supabase/supabase-js';
import {useTiendaEstado} from '@/store/useTiendaEstado';
import {guardarCampañaEnStore} from '@/lib/campañas/GestionCampañas';
export function useRemoteSync(){
 const [user,setUser]=useState<User|null>(null);const [remoteCampaigns,setRemote]=useState<RemoteCampaign[]>([]);const [loading,setLoading]=useState(false);const [syncing,setSyncing]=useState(false);const [error,setError]=useState<string|null>(null);
 const generation=useRef(0);const account=useRef<string|null>(null);const busy=useRef(false);
 useEffect(()=>{const sb=createClient();let active=true;const {data:{subscription}}=sb.auth.onAuthStateChange((_event,session)=>{if(!active)return;const next=session?.user??null;if(account.current!==next?.id){generation.current++;setRemote([]);}account.current=next?.id??null;setUser(next);});return()=>{active=false;generation.current++;subscription.unsubscribe();};},[]);
 const loadRemote=useCallback(async()=>{if(!user)return;const stamp=++generation.current;setLoading(true);try{const r=await loadCampaignsRemote();if(stamp===generation.current){setRemote(r.data);setError(r.error);}}catch(e){if(stamp===generation.current)setError(e instanceof Error?e.message:'No se pudo conectar.');}finally{if(stamp===generation.current)setLoading(false);}},[user?.id]);
 useEffect(()=>{void loadRemote()},[loadRemote]);
 async function operation(action:()=>Promise<{success:boolean;error:string|null}>){if(busy.current)return {success:false,error:'Hay una operación en curso.'};busy.current=true;setSyncing(true);setError(null);try{const r=await action();if(!r.success)setError(r.error);await loadRemote();return r;}catch(e){const message=e instanceof Error?e.message:'No se pudo guardar.';setError(message);return{success:false,error:message};}finally{busy.current=false;setSyncing(false);}}
 async function saveLocal(id:string){const s=useTiendaEstado.getState();const c=s.campañas.find(c=>c.id===id);if(!c)return{success:false,error:'Campaña no encontrada.'};const snapshot=c.idEscaparate===s.slug&&s.datosEscaparate?{adnMarca:s.adnMarca,datosEscaparate:s.datosEscaparate,imagenSubida:s.imagenSubida,galeriaActivos:s.galeriaActivos,redesSociales:s.redesSociales,slug:s.slug}:c.snapshot;if(!snapshot?.datosEscaparate)return{success:false,error:'Abre el borrador y completa sus datos antes de guardar.'};const r=await saveCampaignRemote({id:c.id,localId:c.id,name:c.nombreCampaña,slug:c.idEscaparate,status:'draft',snapshot,plan:snapshot.datosEscaparate.planVisual||'PRO'});if(r.success)s.guardarCampaña({...c,snapshot,ultimaActualizacion:new Date().toISOString()});return r;}
 return {user,remoteCampaigns,loading,syncing,error,loadRemote,
 syncCampaign:(id:string)=>operation(()=>saveLocal(id)),
 saveCurrent:()=>operation(async()=>{const c=guardarCampañaEnStore();return c?saveLocal(c.id):{success:false,error:'Primero genera un escaparate.'};}),
 migrateLocalToRemote:()=>operation(async()=>{for(const c of useTiendaEstado.getState().campañas){const r=await saveLocal(c.id);if(!r.success)return r;}return{success:true,error:null};}),
 publish:(id:string,slug:string)=>operation(()=>publishCampaign(id,slug)),
 unpublish:(id:string)=>operation(()=>unpublishCampaign(id))};
}
