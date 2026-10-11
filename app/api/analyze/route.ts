import { NextResponse } from 'next/server';
import { requireAIUser } from '@/lib/ai/access';
/** Retired prototype endpoint. Never call a paid provider through a legacy URL. */
export async function POST(req:Request){const access=await requireAIUser(req);if(access.response)return access.response;return NextResponse.json({error:'Este analizador antiguo ya no se utiliza. Abre Crear escaparate para usar el análisis gratuito.',code:'ENDPOINT_RETIRED'},{status:410});}
