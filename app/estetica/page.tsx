import {SectorLanding} from '@/components/marketing/SectorLanding';
import {sectors} from '@/lib/marketing/sectors';
export const metadata={title:sectors.estetica.label+' | INNOVA Escaparates',description:sectors.estetica.description,alternates:{canonical:'https://escaparates.innovandesign.com/estetica'}};
export default function Page(){return <SectorLanding sector="estetica"/>;}
