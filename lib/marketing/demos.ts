export type Demo = { id: string; name: string; sector: string; file: string; featured?: boolean };
export const demos: Demo[] = [
 {id:'elite-estates',name:'Elite Estates',sector:'Inmobiliaria · Colección exclusiva',file:'elite-estates.html',featured:true},
 {id:'familyfirst',name:'FamilyFirst',sector:'Inmobiliaria · Hogares familiares',file:'familyfirst.html',featured:true},
 {id:'aura-luxe',name:'Aura Luxe',sector:'Estética · Cuidado premium',file:'aura-luxe.html',featured:true},
 {id:'purezen',name:'PureZen',sector:'Estética · Bienestar natural',file:'purezen.html',featured:true},
 {id:'salamandra',name:'La Salamandra',sector:'Parrilla y brasas',file:'salamandra.html'},
 {id:'sofia',name:'Sofia Lopardo',sector:'Moda y estilo',file:'sofia.html'},
 {id:'mango',name:'Mango Manía',sector:'Frutas tropicales',file:'mango.html'},
 {id:'quinchuqui',name:'Quinchuqui',sector:'Sabores de Ecuador',file:'quinchuqui.html'},
 {id:'belleza',name:'Belleza Lux',sector:'Belleza y bienestar',file:'belleza.html'},
 {id:'detail',name:'Elite Detail Pro',sector:'Cuidado del automóvil',file:'detail-demo.html'},
 {id:'clinic',name:'Dermascience Clinic',sector:'Estética avanzada',file:'clinic-demo.html'},
 {id:'dining',name:'Pure Modern Dining',sector:'Restauración',file:'dining-demo.html'},
];
export const featuredDemos = demos.filter(demo => demo.featured);
export const findDemo = (id: string) => demos.find(demo => demo.id === id);
