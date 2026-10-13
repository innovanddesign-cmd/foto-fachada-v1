import {SectorLanding} from '@/components/marketing/SectorLanding';
import {sectors} from '@/lib/marketing/sectors';
export const metadata={title:sectors.peluquerias.label+' | INNOVA Escaparates',description:sectors.peluquerias.description,alternates:{canonical:'https://escaparates.innovandesign.com/peluquerias'}};
export default function Page(){return <SectorLanding sector="peluquerias"/>;}
