import {NextResponse} from 'next/server';
import {requireAIUser} from '@/lib/ai/access';
import {commercialDB} from '@/lib/commercial/server';
const headers={'Cache-Control':'private, no-store'};
export async function GET(req:Request){
 const a=await requireAIUser(req);if(a.response)return a.response;
 try{const sql=commercialDB();const [p]=await sql`select contact_mode,timezone from private.innova_email_preferences where owner_id=${a.userId!}::uuid`;return NextResponse.json(p||{contact_mode:'immediate',timezone:'Europe/Madrid'},{headers});}
 catch{return NextResponse.json({error:'No se pudieron consultar las preferencias.'},{status:503,headers});}
}
export async function POST(req:Request){
 const a=await requireAIUser(req);if(a.response)return a.response;
 if(req.headers.get('origin')!==new URL(req.url).origin)return NextResponse.json({error:'Origen no permitido.'},{status:403,headers});
 try{const raw=await req.text();if(raw.length>1000)throw Error();const b=JSON.parse(raw);
 if(!['immediate','daily','off'].includes(b.mode)||typeof b.timezone!=='string'||b.timezone.length>100)throw Error();
 const sql=commercialDB();await sql`select private.innova_set_email_preferences(${a.userId!}::uuid,${b.mode},${b.timezone})`;return NextResponse.json({saved:true},{headers});}
 catch{return NextResponse.json({error:'No se guardaron las preferencias. Revisa el modo y la zona horaria.'},{status:409,headers});}
}
