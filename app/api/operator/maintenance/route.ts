import {NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
import {requireOperator} from '@/lib/commercial/operator';
import {commercialDB} from '@/lib/commercial/server';
import {cleanCampaignStorage} from '@/lib/commercial/storage-cleanup';
export async function POST(req:Request){
 const a=await requireOperator(req);if(a.response)return a.response;
 const headers={'Cache-Control':'private, no-store'};
 if(process.env.INNOVA_MAINTENANCE_ENABLED!=='true')return NextResponse.json({error:'Mantenimiento pendiente de configurar y validar.'},{status:503,headers});
 try{
  const raw=await req.text();if(raw.length>1000)throw Error();const body=JSON.parse(raw);const sql=commercialDB();
  if(body.action==='retention'){const [result]=await sql`select private.innova_process_retention() as result`;return NextResponse.json(result,{headers});}
  if(body.action==='prepare_contact_emails'){const [result]=await sql`select private.innova_prepare_contact_emails() as prepared`;return NextResponse.json({...result,sent:0},{headers});}
  if(body.action==='scheduled_publication'){
   if(process.env.INNOVA_SCHEDULING_ENABLED!=='true')return NextResponse.json({error:'Programación no activada.'},{status:503,headers});
   const [result]=await sql`select private.innova_run_scheduled_publication() as result`;return NextResponse.json(result,{headers});
  }
  if(body.action!=='storage_cleanup')return NextResponse.json({error:'Acción no válida.'},{status:400,headers});
  if(!process.env.SUPABASE_SERVICE_ROLE_KEY||!process.env.NEXT_PUBLIC_SUPABASE_URL)return NextResponse.json({error:'Almacenamiento pendiente de configurar.'},{status:503,headers});
  const [row]=await sql`select private.innova_claim_storage_cleanup() as job`;
  if(!row.job)return NextResponse.json({processed:0},{headers});
  const job=row.job;let done=false;
  try{const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});done=await cleanCampaignStorage(sb.storage,job);}catch{/* Persist generic retry state without credentials or personal object names. */}
  const [r]=await sql`select private.innova_finish_storage_cleanup(${job.id}::uuid,${job.lease}::uuid,${done}) as accepted`;
  return NextResponse.json({processed:1,completed:done&&r.accepted,retryRequired:!done||!r.accepted},{headers});
 }catch{return NextResponse.json({error:'No se pudo procesar el mantenimiento. La tarea sigue pendiente.'},{status:503,headers});}
}
