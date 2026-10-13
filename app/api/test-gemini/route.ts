import {NextResponse} from 'next/server';
import {requireOperator} from '@/lib/commercial/operator';
/** Staff diagnostics only: never expose raw provider responses or query-string keys. */
export async function GET(req:Request){
 const access=await requireOperator(req);if(access.response)return access.response;
 if(!process.env.GEMINI_API_KEY)return NextResponse.json({error:'Proveedor no configurado'},{status:503});
 try{
  const response=await fetch('https://generativelanguage.googleapis.com/v1beta/models',{
   headers:{'x-goog-api-key':process.env.GEMINI_API_KEY},signal:AbortSignal.timeout(10000),cache:'no-store'});
  if(!response.ok)throw Error('PROVIDER');
  const data=await response.json();
  const models=(Array.isArray(data.models)?data.models:[])
   .filter((m:{supportedGenerationMethods?:string[]})=>m.supportedGenerationMethods?.includes('generateContent'))
   .map((m:{name:string})=>m.name);
  return NextResponse.json({models},{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'No se pudo comprobar el proveedor'},{status:503});}
}
