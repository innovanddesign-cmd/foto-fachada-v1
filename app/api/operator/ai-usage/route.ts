import {NextResponse} from 'next/server';
import {requireOperator} from '@/lib/commercial/operator';
import {commercialDB} from '@/lib/commercial/server';
export async function GET(req:Request){const access=await requireOperator(req);if(access.response)return access.response;
 try{const sql=commercialDB();const budget=await sql`select month,committed_micros,limit_micros,committed_micros>=20000000 as warning from private.innova_ai_budget order by month desc limit 3`;
 const usage=await sql`select model,count(*)::int as calls,sum(prompt_tokens)::bigint as input_tokens,sum(output_tokens)::bigint as output_tokens,sum(thought_tokens)::bigint as thought_tokens,sum(estimated_usd_micros)::bigint as estimated_usd_micros,count(*) filter(where estimated_usd_micros is null)::int as unknown_costs from public.escaparates_ai_attempts where created_at>=date_trunc('month',now() at time zone 'UTC') group by model`;
 return NextResponse.json({budget,usage,currency:'USD',note:'Estimación; los costes desconocidos conservan la reserva completa. No sustituye la factura del proveedor.'},{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'No se pudo consultar el consumo'},{status:503});}}
