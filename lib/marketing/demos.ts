export type Demo = { id: string; name: string; sector: string; file: string; featured?: boolean; landingFile?: string; websiteUrl?: string; landingUrl?: string; adminUrl?: string; realCase?: boolean };
export const demos: Demo[] = [
 {id:'elite-estates',name:'Elite Estates',sector:'Inmobiliaria · Colección exclusiva',file:'elite-estates.html',landingFile:'elite-estates-landing.html',featured:true},
 {id:'distrito-homes',name:'Distrito Homes',sector:'Inmobiliaria · Caso real',file:'distrito-homes.html',featured:true,realCase:true,websiteUrl:'https://distritohomes.es/',landingUrl:'https://www.distritohomes.es/landing.html',adminUrl:'https://distritohomes.es/admin'},
 {id:'familyfirst',name:'FamilyFirst',sector:'Inmobiliaria · Hogares familiares',file:'familyfirst.html',featured:true},
];
export const featuredDemos = demos.filter(demo => demo.featured);
export const findDemo = (id: string) => demos.find(demo => demo.id === id);
