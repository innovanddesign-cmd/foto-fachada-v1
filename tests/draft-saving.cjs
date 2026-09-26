const fs=require('fs'),ts=require('typescript'),vm=require('vm'),assert=require('node:assert/strict');
const state={slug:'restaurant',adnMarca:{analisisVision:{nombreSugerido:'Restaurante'}},datosEscaparate:{titularPrincipal:'Primera versión'},cartelesGenerados:[],galeriaActivos:[],redesSociales:{},campañas:[],guardarCampaña(c){const i=this.campañas.findIndex(x=>x.id===c.id);if(i<0)this.campañas.push(c);else this.campañas[i]=c;}};
const exportsObject={};const js=ts.transpileModule(fs.readFileSync('lib/campañas/GestionCampañas.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
vm.runInNewContext(js,{exports:exportsObject,require:n=>{if(n==='@/store/useTiendaEstado')return{useTiendaEstado:{getState:()=>state}};throw Error(n)},console,Date,Math});
const first=exportsObject.guardarCampañaEnStore('Mi campaña');assert.equal(state.campañas.length,1);
state.datosEscaparate={titularPrincipal:'Segunda versión'};state.cartelesGenerados=[{id:'poster-one'}];
const saved=exportsObject.guardarCampañaEnStore();assert.equal(saved.id,first.id);assert.equal(state.campañas.length,1);assert.equal(saved.snapshot.datosEscaparate.titularPrincipal,'Segunda versión');assert.equal(saved.snapshot.cartelesGenerados[0].id,'poster-one');assert.equal(saved.nombreCampaña,'Mi campaña');
console.log('PASS: updating an existing draft keeps identity and saves latest content and posters.');
