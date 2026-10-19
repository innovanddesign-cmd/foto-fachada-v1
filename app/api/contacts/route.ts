import {NextResponse} from 'next/server';
import {requireAIUser} from '@/lib/ai/access';
import {commercialDB} from '@/lib/commercial/server';
const headers={'Cache-Control':'private, no-store'},uuid=/^[0-9a-f-]{36}$/i;
export async function GET(req:Request){
 const a=await requireAIUser(req);if(a.response)return a.response;
 const q=new URL(req.url).searchParams,after=q.get('after'),campaign=q.get('campaign');
 if((after&&!uuid.test(after))||(campaign&&!uuid.test(campaign)))return NextResponse.json({error:'Filtro no válido.'},{status:400,headers});
 try{const sql=commercialDB();const contacts=await sql`select id,campaign_id,name,channel,address,message,created_at,access_until from private.innova_contacts c where owner_id=${a.userId!}::uuid and access_until>now() and not exists(select 1 from private.innova_contact_deletions d where d.contact_id=c.id) and (${after}::uuid is null or id>${after}::uuid) and (${campaign}::uuid is null or campaign_id=${campaign}::uuid) order by id limit 100`;
 return NextResponse.json({contacts,next:contacts.length===100?contacts[99].id:null},{headers});}
 catch{return NextResponse.json({error:'No se pudieron cargar tus consultas.'},{status:503,headers});}
}
export async function DELETE(req:Request){
 const a=await requireAIUser(req);if(a.response)return a.response;
 if(req.headers.get('origin')!==new URL(req.url).origin)return NextResponse.json({error:'Origen no permitido.'},{status:403,headers});
 try{const raw=await req.text();if(raw.length>2000)throw Error();const b=JSON.parse(raw);
 if(b.confirmed!==true||!uuid.test(b.campaignId||'')||(b.contactId!=null&&!uuid.test(b.contactId)))throw Error();
 const sql=commercialDB();const [r]=await sql`select private.innova_delete_contacts(${a.userId!}::uuid,${b.campaignId}::uuid,${b.contactId??null}::uuid) as deleted`;return NextResponse.json(r,{headers});
 }catch{return NextResponse.json({error:'No se han borrado las consultas. Revisa la confirmación.'},{status:409,headers});}
}
