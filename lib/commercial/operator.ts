import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** Only server-managed app_metadata can grant staff privileges. */
export async function requireOperator(req: Request) {
  if (req.headers.get('origin') !== new URL(req.url).origin) {
    return { response: NextResponse.json({ error: 'Origen no permitido' }, { status: 403 }) };
  }
  try {
    const sb = await createClient();
    const { data: { user }, error } = await sb.auth.getUser();
    if (error || !user || user.is_anonymous || user.app_metadata?.innova_operator !== true) {
      return { response: NextResponse.json({ error: 'Acceso reservado al equipo autorizado.' }, { status: 403 }) };
    }
    return { userId: user.id };
  } catch {
    return { response: NextResponse.json({ error: 'No se pudo comprobar la sesión del equipo.' }, { status: 503 }) };
  }
}
