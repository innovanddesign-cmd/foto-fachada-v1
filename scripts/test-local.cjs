const {spawnSync}=require('node:child_process');
const files=['ai-access.cjs','ai-quota.cjs','contact-clicks.cjs','draft-saving.cjs','dynamic-qr.cjs','mvp-persistence.cjs','strategy-confirmation.cjs','commercial-db.mjs','operator-access.cjs','landing-renderer.cjs','ai-proposal.cjs','health.cjs','provider-diagnostics.cjs'];
for(const file of files){console.log('\n'+file);const r=spawnSync(process.execPath,['tests/'+file],{stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);}
