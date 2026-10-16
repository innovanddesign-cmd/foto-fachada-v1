import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {commercialDB} from '@/lib/commercial/server';
import {DemoProposal} from '@/components/commercial/DemoProposal';
import {sanearPayloadPublico} from '@/lib/supabase/sanitize';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Propuesta de INNOVA',robots:{index:false,follow:false,noarchive:true}};
export default async function DemoPage({params}:{params:Promise<{id:string}>}){
 if(process.env.COMMERCIAL_DEMOS_ENABLED!=='true')notFound();
 const {id}=await params;
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))notFound();
 const sql=commercialDB();
 const [row]=await sql`select private.innova_demo_action('read',${sql.json({id})}::jsonb) as demo`;
 const demo=row?.demo;
 if(!demo||!['published','protected'].includes(demo.effectiveState))notFound();
 const payload=sanearPayloadPublico(demo.payload);
 payload.datosEscaparate.planVisual=demo.plan==='BUSINESS'?'ESCAPARATE':demo.plan;
 return <DemoProposal snapshot={payload}/>;
}
