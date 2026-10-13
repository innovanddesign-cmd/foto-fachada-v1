const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
const ctx={process,URL,encodeURIComponent,window:{location:{origin:'https://example.test'}},fetch:async()=>({ok:true,json:async()=>({simple:{barber:{},clinic:{}},premium:{}})})};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('lib/design/render.js','utf8').replace(/export /g,'')+'\nglobalThis.render=buildLandingDocument;globalThis.imageURL=safeImageURL;',ctx);
const exp={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/supabase/sanitize.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:exp});
(async()=>{
 const source={datosEscaparate:{disenoSeleccionado:'heroe-dividido',datosReales:{email:'test@example.test',direccion:'Calle A & B'}}};
 assert.equal(exp.sanearPayloadPublico(source).datosEscaparate.disenoSeleccionado,'heroe-dividido');
 assert.equal(exp.sanearPayloadPublico({datosEscaparate:{disenoSeleccionado:'<script>alert(1)</script>'}}).datosEscaparate.disenoSeleccionado,undefined);
 const published=exp.sanearPayloadPublico({datosEscaparate:{titularPrincipal:'TITULAR',datosReales:{descripcionValor:'Texto revisado'},datosSugeridos:{titularPrincipal:'TITULAR'}}});
 assert.equal(published.datosEscaparate.datosReales.titularPrincipal,undefined,'absent override must stay absent on publication');
 assert.equal(published.datosEscaparate.datosSugeridos.titularPrincipal,'TITULAR');
 assert.equal(exp.sanearPayloadPublico({datosEscaparate:{datosReales:{titularPrincipal:''}}}).datosEscaparate.datosReales.titularPrincipal,'','intentional clearing must survive');
 const business={name:'<script>alert(1)</script>',category:'barber',email:'test@example.test',address:'Calle A & B',colors:{primario:'#123456',secundario:'#654321',acento:'#000000',fondo:'#ffffff'}};
 const content={layout:'heroe-dividido',sections:[{type:'services',title:'Servicios únicos',items:[{title:'Corte',price:'10 €'}]}],gallery:[{url:'https://example.test/photo.jpg'}]};
 const pro=await ctx.render({business:{...business,plan:'PRO'},content});
 assert.ok(!pro.includes('<script>alert(1)</script>'));assert.ok(pro.includes('&lt;script&gt;'));
 assert.ok(pro.includes('mailto:test@example.test'));assert.ok(pro.includes('query=Calle%20A%20%26%20B'));
 for(const color of ['--primary:#123456','--secondary:#654321','--accent:#000000','--text:#181511','--button-text:#ffffff'])assert.ok(pro.includes(color),color);
 assert.ok(pro.includes('margin-left:8%'));assert.ok(pro.includes('Servicios únicos'));assert.ok(!pro.includes('id="galeria"'));
 const free=await ctx.render({business:{...business,plan:'FREE'},content});assert.ok(!free.includes('Servicios únicos'));
 const businessPage=await ctx.render({business:{...business,plan:'BUSINESS'},content});assert.ok(businessPage.includes('id="galeria"'));assert.ok(businessPage.includes('visual-tabs" aria-label'));
 assert.equal(ctx.imageURL('javascript:alert(1)'), '');assert.equal(ctx.imageURL('tel:123'), '');assert.equal(ctx.imageURL('data:image/svg+xml;base64,AAAA'), '');
 const injected=await ctx.render({business:{...business,plan:'PRO'},content:{heroImage:"https://example.test/a');color:red;/*"}});
 assert.ok(injected.includes('campaign-photo'));assert.ok(injected.includes('a&#39;);color:red;/*'));assert.ok(!injected.includes('style="background-image:'));
 for(const [category,niche] of [['Inmobiliaria','estate'],['Centro de estética','beauty'],['Peluquería','hair'],['Barbería','barber']]){const page=await ctx.render({business:{...business,name:'MARCA CONFIRMADA',category,plan:'PRO'},content:{...content,title:'TITULAR DE CAMPAÑA',subtitle:'Texto publicable'}});assert.ok(page.includes('campaign-'+niche));assert.ok(page.includes('campaign-brand">MARCA CONFIRMADA'));assert.ok(page.includes('<h1>TITULAR DE CAMPAÑA</h1>'));assert.ok(page.includes('mailto:test@example.test'));}
 for(const plan of ['PRO','BUSINESS']){
  const edited=await ctx.render({business:{...business,category:'Centro de estética',plan,description:'DESCRIPCION EDITADA <segura>'},content:{...content,subtitle:'DESCRIPCION ANTIGUA'}});
  assert.ok(edited.includes('<p>DESCRIPCION EDITADA &lt;segura&gt;</p>'));
  assert.ok(!edited.includes('<p>DESCRIPCION ANTIGUA</p>'));
 }
 console.log('PASS renderer: layout survives publication, all palette colors, contrast, contacts, plan sections, HTML escaping and unsafe image/CSS rejection.');
})().catch(e=>{console.error(e);process.exit(1)});