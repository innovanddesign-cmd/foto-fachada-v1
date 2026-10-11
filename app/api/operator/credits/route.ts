import { NextResponse } from 'next/server';
import { requireOperator } from '@/lib/commercial/operator';
import { commercialDB } from '@/lib/commercial/server';
import { CREDIT_POLICY } from '@/lib/commercial/credits';
export async function POST(req:Request){
  const access = await requireOperator(req); if (access.response) return access.response;
  try{const raw=await req.text();if(raw.length>4000)throw Error();const b=JSON.parse(raw);
    const pack=CREDIT_POLICY.packs.find(p=>p.id===b.pack);
    if(!/^[0-9a-f-]{36}$/i.test(b.ownerId||'')||!pack||b.netCents!==pack.netCents||typeof b.paymentReference!=='string'||b.paymentReference.length<3||b.paymentReference.length>160)throw Error();
    const sql=commercialDB();await sql.begin(async tx=>{
      await tx`select private.innova_topup(${b.ownerId}::uuid,${b.pack},${b.paymentReference},${access.userId!}::uuid)`;
    });return NextResponse.json({success:true});
  }catch{return NextResponse.json({error:'No se ha aplicado la recarga. Revisa los datos o si el justificante ya fue utilizado.'},{status:409});}
}
