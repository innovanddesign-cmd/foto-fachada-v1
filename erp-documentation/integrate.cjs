// Patch only the verified production entry points. Fail closed on a changed bundle.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const source=process.argv[2],output=process.argv[3];if(!source||!output)throw Error('Usage: node integrate.cjs downloaded-erp release-directory');
const html=fs.readFileSync(path.join(source,'index.html'),'utf8');const old=html.match(/src="(\/erp\/assets\/[^" ]+\.js)"/)?.[1];if(!old)throw Error('Entry point missing');
let js=fs.readFileSync(path.join(source,old.replace('/erp/','')),'utf8');
const replace=(a,b)=>{if(js.split(a).length!==2)throw Error('Production layout changed: '+a.slice(0,60));js=js.replace(a,b);};
replace('S=["Gestión",["clients","catalog","budgets"', 'S=["Gestión",["clients","catalog","documents","budgets"');
replace('["Operaciones",["tasks","projects","clients","catalog","budgets"', '["Operaciones",["tasks","projects","clients","catalog","documents","budgets"');
replace('Q0=["dashboard","explorer","clients","catalog","budgets"', 'Q0=["dashboard","explorer","clients","catalog","documents","budgets"');
replace('{k:"catalog",label:"Catálogo comercial",icon:Ta}', '{k:"catalog",label:"Catálogo comercial",icon:Ta},{k:"documents",label:"Documentación",icon:Ta}');
replace('y==="catalog"&&o.jsx(e1,', 'y==="documents"&&o.jsx("iframe",{title:"Archivo central de documentación",src:"/erp/documentos.html",style:{width:"100%",height:"calc(100dvh - 160px)",border:0,borderRadius:16}}),y==="catalog"&&o.jsx(e1,');
replace('y.price!==null&&o.jsxs("button",{type:"button",onClick:()=>l(y)', 'o.jsx("a",{href:"/erp/documentos.html?service="+encodeURIComponent(y.code),className:`min-h-[44px] px-4 rounded-xl border ${n.border} text-sm font-semibold inline-flex items-center gap-2`,children:"Documentos"}),y.price!==null&&o.jsxs("button",{type:"button",onClick:()=>l(y)');
const name='index-documents-'+crypto.createHash('sha256').update(js).digest('hex').slice(0,12)+'.js';
fs.mkdirSync(path.join(output,'assets'),{recursive:true});fs.mkdirSync(path.join(output,'api'),{recursive:true});
fs.writeFileSync(path.join(output,'assets',name),js);fs.writeFileSync(path.join(output,'index.html'),html.replace(old,'/erp/assets/'+name));
for(const name of ['documentos.html','documentos.js','documentos.css'])fs.copyFileSync(path.join(__dirname,name),path.join(output,name));
fs.copyFileSync(path.join(__dirname,'api/documents.php'),path.join(output,'api/documents.php'));
fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify({entry:name,baseSHA256:crypto.createHash('sha256').update(fs.readFileSync(path.join(source,old.replace('/erp/','')))).digest('hex'),files:['api/documents.php','documentos.html','documentos.js','documentos.css','assets/'+name,'index.html']},null,2));
console.log('ERP documentation release prepared: '+name);
