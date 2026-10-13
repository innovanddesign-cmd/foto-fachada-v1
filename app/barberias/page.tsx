import {SectorLanding} from '@/components/marketing/SectorLanding';
import {sectors} from '@/lib/marketing/sectors';
export const metadata={title:sectors.barberias.label+' | INNOVA Escaparates',description:sectors.barberias.description,alternates:{canonical:'https://escaparates.innovandesign.com/barberias'}};
export default function Page(){return <SectorLanding sector="barberias"/>;}
