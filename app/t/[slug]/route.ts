import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
async function respond(request: NextRequest, context: { params: Promise<{ slug: string }> }, record: boolean) {
 const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 const headers = { 'Cache-Control': 'no-store, max-age=0', 'X-Robots-Tag': 'noindex' };
 if (!url || !key) return new NextResponse('Este QR no está disponible temporalmente.', { status: 503, headers });
 try {
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const {data,error} = await sb.rpc('innova_resolve_qr',{p_slug:(await context.params).slug,p_record:record});
  const result = {destination: !error && data?.slug && /^[a-z0-9][a-z0-9-]{1,100}$/.test(data.slug) ? '/v/'+data.slug : null,status:error?503:404};
  if (result.destination) return NextResponse.redirect(new URL((process.env.NEXT_PUBLIC_BASE_PATH || '') + result.destination, request.url), { status: 307, headers });
  return new NextResponse(result.status === 404 ? 'El destino de este QR no está publicado. Contacta con el negocio.' : 'No se puede abrir este QR ahora. Inténtalo de nuevo.', { status: result.status, headers });
 } catch { return new NextResponse('No se puede abrir este QR ahora. Inténtalo de nuevo.', { status: 503, headers }); }
}
export function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) { return respond(request, context, true); }
export function HEAD(request: NextRequest, context: { params: Promise<{ slug: string }> }) { return respond(request, context, false); }
