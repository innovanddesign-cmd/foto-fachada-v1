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
      and to_regprocedure('public.innova_public_page(text)') is not null
      and to_regprocedure('private.innova_reserve(uuid,uuid,text,integer)') is not null as ready`;
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
