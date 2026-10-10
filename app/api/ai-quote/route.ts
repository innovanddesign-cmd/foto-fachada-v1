import { NextResponse } from 'next/server';
import { requireAIUser } from '@/lib/ai/access';
import { getAIQuotaSummary } from '@/lib/ai/quota';
import { accountSummary } from '@/lib/commercial/server';
export async function GET(req: Request) {
  const access = await requireAIUser(req); if (access.response) return access.response;
  try {
    if (process.env.INNOVA_CREDITS_ENABLED === 'true') {
      const account = await accountSummary(access.userId!);
      if (!account.operationCost) return NextResponse.json({ error: 'La tarifa de IA aún no está activada. Puedes continuar manualmente.' }, {status:503});
      return NextResponse.json({mode:'credits', cost:account.operationCost, balance:account.balance}, {headers:{'Cache-Control':'no-store'}});
    }
    const quota = await getAIQuotaSummary(access.userId!);
    return NextResponse.json({mode:'quota', remaining:Math.max(0, Number(quota.limit)-Number(quota.used))}, {headers:{'Cache-Control':'no-store'}});
  } catch { return NextResponse.json({error:'No se pudo consultar el coste. Puedes continuar sin IA.'}, {status:503}); }
}
