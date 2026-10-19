import {NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
import {commercialDB} from '@/lib/commercial/server';
import {workerAuthorized} from '@/lib/commercial/worker-auth';
import {cleanCampaignStorage} from '@/lib/commercial/storage-cleanup';
import {deliverEmail,checkEmailDelivery} from '@/lib/commercial/email-delivery';
export const runtime='nodejs';
export async function POST(req:Request){
 const headers={'Cache-Control':'private, no-store'};
 if(!workerAuthorized(req))return NextResponse.json({error:'Unauthorized'},{status:401,headers});
 if(process.env.INNOVA_MAINTENANCE_ENABLED!=='true')return NextResponse.json({disabled:true},{status:503,headers});
 const results:Record<string,unknown>={};
 try{
  const sql=commercialDB();const [lock]=await sql`select private.innova_claim_worker() as lease`;
  if(!lock.lease)return NextResponse.json({busy:true},{status:202,headers});
  const step=async(name:string,fn:()=>Promise<unknown>)=>{try{results[name]=await fn();}catch{results[name]={error:true};}};
  try{
   if(process.env.INNOVA_SCHEDULING_ENABLED==='true')await step('publication',async()=> (await sql`select private.innova_run_scheduled_publication() as result`)[0].result);
   await step('retention',async()=> (await sql`select private.innova_process_retention() as result`)[0].result);
   await step('prepareExperienceEmail',async()=> (await sql`select private.innova_prepare_experience_emails() as prepared`)[0]);
   await step('preparePublicationEmail',async()=> (await sql`select private.innova_prepare_publication_emails() as prepared`)[0]);
   await step('prepareEmail',async()=> (await sql`select private.innova_prepare_contact_emails() as prepared`)[0]);
   await step('deliveryStatus',()=>checkEmailDelivery());
   await step('email',()=>deliverEmail());
   await step('emailQuota',async()=> (await sql`select private.innova_email_status() as result`)[0].result);
   if(process.env.SUPABASE_SERVICE_ROLE_KEY&&process.env.NEXT_PUBLIC_SUPABASE_URL)await step('storage',async()=>{
    const [row]=await sql`select private.innova_claim_storage_cleanup() as job`;if(!row.job)return {processed:0};
    let done=false;try{const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});done=await cleanCampaignStorage(sb.storage,row.job);}catch{/* Persist retry below. */}
    const [result]=await sql`select private.innova_finish_storage_cleanup(${row.job.id}::uuid,${row.job.lease}::uuid,${done}) as accepted`;
    return {processed:1,completed:done&&result.accepted};
   });
  }finally{await sql`select private.innova_finish_worker(${lock.lease}::uuid)`;}
  return NextResponse.json({results},{headers});
 }catch{return NextResponse.json({error:'Worker unavailable'},{status:503,headers});}
}
