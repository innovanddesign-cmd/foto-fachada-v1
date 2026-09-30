// Compile the original QR landing for the script-free phone preview.
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const tailwind = require('tailwindcss');
const base = path.join(__dirname, '../public/design-references');
postcss([tailwind({content:[path.join(base,'distrito-homes.html')],theme:{extend:{
 colors:{navy:{base:'#00132e',low:'#001b3d',high:'#0b2a50'},gold:'#e9c349',textlight:'#d6e3ff'},
 fontFamily:{serif:['Noto Serif','serif'],sans:['Plus Jakarta Sans','sans-serif']},
 boxShadow:{ambient:'0 32px 64px -12px rgba(0,14,36,.6)'},transitionTimingFunction:{editorial:'cubic-bezier(0.2,0,0,1)'}
}},plugins:[]})]).process('@tailwind base;\n@tailwind components;\n@tailwind utilities;', {from:undefined}).then(r=>fs.writeFileSync(path.join(base,'distrito-landing.css'),r.css));
