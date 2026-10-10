import { OperatorTopUp } from '@/components/dashboard/OperatorTopUp';
import { OperatorOrders } from '@/components/dashboard/OperatorOrders';
import {createClient} from '@/lib/supabase/server';
import {OperatorConsole} from '@/components/dashboard/OperatorConsole';
export const dynamic='force-dynamic';
export default async function OperatorPage(){
 let authorized=false;
 try{const sb=await createClient();const {data:{user},error}=await sb.auth.getUser();authorized=!error&&!user?.is_anonymous&&user?.app_metadata?.innova_operator===true;}catch{/* Missing configuration or Auth outage must never grant operator access. */}
 if(!authorized)return <main className="studio-shell"><div className="studio-container"><h1>Acceso del equipo INNOVA</h1><p>Esta sección requiere una cuenta de operador autorizada. Si no puedes acceder, contacta con el responsable técnico.</p><a href="/auth/login">Iniciar sesión</a></div></main>;
 return <main className="studio-shell"><div className="studio-container"><h1 className="text-3xl font-semibold mb-6">Contratos y activaciones</h1><OperatorOrders/><OperatorConsole/><OperatorTopUp/></div></main>;
}
