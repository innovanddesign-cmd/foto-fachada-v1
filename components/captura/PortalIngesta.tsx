"use client";
import { useState } from 'react';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import { Upload } from 'lucide-react';
export default function PortalIngesta() {
 const photo=useTiendaEstado(s=>s.imagenSubida); const save=useTiendaEstado(s=>s.setFotoFachada);
 const [busy,setBusy]=useState(false); const [error,setError]=useState('');
 async function process(file?:File) {
   if(!file||busy)return;setBusy(true);setError('');
   try {
     if(file.size>10*1024*1024)throw new Error('La foto debe pesar menos de 10 MB.');
     const heic=file.type==='image/heic'||/\.heic$/i.test(file.name);
     if(!['image/jpeg','image/png','image/webp'].includes(file.type)&&!heic)throw new Error('Elige una foto JPG, PNG, WebP o HEIC.');
     let image=file;
     if(heic){const convert=(await import('heic2any')).default;const result=await convert({blob:file,toType:'image/jpeg',quality:.8});image=new File([Array.isArray(result)?result[0]:result],file.name.replace(/\.[^.]+$/,'.jpg'),{type:'image/jpeg'});}
     const url=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('No se pudo leer la foto.'));reader.readAsDataURL(image);});
     await new Promise<void>((resolve,reject)=>{const probe=new Image();probe.onload=()=>resolve();probe.onerror=()=>reject(new Error('El archivo no contiene una imagen válida.'));probe.src=url;});
     save(image,url);
   }catch(e){setError(e instanceof Error?e.message:'No se pudo cargar la foto.');}finally{setBusy(false);}
 }
 return <div className="max-w-2xl mx-auto rounded-2xl border-2 border-dashed border-slate-500 p-5 sm:p-8 text-center" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();void process(e.dataTransfer.files[0]);}}>
   {photo?.urlImagen?<img src={photo.urlImagen} alt="Foto de tu fachada" className="max-h-64 w-full object-contain rounded-xl mb-5"/>:<Upload className="mx-auto mb-4 text-blue-300" size={36}/>}
   <label className="block text-base font-semibold mb-3" htmlFor="facade-upload">{photo?'Cambiar foto de la fachada':'Selecciona o arrastra una foto'}</label><input id="facade-upload" type="file" accept="image/jpeg,image/png,image/webp,image/heic,.heic" disabled={busy} className="block w-full text-sm text-slate-200 file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-3 file:text-slate-900 file:font-semibold" onChange={e=>void process(e.target.files?.[0])}/><p className="text-slate-300 text-sm mt-4">JPG, PNG, WebP o HEIC · hasta 10 MB</p>{busy&&<p role="status" className="mt-3">Preparando la foto…</p>}{error&&<p role="alert" className="text-red-200 mt-3">{error}</p>}
 </div>;
}
