import { generarMapaSecciones, BrandDNA } from './src/lib/generative/MotorEstructura.js';
import fs from 'fs';
import path from 'path';

const dna: BrandDNA = {
    nombre: "Lavandería Burbujas de Oro",
    rubro: "Lavandería",
    vibe: "Vibrante",
    publico: "Familias y profesionales con poco tiempo",
    colores: ["#FFD700", "#FFFFFF", "#000000"]
};

const semillas = ["LAVA_01_RAPID", "LAVA_02_PREMIUM", "LAVA_03_STORY"];

semillas.forEach((semilla, index) => {
    const resultado = generarMapaSecciones(dna, semilla);
    const fileName = `lavanderia_variante_${index + 1}.json`;
    const filePath = path.join(process.cwd(), 'brain', 'cc52cddf-c291-469d-9a4b-5055f49e0f4c', fileName);

    fs.writeFileSync(filePath, JSON.stringify(resultado, null, 2));
    console.log(`Generada variante ${index + 1}: ${fileName}`);
});
