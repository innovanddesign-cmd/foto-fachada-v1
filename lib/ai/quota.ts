import 'server-only';
import postgres from 'postgres';
import { NextResponse } from 'next/server';

let connection: ReturnType<typeof postgres> | undefined;
export function quotaDiagnostic(error:unknown) {
  const e=error as {message?:string;code?:string};
  if(e?.message==='AI_DATABASE_UNAVAILABLE'||e?.message==='AI_DATABASE_MISMATCH')return e.message;
  const allowed=['ENOTFOUND','ENETUNREACH','ECONNREFUSED','CONNECT_TIMEOUT','28P01','42501','42P01','42883','SELF_SIGNED_CERT_IN_CHAIN','DEPTH_ZERO_SELF_SIGNED_CERT','ERR_INVALID_URL'];
  return e?.code && allowed.includes(e.code)?e.code:'AI_DATABASE_ERROR';
}
function db() {
  if (connection) return connection;
  const raw = process.env.DATABASE_URL;
  const projectURL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw || !projectURL) throw new Error('AI_DATABASE_UNAVAILABLE');
  const parsed = new URL(raw);
  const ref = new URL(projectURL).hostname.split('.')[0];
  const direct = parsed.hostname === `db.${ref}.supabase.co`;
  const pooled = parsed.hostname.endsWith('.pooler.supabase.com') && decodeURIComponent(parsed.username).endsWith(`.${ref}`);
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol) || (!direct && !pooled)) throw new Error('AI_DATABASE_MISMATCH');
  connection = postgres(raw, { max: 1, prepare: false, idle_timeout: 10, connect_timeout: 10, ssl: 'require' });
  return connection;
}

export async function withAIQuota(userId: string, requestId: string, run: () => Promise<Response>): Promise<Response> {
  const unavailable = () => NextResponse.json({ error:'La IA no está disponible ahora. Puedes continuar sin IA.', code:'AI_UNAVAILABLE' },{ status:503 });
  let reserved = false;
  try {
    const sql=db();
    const rows=await sql`select public.escaparates_ai_reserve(${userId}::uuid,${requestId}::uuid) as state`;
    if(rows[0]?.state !== 'reserved') {
      const code=rows[0]?.state;
      return NextResponse.json({error: code==='quota'?'Has alcanzado el límite mensual de IA. Puedes seguir editando sin IA.':'Espera antes de volver a intentarlo.',code:code==='quota'?'AI_QUOTA':'AI_RETRY'}, {status:code==='duplicate'?409:429});
    }
    reserved=true;
    let response:Response;
    try { response=await run(); }
    catch { response=unavailable(); }
    // A terminal state is immutable: a late/repeated completion cannot refund success.
    const done=await sql`select public.escaparates_ai_finish(${userId}::uuid,${requestId}::uuid,${response.ok}) as finished`;
    if(!done[0]?.finished) return unavailable();
    return response;
  } catch (error) {
    // Leave uncertain reservations in place for reconciliation, never allow unlimited calls.
    console.error(reserved?'AI_QUOTA_FINALIZATION_PENDING':'AI_QUOTA_UNAVAILABLE',quotaDiagnostic(error));
    return unavailable();
  }
}

export async function saveAIAttempt(requestId:string, attempt:number, model:string, status:number|null, metadata:unknown) {
  const usage=metadata && typeof metadata==='object'?metadata as Record<string,unknown>:{};
  const n=(key:string):number|null=>typeof usage[key]==='number' && Number.isSafeInteger(usage[key]) && (usage[key] as number)>=0 ? usage[key] as number : null;
  const sql=db();
  await sql`insert into public.escaparates_ai_attempts(request_id,attempt,model,http_status,prompt_tokens,output_tokens,thought_tokens,cached_tokens,total_tokens)
    values(${requestId}::uuid,${attempt},${model},${status},${n('promptTokenCount')},${n('candidatesTokenCount')},${n('thoughtsTokenCount')},${n('cachedContentTokenCount')},${n('totalTokenCount')})`;
}

export async function getAIQuotaSummary(userId:string) {
  const sql=db();
  const rows=await sql`select coalesce(a.plan,'FREE') as plan,
    case coalesce(a.plan,'FREE') when 'PRO' then 3 when 'ESCAPARATE' then 10 else 1 end as limit,
    (select count(*)::integer from public.escaparates_ai_requests r where r.owner_id=${userId}::uuid
      and r.month=date_trunc('month',now() at time zone 'Europe/Madrid')::date
      and r.state in ('reserved','succeeded')) as used
    from (select 1) base left join public.escaparates_ai_accounts a on a.owner_id=${userId}::uuid`;
  return rows[0];
}
