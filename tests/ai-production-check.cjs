// Temporary test account only. Never print credentials, cookies or tokens.
const fs=require('fs'),{createServerClient}=require('@supabase/ssr');
const env=fs.readFileSync('.env.local','utf8');
function setting(name){const line=env.split(/\r?\n/).find(x=>x.startsWith(name+'='));if(!line)throw Error('Missing public configuration');return line.slice(name.length+1).replace(/^"|"$/g,'').trim()}
const jar=new Map();
const sb=createServerClient(setting('NEXT_PUBLIC_SUPABASE_URL'),setting('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),{cookies:{getAll:()=>[...jar].map(([name,value])=>({name,value})),setAll:values=>values.forEach(x=>jar.set(x.name,x.value))}});
(async()=>{
 try {
  const {error}=await sb.auth.signInWithPassword({email:process.argv[2],password:process.argv[3]});
  if(error)throw Error('Fixture login failed');
  const headers={cookie:[...jar].map(([k,v])=>k+'='+encodeURIComponent(v)).join('; ')};
  const read=await fetch('https://escaparates.innovandesign.com/api/ai-usage',{headers});
  console.log('quota summary:',read.status,await read.text());
  if(read.status!==200)process.exitCode=1;
  else {
   const invalid=await fetch('https://escaparates.innovandesign.com/api/analizar-fachada',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:'{}'});
   console.log('invalid image (no provider call):',invalid.status);
   if(invalid.status!==400)process.exitCode=1;
  }
 } finally {await sb.auth.signOut();}
})().catch(()=>{console.error('Production quota check failed; no credentials logged');process.exitCode=1});
