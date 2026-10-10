import { NextResponse } from 'next/server';
import { requireAIUser } from '@/lib/ai/access';
import { accountSummary } from '@/lib/commercial/server';
export async function GET(req: Request) {
  const access = await requireAIUser(req);
  if (access.response) return access.response;
  try { return NextResponse.json(await accountSummary(access.userId!), { headers: { 'Cache-Control': 'no-store' } }); }
  catch { return NextResponse.json({ error: 'No se pudo consultar tu plan. Contacta con INNOVA.' }, { status: 503 }); }
}
