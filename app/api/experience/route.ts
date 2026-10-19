import {NextResponse} from 'next/server';
import {requireAIUser} from '@/lib/ai/access';
import {commercialDB,accountSummary} from '@/lib/commercial/server';
const headers={'Cache-Control':'private, no-store'};
export async function POST(req:Request){
 const a=await requireAIUser(req);if(a.response)return a.response;
 if(req.headers.get('origin')!==new URL(req.url).origin)return NextResponse.json({error:'Origen no permitido'},{status:403,headers});
 try{
  const raw=await req.text();if(raw.length>2000)throw Error();const b=JSON.parse(raw);
  if(!b||!['campaign_trial','basic_trial','free'].includes(b.action)||b.action==='campaign_trial'&&!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(b.campaignId||''))return NextResponse.json({error:'Selecciona una campaña guardada en tu cuenta.'},{status:400,headers});
  const sql=commercialDB();await sql`select private.innova_experience_action(${a.userId!}::uuid,${b.action},${b.action==='campaign_trial'?b.campaignId:null}::uuid)`;
  return NextResponse.json(await accountSummary(a.userId!),{headers});
 }catch{return NextResponse.json({error:'No se pudo activar esta opción. Comprueba si ya disfrutaste de la prueba, si terminó el periodo anterior o si tienes un plan activo.'},{status:409,headers});}
}
