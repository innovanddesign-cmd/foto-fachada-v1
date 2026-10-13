import {objectiveFor,type SectorBrief} from './sectors';
export function campaignBudget(b:SectorBrief){
 const units=Number(b.capacity),cost=Number(b.unitCost?.replace(',','.'));
 return b.capacity?.trim()&&b.unitCost?.trim()&&Number.isInteger(units)&&units>0&&Number.isFinite(cost)&&cost>=0?Math.round(units*cost*100)/100:null;
}
export function campaignIssues(b:SectorBrief):string[]{
 const errors:string[]=[];
 if(!b.location.trim())errors.push('Indica la zona donde se mostrará la campaña.');
 if(!b.services.trim())errors.push('Describe el servicio o inmueble real que vas a promocionar.');
 if(!b.audience?.trim())errors.push('Define a quién quieres atraer.');
 if(!b.placement?.trim())errors.push('Indica dónde se colocará el cartel.');
 if(!b.startDate||!b.endDate||!/^\d{4}-\d{2}-\d{2}$/.test(b.startDate)||!/^\d{4}-\d{2}-\d{2}$/.test(b.endDate)||b.endDate<b.startDate)errors.push('Define un periodo válido de campaña.');
 if(!b.target||!Number.isInteger(Number(b.target))||Number(b.target)<1)errors.push('Indica cuántas consultas o solicitudes quieres conseguir.');
 if(!b.fulfillment?.trim())errors.push('Define quién atiende las solicitudes y cómo se confirma el siguiente paso.');
 if(b.offer.trim()&&!b.incentiveApproved)errors.push('Aprueba la promoción y sus condiciones, o elimina la oferta.');
 if(b.offer.trim()&&campaignBudget(b)===null)errors.push('Indica unidades disponibles y coste por unidad de la promoción (puede ser 0).');
 if(objectiveFor(b.sector,b.focus)?.availability&&!b.availability?.trim())errors.push('Indica las franjas reales que quieres dar a conocer.');
 return errors;
}
export function campaignOutline(b:SectorBrief){
 const chosen=objectiveFor(b.sector,b.focus);
 if(chosen)return {barrier:chosen.barrier,benefit:chosen.benefit,cta:chosen.cta,metric:chosen.metric,sections:chosen.sections,actions:[chosen.placement,'Comprobar que el QR lleva a una web que cumple la promesa del cartel.',b.fulfillment||'Asignar quién responde y confirma cada solicitud.','Registrar resultados reales y actualizar disponibilidad o retirar promociones vencidas.']};
 const owner=b.sector==='inmobiliarias'&&/propietari/i.test(b.focus),property=b.sector==='inmobiliarias'&&/inmueble/i.test(b.focus);
 const service=b.services.split(/[;\n]/)[0]?.trim().slice(0,65);
 return {
  barrier:owner?'El propietario necesita saber qué recibirá y quién le asesorará.':property?'El interesado necesita datos verificables del inmueble antes de solicitar una visita.':b.sector==='estetica'?'La persona necesita entender el tratamiento, sus condiciones y resolver dudas antes de pedir cita.':'La persona necesita ver servicios, trabajos reales, tarifas confirmadas y consultar disponibilidad.',
  benefit:owner?'¿Quieres vender tu vivienda? Consulta los pasos con nuestra agencia.':property?'Mira las fotos y características de este inmueble y consulta una visita.':b.sector==='estetica'?`Descubre ${service||'nuestros tratamientos'} y resuelve tus dudas antes de pedir cita.`:`Consulta ${service||'nuestros servicios'} y los horarios disponibles para tu próxima cita.`,
  cta:owner?'Consultar cómo vender mi vivienda':property?'Consultar una visita':b.sector==='estetica'?'Consultar este tratamiento':'Consultar mi próxima cita',
  metric:b.sector==='inmobiliarias'?'Consultas cualificadas y visitas confirmadas':'Solicitudes de cita y citas confirmadas',
  actions:['Colocar el cartel donde sea visible y se pueda escanear con seguridad.','Escanear el QR y comprobar que la landing cumple la promesa del cartel.',b.fulfillment||'Asignar una persona para responder y confirmar cada solicitud.','Registrar resultados reales y retirar o actualizar la oferta al agotarse o vencer.'],
 };
}
