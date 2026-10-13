import {NextResponse} from 'next/server';
import {requireAIUser} from '@/lib/ai/access';
import {accountSummary} from '@/lib/commercial/server';
import {createClient} from '@/lib/supabase/server';
const headers={'Cache-Control':'private, no-store'};
const day=86400000;
export async function GET(req:Request){
 const access=await requireAIUser(req);if(access.response)return access.response;
 try{
  const account=await accountSummary(access.userId!);
  const detailed=['PRO','BUSINESS','ENTERPRISE'].includes(account.plan);
  const compare=['BUSINESS','ENTERPRISE'].includes(account.plan);
  const params=new URL(req.url).searchParams;
  const today=new Date().toISOString().slice(0,10);
  const from=detailed?(params.get('from')||new Date(Date.now()-29*day).toISOString().slice(0,10)):null;
  const to=detailed?(params.get('to')||today):null;
  const valid=(v:string)=>/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
  if(from&&to&&(!valid(from)||!valid(to)||from>to||to>today||(Date.parse(to)-Date.parse(from))/day>365))return NextResponse.json({error:'Elige un periodo válido de hasta 366 días, sin fechas futuras.'},{status:400,headers});
  const start=from?Date.parse(from):null,end=to?Date.parse(to)+day:null;
  const sb=await createClient(); // User session + RLS, never service-role access.
  async function count(table:string,time:string,begin:number|null,finish:number|null,field?:string,value?:string){
   let q=sb.from(table).select('id',{count:'exact',head:true});
   if(begin!==null)q=q.gte(time,new Date(begin).toISOString());
   if(finish!==null)q=q.lt(time,new Date(finish).toISOString());
   if(field&&value)q=q.eq(field,value);
   const r=await q;if(r.error||typeof r.count!=='number')throw Error('METRICS_UNAVAILABLE');return r.count;
  }
  async function totals(begin:number|null,finish:number|null){
   const [scans,clicks]=await Promise.all([count('escaparates_qr_scans','scanned_at',begin,finish),count('escaparates_contact_clicks','clicked_at',begin,finish)]);return {scans,clicks};
  }
  const current=await totals(start,end);
  const previous=compare&&start!==null&&end!==null?await totals(start-(end-start),start):null;
  const campaigns=[];
  if(detailed){
   const r=await sb.from('escaparates_campaigns').select('id,name,slug').eq('owner_id',access.userId!).order('created_at',{ascending:false}).limit(101);
   if(r.error)throw Error('METRICS_UNAVAILABLE');
   if((r.data||[]).length>100)return NextResponse.json({error:'Este informe admite hasta 100 campañas. Contacta con INNOVA para un informe ampliado.'},{status:422,headers});
   for(const c of r.data||[]){
    const [scans,clicks]=await Promise.all([c.slug?count('escaparates_qr_scans','scanned_at',start,end,'target_slug',c.slug):Promise.resolve(0),count('escaparates_contact_clicks','clicked_at',start,end,'campaign_id',c.id)]);
    campaigns.push({name:c.name,slug:c.slug,scans,clicks});
   }
  }
  return NextResponse.json({plan:account.plan,from,to,current,previous,campaigns,canExport:compare,timezone:'UTC'},{headers});
 }catch{return NextResponse.json({error:'No se pudo cargar la analítica. Vuelve a intentarlo.'},{status:503,headers});}
}
