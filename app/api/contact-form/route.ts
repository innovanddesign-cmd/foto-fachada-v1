import {NextResponse} from 'next/server';
import {commercialDB} from '@/lib/commercial/server';
const headers={'Cache-Control':'no-store'};
export async function GET(req:Request){
 if(process.env.INNOVA_CONTACTS_ENABLED!=='true')return NextResponse.json({enabled:false},{headers});
 const slug=new URL(req.url).searchParams.get('slug');
 if(!slug||!/^[a-z0-9][a-z0-9-]{1,100}$/.test(slug))return NextResponse.json({enabled:false},{headers});
 try{const sql=commercialDB();const [r]=await sql`select private.innova_contact_capacity(campaign_id) as capacity from public.escaparates_published where slug=${slug}`;
 return NextResponse.json({enabled:!!r&&r.capacity.limit>0,available:r?.capacity.available===true},{headers});}
 catch{return NextResponse.json({error:'No se puede comprobar el formulario. Usa los botones de contacto del escaparate.'},{status:503,headers});}
}
export async function POST(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)return NextResponse.json({error:'Origen no permitido.'},{status:403,headers});
 if(process.env.INNOVA_CONTACTS_ENABLED!=='true')return NextResponse.json({error:'Formulario no disponible.'},{status:503,headers});
 try{
  const raw=await req.text();if(raw.length>12000)throw Error();const b=JSON.parse(raw);
  if(typeof b.slug!=='string'||!/^[a-z0-9][a-z0-9-]{1,100}$/.test(b.slug)||!/^[0-9a-f-]{36}$/i.test(b.requestId||'')||b.privacyAccepted!==true||b.website||typeof b.name!=='string'||!b.name.trim()||b.name.length>120||typeof b.address!=='string'||b.address.length>254||typeof b.message!=='string'||!b.message.trim()||b.message.length>4000)throw Error();
  if(b.channel==='email'?!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.address):b.channel!=='phone'||!/^\+?[\d ()-]{7,30}$/.test(b.address))throw Error();
  const sql=commercialDB();const [r]=await sql`select private.innova_capture_contact(${b.slug},${b.requestId}::uuid,${b.name},${b.channel},${b.address},${b.message}) as result`;
  if(r.result.status==='saved')return NextResponse.json({saved:true},{headers});
  const status=r.result.status==='rate_limited'?429:409;
  return NextResponse.json({saved:false,error:'No se ha guardado esta consulta. Usa los botones de contacto del escaparate o vuelve a intentarlo más tarde.'},{status,headers});
 }catch{return NextResponse.json({saved:false,error:'No se ha confirmado el guardado. Revisa los campos; puedes reintentar sin duplicar el envío.'},{status:400,headers});}
}
