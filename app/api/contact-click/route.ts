import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
const actions = new Set(['whatsapp','phone','email','maps','link','instagram']);
export async function POST(request: Request) {
 const headers = {'Cache-Control':'no-store'};
 try {
  if (request.headers.get('origin') && request.headers.get('origin') !== new URL(request.url).origin) return new NextResponse(null,{status:403,headers});
  const body = await request.text();
  if (body.length > 512) return new NextResponse(null,{status:413,headers});
  const {slug,action} = JSON.parse(body);
  if (typeof slug !== 'string' || !/^[a-z0-9][a-z0-9-]{1,100}$/.test(slug) || !actions.has(action)) return new NextResponse(null,{status:400,headers});
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if(!url||!key)return new NextResponse(null,{status:503,headers});
  const sb=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  const {data,error}=await sb.from('escaparates_published').select('campaign_id').eq('slug',slug).maybeSingle();
  if(error)return new NextResponse(null,{status:503,headers});
  if(!data)return new NextResponse(null,{status:404,headers});
  const result=await sb.from('escaparates_contact_clicks').insert({campaign_id:data.campaign_id,landing_slug:slug,action});
  return new NextResponse(null,{status:result.error?503:204,headers});
 } catch {return new NextResponse(null,{status:400,headers});}
}
