import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function requireAIUser(request: Request) {
  const headers = { 'Cache-Control': 'no-store' };
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    return { response: NextResponse.json({ error: 'Origen no permitido' }, { status: 403, headers }) };
  }
  try {
    const sb = await createClient();
    const { data, error } = await sb.auth.getUser();
    if (error || !data.user || data.user.is_anonymous) {
      return { response: NextResponse.json({ error: 'Inicia sesión para usar la IA.', code: 'AUTH_REQUIRED' }, { status: 401, headers }) };
    }
    return { userId: data.user.id };
  } catch {
    return { response: NextResponse.json({ error: 'No se pudo comprobar tu sesión. Puedes continuar manualmente.' }, { status: 503, headers }) };
  }
}
