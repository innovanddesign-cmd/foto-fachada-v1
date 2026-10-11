export type Demo = { id: string; name: string; sector: string; file: string; featured?: boolean; previewImage?: string; previewWidth?: number; landingFile?: string; websiteUrl?: string; landingUrl?: string; adminUrl?: string; realCase?: boolean };
export const demos: Demo[] = [
 {id:'belleza-lux',name:'Belleza Lux',sector:'Centro de estética',file:'belleza.html',featured:true},
 {id:'dermascience_clinic_v2',name:'DermaScience',sector:'Centro de estética',file:'',featured:true,previewImage:'https://innovandesign.com/INNOVA-ESCAPARATES-V1/escaparate-v1/dermascience_clinic_v2/screen.png',previewWidth:262},
 {id:'glossy_chic_nail_spa_v1',name:'Glossy Chic',sector:'Estética y uñas',file:'',featured:true,previewImage:'https://innovandesign.com/INNOVA-ESCAPARATES-V1/escaparate-v1/glossy_chic_nail_spa_v1/screen.png',previewWidth:237},
 {id:'elite_estates_showcase_v1',name:'Elite Estates Showcase',sector:'Inmobiliaria',file:'',featured:true,previewImage:'https://innovandesign.com/INNOVA-ESCAPARATES-V1/escaparate-v1/elite_estates_showcase_v1/screen.png',previewWidth:302},
 {id:'minimalist_rentals_v3',name:'Minimalist Rentals',sector:'Inmobiliaria',file:'',featured:true,previewImage:'https://innovandesign.com/INNOVA-ESCAPARATES-V1/escaparate-v1/minimalist_rentals_v3/screen.png',previewWidth:363},
 {id:'ecohair_botanical_v4',name:'EcoHair Botanical',sector:'Peluquería',file:'',featured:true,previewImage:'https://innovandesign.com/INNOVA-ESCAPARATES-V1/escaparate-v1/ecohair_botanical_v4/screen.png',previewWidth:274},
 {id:'the_urban_barber_v2',name:'The Urban Barber',sector:'Barbería',file:'',featured:true,previewImage:'https://innovandesign.com/INNOVA-ESCAPARATES-V1/escaparate-v1/the_urban_barber_v2/screen.png',previewWidth:244},

 {id:'estetica-demo',name:'Estudio Serena',sector:'Estética · Ejemplo ficticio',file:'estetica-demo.html',featured:false},
 {id:'barberia-demo',name:'Barbería Norte',sector:'Barbería · Ejemplo ficticio',file:'barberia-demo.html',featured:false},
 {id:'elite-estates',name:'Elite Estates',sector:'Inmobiliaria · Colección exclusiva',file:'elite-estates.html',landingFile:'elite-estates-landing.html',featured:false},
 {id:'distrito-homes',name:'Distrito Homes',sector:'Inmobiliaria · Caso real',file:'distrito-homes.html',featured:true,realCase:true,websiteUrl:'https://distritohomes.es/',landingUrl:'https://www.distritohomes.es/landing.html',adminUrl:'https://distritohomes.es/admin'},
 {id:'familyfirst',name:'FamilyFirst',sector:'Inmobiliaria · Hogares familiares',file:'familyfirst.html',featured:false},
];
export const featuredDemos = demos.filter(demo => demo.featured);
export const findDemo = (id: string) => demos.find(demo => demo.id === id);
