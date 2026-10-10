import {returnPath} from '@/lib/auth/return-path';
import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
export async function GET(request:NextRequest){
 const code=request.nextUrl.searchParams.get('code');
 if(code){const supabase=await createClient();const {error}=await supabase.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL(returnPath(request.nextUrl.searchParams.get('next')),request.url));}
 return NextResponse.redirect(new URL('/auth/login?error=confirmation',request.url));
}
