'use client';
import {useState} from 'react';
import Link from 'next/link';
import {createClient} from '@/lib/supabase/client';
export function RecoveryForm({reset=false}:{reset?:boolean}){
 const [value,setValue]=useState(''),[confirm,setConfirm]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[done,setDone]=useState(false);
 async function submit(e:React.FormEvent){e.preventDefault();if(busy)return;setBusy(true);setMessage('');try{
  const sb=createClient();
  if(reset){if(value!==confirm)throw Error('Las contraseñas no coinciden.');const {data,error}=await sb.auth.getUser();if(error||!data.user)throw Error('El enlace ha caducado. Solicita otro enlace de recuperación.');const result=await sb.auth.updateUser({password:value});if(result.error)throw Error('No se pudo actualizar. Comprueba que la contraseña cumple los requisitos e inténtalo de nuevo.');setDone(true);setMessage('Contraseña actualizada. Ya puedes volver a tu panel.');}
  else {const result=await sb.auth.resetPasswordForEmail(value,{redirectTo:location.origin+'/auth/callback?next=%2Fauth%2Freset'});if(result.error)throw Error('No se pudo enviar el enlace. Espera unos minutos y vuelve a intentarlo.');setDone(true);setMessage('Si existe una cuenta con ese correo, recibirás un enlace para recuperar el acceso. Revisa también spam.');}
 }catch(e){setMessage(e instanceof Error?e.message:'No se pudo conectar.');}finally{setBusy(false);}}
 return <section className="studio-panel max-w-md mx-auto space-y-5"><h1 className="text-2xl font-semibold">{reset?'Nueva contraseña':'Recuperar acceso'}</h1>{!done&&<form onSubmit={submit} className="space-y-4"><label className="studio-field">{reset?'Nueva contraseña':'Correo de tu cuenta'}<input type={reset?'password':'email'} autoComplete={reset?'new-password':'email'} required minLength={reset?6:undefined} value={value} onChange={e=>setValue(e.target.value)}/></label>{reset&&<label className="studio-field">Repite la contraseña<input type="password" autoComplete="new-password" required minLength={6} value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>}<button className="studio-primary w-full" disabled={busy}>{busy?'Procesando…':reset?'Guardar contraseña':'Enviar enlace de recuperación'}</button></form>}{message&&<p role="status">{message}</p>}<Link className="studio-button" href={done&&reset?'/dashboard':'/auth/login'}>{done&&reset?'Volver al panel':'Volver a iniciar sesión'}</Link>{reset&&!done&&<Link className="underline block" href="/auth/recover">Solicitar otro enlace</Link>}</section>;
}
