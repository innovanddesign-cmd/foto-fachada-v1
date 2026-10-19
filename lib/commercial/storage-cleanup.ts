/** Bounded, repeatable deletion of one exact campaign prefix, using Storage API (not SQL objects). */
export async function cleanCampaignStorage(storage:any,job:{owner_id:string;campaign_id:string;bucket:string}){
 const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 if(!uuid.test(job.owner_id)||!uuid.test(job.campaign_id)||!['escaparates-public','escaparates-assets'].includes(job.bucket))throw Error('INVALID_CLEANUP_SCOPE');
 const bucket=storage.from(job.bucket);let requests=0;
 async function clear(prefix:string,depth:number):Promise<boolean>{
  if(depth>8)return false;
  while(requests++<40){
   const {data,error}=await bucket.list(prefix,{limit:100,offset:0,sortBy:{column:'name',order:'asc'}});
   if(error||!Array.isArray(data))throw Error('STORAGE_LIST_FAILED');
   if(!data.length)return true;
   const files:string[]=[];
   for(const entry of data){
    if(typeof entry.name!=='string'||entry.name==='.'||entry.name==='..'||/[\\/]/.test(entry.name))throw Error('INVALID_OBJECT_NAME');
    if(entry.id===null){if(!await clear(prefix+'/'+entry.name,depth+1))return false;}
    else files.push(prefix+'/'+entry.name);
   }
   if(files.length){const result=await bucket.remove(files);if(result.error)throw Error('STORAGE_DELETE_FAILED');}
  }
  return false;
 }
 return clear(job.owner_id+'/'+job.campaign_id,0);
}
