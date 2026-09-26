import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';
export async function middleware(request:NextRequest){
 const privateRoute=/^\/(dashboard|create|auth)(\/|$)/.test(request.nextUrl.pathname);
 const response=privateRoute?(await updateSession(request)).supabaseResponse:NextResponse.next();
 response.headers.set('X-Frame-Options',request.nextUrl.pathname==='/test-mockup'?'SAMEORIGIN':'DENY');
 response.headers.set('X-Content-Type-Options','nosniff');
 response.headers.set('Referrer-Policy','strict-origin-when-cross-origin');
 if(privateRoute)response.headers.set('Cache-Control','private, no-store');
 return response;
}
export const config={matcher:['/','/dashboard/:path*','/create/:path*','/auth/:path*','/v/:path*','/t/:path*','/test-mockup']};
