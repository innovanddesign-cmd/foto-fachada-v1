import { NextResponse } from 'next/server';
import { requireAIUser } from '@/lib/ai/access';
import { getAIQuotaSummary, quotaDiagnostic } from '@/lib/ai/quota';
export async function GET(request:Request) {
  const access=await requireAIUser(request);
  if(access.response)return access.response;
  try {return NextResponse.json(await getAIQuotaSummary(access.userId!),{headers:{'Cache-Control':'no-store'}});}
  catch (error) {console.error('AI_USAGE_UNAVAILABLE',quotaDiagnostic(error));return NextResponse.json({error:'No se pudo consultar tu uso de IA.'},{status:503,headers:{'Cache-Control':'no-store'}});}
}
