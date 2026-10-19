export type NotificationPreference = 'immediate' | 'daily' | 'off';
export const ESSENTIAL_NOTIFICATIONS = new Set(['security','payment_failure','access_change','deletion_warning','publication_failed','capacity_full']);
export function emailDecision(kind:string, preference:NotificationPreference, now:number, lastContactEmail:number|null) {
  if(ESSENTIAL_NOTIFICATIONS.has(kind))return {send:true,at:now,essential:true};
  if(kind!=='contact')return {send:true,at:now,essential:false};
  if(preference==='off')return {send:false,at:null,essential:false};
  if(preference==='daily')return {send:false,at:null,essential:false,daily:true};
  return {send:true,at:lastContactEmail===null?now:Math.max(now,lastContactEmail+15*60000),essential:false};
}
export function quotaState(sentToday:number,sentMonth:number,paid=false) {
  if(!Number.isSafeInteger(sentToday)||!Number.isSafeInteger(sentMonth)||sentToday<0||sentMonth<0)throw Error('INVALID_USAGE');
  const ratio=paid?sentMonth/50000:Math.max(sentToday/100,sentMonth/3000);
  return {blocked:ratio>=1,alert:ratio>=.9?90:ratio>=.8?80:null,upgradeRequired:!paid&&ratio>=1};
}
export function safeEmail(kind:string,campaignName:string,count=1) {
  const name=campaignName.replace(/[\r\n]/g,' ').slice(0,160);
  if(!Number.isSafeInteger(count)||count<1)throw Error('INVALID_COUNT');
  return kind==='contact'
    ? {subject:count===1?'Nueva consulta en tu escaparate':count+' consultas nuevas en tu escaparate',text:'Campaña: '+name+'. Entra en tu panel para consultar los detalles y responder.'}
    : {subject:'Aviso de tu escaparate',text:'Hay una actualización de '+name+'. Consulta tu panel para ver el estado.'};
}
