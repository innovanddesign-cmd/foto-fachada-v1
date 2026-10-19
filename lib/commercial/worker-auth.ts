import {timingSafeEqual} from 'node:crypto';
export function workerAuthorized(req:Request){
 const secret=process.env.INNOVA_WORKER_SECRET;
 if(!secret||secret.length<32)return false;
 const received=Buffer.from(req.headers.get('authorization')||'');
 const expected=Buffer.from(`Bearer ${secret}`);
 return received.length===expected.length&&timingSafeEqual(received,expected);
}
