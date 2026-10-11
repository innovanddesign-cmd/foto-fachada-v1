import {SectorLanding} from '@/components/marketing/SectorLanding';
import {sectors} from '@/lib/marketing/sectors';
export const metadata={title:sectors.inmobiliarias.label+' | INNOVA Escaparates',description:sectors.inmobiliarias.description,alternates:{canonical:'https://escaparates.innovandesign.com/inmobiliarias'}};
export default function Page(){return <SectorLanding sector="inmobiliarias"/>;}
