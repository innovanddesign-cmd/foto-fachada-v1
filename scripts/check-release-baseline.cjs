const fs = require('node:fs');
const path = require('node:path');
// Release baseline: catch an accidental partial restoration of the old one-sector home.
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const home = read('app/page.tsx');
const gallery = read('components/marketing/ExamplesGallery.tsx');
const carousel = read('components/marketing/ExamplesCarousel.tsx');
for (const sector of ['inmobiliarias', 'estetica', 'peluquerias', 'barberias']) {
  if (!home.includes("sector:'" + sector + "'") || !gallery.includes("sector:'" + sector + "'")) throw Error('Missing sector in release: ' + sector);
}
for (const image of ['inmobiliaria', 'estetica', 'peluqueria', 'barberia']) {
  if (fs.statSync(path.join(root, 'public/sector-buildings/' + image + '.png')).size < 1000) throw Error('Missing 3D building: ' + image);
}
if (!home.includes('<ExamplesGallery sector={entry.sector} embedded/>') || !gallery.includes('<ExamplesCarousel') || !carousel.includes('export function ExamplesCarousel')) throw Error('The sector carousel release baseline is missing');
for (const file of ['app/checkout/page.tsx', 'app/api/account/route.ts', 'app/api/orders/route.ts']) read(file);
console.log('Release baseline OK: four sectors, 3D buildings, carousels and commercial routes.');
