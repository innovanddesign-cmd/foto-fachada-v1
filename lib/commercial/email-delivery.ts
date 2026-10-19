import 'server-only';
import {commercialDB} from './server';

/** Bounded provider calls. No provider response or recipient is returned to the caller. */
export async function deliverEmail(fetcher:typeof fetch=fetch){
 if(process.env.INNOVA_EMAIL_ENABLED!=='true')return {disabled:true};
 const key=process.env.RESEND_API_KEY,from=process.env.INNOVA_EMAIL_FROM,origin=process.env.INNOVA_PUBLIC_ORIGIN;
 if(!key||!from||!origin||process.env.INNOVA_EMAIL_DOMAIN_VERIFIED!=='true')throw Error('EMAIL_CONFIG_REQUIRED');
 const sql=commercialDB();
 const [row]=await sql`select private.innova_claim_email(${from},${origin}) as job`;
 const job=row.job;if(!job)return {processed:0};if(job.quotaBlocked)return {quotaBlocked:true};
 let provider:string|null=null,retry=true;
 try{
  const response=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':`innova/${job.id}`},body:JSON.stringify(job.payload),signal:AbortSignal.timeout(10000),redirect:'error'});
  if(response.ok){const data=await response.json();if(typeof data.id==='string'&&/^[a-zA-Z0-9-]{1,100}$/.test(data.id))provider=data.id;}
  else retry=response.status===429||response.status>=500;
 }catch{/* Unknown outcome: retry same frozen payload/key, only within 23 hours. */}
 const [result]=await sql`select private.innova_finish_email(${job.id}::uuid,${job.lease}::uuid,${provider},${retry}) as accepted`;
 return {processed:1,providerAccepted:!!provider&&result.accepted,retryRequired:!provider&&retry};
}

export async function checkEmailDelivery(fetcher:typeof fetch=fetch){
 if(process.env.INNOVA_EMAIL_ENABLED!=='true')return {disabled:true};
 const key=process.env.RESEND_API_KEY;if(!key)throw Error('EMAIL_CONFIG_REQUIRED');
 const sql=commercialDB();
 const [job]=await sql`select id,provider_id from private.innova_email_jobs where state='accepted' and (checked_at is null or checked_at<now()-interval '15 minutes') order by checked_at nulls first,sent_at limit 1`;
 if(!job)return {checked:0};
 const response=await fetcher(`https://api.resend.com/emails/${encodeURIComponent(job.provider_id)}`,{headers:{Authorization:`Bearer ${key}`},signal:AbortSignal.timeout(10000),redirect:'error'});
 if(!response.ok)throw Error('EMAIL_STATUS_UNAVAILABLE');
 const data=await response.json();if(data.id!==job.provider_id)throw Error('EMAIL_STATUS_MISMATCH');
 const delivered=data.last_event==='delivered';
 const failed=['bounced','complained','failed','suppressed'].includes(data.last_event);
 await sql`select private.innova_record_email_delivery(${job.id}::uuid,${job.provider_id},${delivered},${failed})`;
 return {checked:1,delivered,failed};
}
