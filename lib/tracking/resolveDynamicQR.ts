/** Resolves directly to a published page, never to another QR (no redirect loops). */
export async function resolveDynamicQR(sb: any, slug: string, record = true): Promise<{ status: number; destination?: string }> {
 if (!/^[a-z0-9][a-z0-9-]{1,100}$/.test(slug)) return { status: 404 };
 const qr = await sb.from('escaparates_qr').select('target_campaign_id,version').eq('slug', slug).maybeSingle();
 if (qr.error) return { status: 503 };
 if (!qr.data?.target_campaign_id) return { status: 404 };
 const target = await sb.from('escaparates_published').select('slug').eq('campaign_id', qr.data.target_campaign_id).maybeSingle();
 if (target.error) return { status: 503 };
 if (!target.data || !/^[a-z0-9][a-z0-9-]{1,100}$/.test(target.data.slug)) return { status: 404 };
 // Request counts, not unique people or confirmed appointments. Failure must not block access.
 if (record) { try { await sb.from('escaparates_qr_scans').insert({ qr_slug: slug, target_slug: target.data.slug, version: qr.data.version }); } catch { /* destination remains available */ } }
 return { status: 307, destination: `/v/${target.data.slug}` };
}
