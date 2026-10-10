import { NextResponse } from 'next/server';
import { requireOperator } from '@/lib/commercial/operator';
import { commercialDB } from '@/lib/commercial/server';
export async function POST(req: Request) {
  const access = await requireOperator(req); if (access.response) return access.response;
  try {
    const raw=await req.text(); if(raw.length>16000) return NextResponse.json({error:'Solicitud demasiado grande'},{status:413});
    const b=JSON.parse(raw);
    const uuid=/^[0-9a-f-]{36}$/i;
    if (!uuid.test(b.ownerId||'') || !['PRO','BUSINESS','ENTERPRISE'].includes(b.plan) || !['monthly','annual'].includes(b.billing)
      || !['bizum','transfer','cash','card'].includes(b.paymentMethod) || typeof b.reference!=='string' || b.reference.length<3 || b.reference.length>160
      || typeof b.documentReference!=='string' || b.documentReference.length<3 || b.documentReference.length>500
      || !Number.isSafeInteger(b.netCents) || b.netCents<0 || !Number.isSafeInteger(b.taxCents) || b.taxCents<0
      || !Number.isFinite(Date.parse(b.periodStart)) || !Number.isFinite(Date.parse(b.periodEnd)) || Date.parse(b.periodEnd)<=Date.parse(b.periodStart)||Date.parse(b.periodStart)>Date.now()
      || (b.monthlyCredits!=null && (!Number.isSafeInteger(b.monthlyCredits)||b.monthlyCredits<0||b.monthlyCredits>1000000))
      || (b.operationCost!=null && (!Number.isSafeInteger(b.operationCost)||b.operationCost<1||b.operationCost>1000000))
      || (b.plan==='ENTERPRISE' && (!Number.isSafeInteger(b.activeLimit)||b.activeLimit<1||b.activeLimit>10000)))
      return NextResponse.json({error:'Revisa los datos del contrato y las condiciones aprobadas.'},{status:400});
    if(b.paymentMethod==='cash' && b.netCents+b.taxCents>=100000) return NextResponse.json({error:'Esta operación requiere un medio distinto de efectivo.'},{status:400});
    if(b.plan==='PRO'||b.plan==='BUSINESS'){b.monthlyCredits=1000;b.operationCost=b.plan==='PRO'?200:100;}
    const sql=commercialDB();
    await sql.begin(async tx=>{
      await tx`select pg_advisory_xact_lock(hashtextextended(${b.ownerId}::text,813))`;
      await tx`select private.innova_accrue(${b.ownerId}::uuid)`;
      const existing=await tx`select owner_id from private.innova_contracts where reference=${b.reference}`;
      if(existing.length) throw new Error('DUPLICATE');
      await tx`insert into private.innova_contracts(owner_id,reference,plan,billing,net_cents,tax_cents,payment_method,paid_at,period_start,period_end,accepted_document_ref,recorded_by)
        values(${b.ownerId}::uuid,${b.reference},${b.plan},${b.billing},${b.netCents},${b.taxCents},${b.paymentMethod},now(),${b.periodStart}::timestamptz,${b.periodEnd}::timestamptz,${b.documentReference},${access.userId!}::uuid)`;
      await tx`insert into private.innova_accounts(owner_id,plan,billing,anchor,paid_until,grace_until,monthly_credits,operation_cost,enterprise_limit)
        values(${b.ownerId}::uuid,${b.plan},${b.billing},${b.periodStart}::timestamptz,${b.periodEnd}::timestamptz,${b.periodEnd}::timestamptz+interval '1 month',${b.monthlyCredits??null},${b.operationCost??null},${b.activeLimit??null})
        on conflict(owner_id) do update set plan=excluded.plan,billing=excluded.billing,paid_until=excluded.paid_until,
          anchor=case when excluded.anchor>coalesce(innova_accounts.paid_until,excluded.anchor-interval '1 second') then excluded.anchor else innova_accounts.anchor end,
          credited_period=case when excluded.anchor>coalesce(innova_accounts.paid_until,excluded.anchor-interval '1 second') then -1 else innova_accounts.credited_period end,
          monthly_credits=excluded.monthly_credits,operation_cost=excluded.operation_cost,enterprise_limit=excluded.enterprise_limit,cancel_at_end=false,grace_until=excluded.paid_until+interval '1 month',updated_at=now()`;
    });
    return NextResponse.json({success:true});
  } catch(e) {return NextResponse.json({error:e instanceof Error&&e.message==='DUPLICATE'?'Este justificante ya está registrado. No se ha duplicado el cobro.':'No se pudo registrar. Comprueba las fechas, el justificante y la configuración.'},{status:409});}
}
