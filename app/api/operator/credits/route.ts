import { NextResponse } from 'next/server';
import { requireOperator } from '@/lib/commercial/operator';
import { commercialDB } from '@/lib/commercial/server';
export async function POST(req:Request){
  const access = await requireOperator(req); if (access.response) return access.response;
  try{const raw=await req.text();if(raw.length>4000)throw Error();const b=JSON.parse(raw);
    if(!/^[0-9a-f-]{36}$/i.test(b.ownerId||'')||!Number.isSafeInteger(b.credits)||b.credits<1||b.credits>1000000||typeof b.paymentReference!=='string'||b.paymentReference.length<3||b.paymentReference.length>160)throw Error();
    const sql=commercialDB();await sql.begin(async tx=>{
      await tx`select private.innova_accrue(${b.ownerId}::uuid)`;
      await tx`insert into private.innova_ledger(owner_id,amount,reason,reference) values(${b.ownerId}::uuid,${b.credits},${'Recarga verificada por '+access.userId!},${'topup:'+b.paymentReference})`;
      await tx`update private.innova_accounts set balance=balance+${b.credits} where owner_id=${b.ownerId}::uuid`;
    });return NextResponse.json({success:true});
  }catch{return NextResponse.json({error:'No se ha aplicado la recarga. Revisa los datos o si el justificante ya fue utilizado.'},{status:409});}
}
