import {NextResponse} from 'next/server';
import {commercialDB} from '@/lib/commercial/server';
export const dynamic='force-dynamic';
// A shared short-lived promise avoids one database connection per probe.
let cached:Promise<boolean>|undefined;
let expires=0;
export async function GET(){
 if(!cached||Date.now()>=expires){
  expires=Date.now()+30000;
  cached=(async()=>{
   try{
    if(!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)return false;
    const sql=commercialDB();
    const [row]=await sql`select to_regclass('private.innova_accounts') is not null
      and to_regclass('private.innova_orders') is not null
      and to_regclass('private.innova_experiences') is not null
      and to_regclass('private.innova_campaign_purchases') is not null
      and to_regprocedure('private.innova_plan_quote(uuid,text,text)') is not null
      and to_regclass('private.innova_storage_cleanup') is not null
      and to_regclass('private.innova_publication_schedule') is not null
      and to_regclass('private.innova_contacts') is not null
      and to_regprocedure('private.innova_process_retention()') is not null
      and to_regprocedure('public.innova_delete_campaign(uuid,boolean)') is not null
      and exists(select 1 from pg_attribute where attrelid=to_regclass('private.innova_accounts') and attname='included_balance' and not attisdropped)
      and exists(select 1 from pg_attribute where attrelid=to_regclass('private.innova_credit_operations') and attname='included_debit' and not attisdropped)
      and to_regclass('private.innova_credit_operations') is not null
      and to_regclass('private.innova_ai_budget') is not null
      and to_regprocedure('public.innova_public_page(text)') is not null
      and to_regprocedure('public.innova_resolve_qr(text,boolean)') is not null
      and to_regprocedure('private.innova_account_summary(uuid)') is not null
      and to_regprocedure('private.innova_reserve_v2(uuid,uuid,text,integer,uuid,boolean)') is not null
      and to_regprocedure('private.innova_ai_quote(uuid,text,uuid,boolean)') is not null
      and to_regprocedure('private.innova_finish(uuid,uuid,boolean)') is not null
      and to_regprocedure('private.innova_topup(uuid,text,text,uuid)') is not null
      and exists(select 1 from pg_attribute where attrelid=to_regclass('public.escaparates_ai_attempts') and attname='estimated_usd_micros' and not attisdropped)
      and exists(select 1 from pg_trigger where tgrelid=to_regclass('public.escaparates_published') and tgname='innova_preserve_publication_order' and tgenabled in ('O','A') and not tgisinternal)
      as ready`;
    return row?.ready===true;
   }catch(error){
    const code=(error as {code?:unknown})?.code;
    console.error('Readiness unavailable',{
     code:typeof code==='string'&&/^[A-Z0-9_]{2,50}$/.test(code)?code:'CONFIG_OR_CONNECTION',
     databaseConfigured:!!process.env.DATABASE_URL,
     authConfigured:!!process.env.NEXT_PUBLIC_SUPABASE_URL,
    });
    return false;
   }
  })();
 }
 const ready=await cached;
 // No keys, account data, host names or database errors leave this endpoint.
 return NextResponse.json({status:ready?'ok':'unavailable'},{status:ready?200:503,headers:{'Cache-Control':'no-store'}});
}
