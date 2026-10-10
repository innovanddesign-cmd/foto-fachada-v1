import 'server-only';
import postgres from 'postgres';
let connection: ReturnType<typeof postgres> | undefined;
/** Never allow the commercial API to connect to a different project's database. */
export function commercialDB() {
  if (connection) return connection;
  const raw = process.env.DATABASE_URL;
  const project = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw || !project) throw new Error('COMMERCIAL_UNAVAILABLE');
  const url = new URL(raw), ref = new URL(project).hostname.split('.')[0];
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !(url.hostname === `db.${ref}.supabase.co` || url.hostname.endsWith('.pooler.supabase.com') && decodeURIComponent(url.username).endsWith(`.${ref}`))) throw new Error('COMMERCIAL_UNAVAILABLE');
  connection = postgres(raw, { max: 1, prepare: false, ssl: { rejectUnauthorized: true, ca: process.env.SUPABASE_DB_CA || undefined }, connect_timeout: 10, idle_timeout: 10 });
  return connection;
}
export async function accountSummary(owner: string) {
  const sql = commercialDB();
  const rows = await sql`select private.innova_account_summary(${owner}::uuid) as account`;
  return rows[0].account;
}
