// Run once per minute from the hosting scheduler. Secrets come from its environment.
const origin=process.env.INNOVA_PUBLIC_ORIGIN,secret=process.env.INNOVA_WORKER_SECRET;
if(!origin||!/^https:\/\/[a-zA-Z0-9.-]+(?::[0-9]+)?$/.test(origin)||!secret||secret.length<32)throw Error('Worker configuration required');
try{
 const response=await fetch(origin+'/api/internal/maintenance',{method:'POST',headers:{Authorization:`Bearer ${secret}`},redirect:'error',signal:AbortSignal.timeout(55000)});
 const result=await response.json();
 if(!response.ok||Object.values(result.results||{}).some(step=>step?.error))throw Error('Worker requires attention');
 const level=result.results?.emailQuota?.quotaLevel||0;
 console.log(JSON.stringify({ok:true,busy:!!result.busy,emailQuotaLevel:level}));
 if(level>=80)console.error(`Email quota warning: ${level} percent threshold reached. Review provider usage before changing plan.`);
}catch{console.error('Maintenance failed; inspect private worker status. No credentials logged.');process.exitCode=1;}
