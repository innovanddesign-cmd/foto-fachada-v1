import {NextResponse} from 'next/server';
import {requireAIUser} from '@/lib/ai/access';
import {commercialDB} from '@/lib/commercial/server';
export async function GET(req:Request){
 const a=await requireAIUser(req);if(a.response)return a.response;
 const p=new URL(req.url).searchParams,headers={'Cache-Control':'private, no-store'};
 if(!['BASIC','PRO','BUSINESS'].includes(p.get('plan')||'')||!['annual','monthly'].includes(p.get('billing')||''))return NextResponse.json({error:'Plan no válido'},{status:400,headers});
 try{const sql=commercialDB();const [r]=await sql`select private.innova_plan_quote(${a.userId!}::uuid,${p.get('plan')},${p.get('billing')}) as price`;return NextResponse.json(r.price,{headers});}
 catch{return NextResponse.json({error:'No se pudo confirmar el precio. Reintenta antes de pagar.'},{status:503,headers});}
}
