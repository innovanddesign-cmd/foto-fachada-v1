"use client";

import React from "react";
import { ContenedorCristal } from "@/components/sistema-diseno/ContenedorCristal";
import { BotonInteractiva } from "@/components/sistema-diseno/BotonInteractiva";
import { Tipografia } from "@/components/sistema-diseno/Tipografia";

export default function DesignSystemTest() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 p-10 flex flex-col gap-10">
            <Tipografia as="h1" className="text-white text-4xl mb-10">
                Prueba de Sistema de Diseño: Cristal Líquido 2026
            </Tipografia>

            <section className="flex flex-col gap-5">
                <Tipografia as="h2" className="text-white text-2xl">
                    1. Efectos de Cristal
                </Tipografia>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <ContenedorCristal intensidad="ligero" clase="p-6 h-40 flex items-center justify-center">
                        <Tipografia>Cristal Ligero</Tipografia>
                    </ContenedorCristal>

                    <ContenedorCristal intensidad="profundo" clase="p-6 h-40 flex items-center justify-center">
                        <Tipografia>Cristal Profundo</Tipografia>
                    </ContenedorCristal>

                    <ContenedorCristal intensidad="oscuro" clase="p-6 h-40 flex items-center justify-center">
                        <Tipografia>Cristal Oscuro</Tipografia>
                    </ContenedorCristal>
                </div>
            </section>

            <section className="flex flex-col gap-5">
                <Tipografia as="h2" className="text-white text-2xl">
                    2. Botones Interactivos
                </Tipografia>
                <div className="flex gap-5">
                    <BotonInteractiva>
                        Botón Sólido
                    </BotonInteractiva>
                    <BotonInteractiva variante="fantasma">
                        Botón Fantasma
                    </BotonInteractiva>
                </div>
            </section>

            <section className="flex flex-col gap-5">
                <Tipografia as="h2" className="text-white text-2xl">
                    3. Tipografía Óptica
                </Tipografia>
                <div className="bg-white/10 p-6 rounded-xl space-y-4">
                    <Tipografia as="h1" className="text-white text-6xl">
                        Título H1 (Tracking Ajustado)
                    </Tipografia>
                    <Tipografia as="p" className="text-white text-lg">
                        Este es un párrafo normal con tracking estándar. El ADN visual debe ser coherente.
                    </Tipografia>
                </div>
            </section>

        </div>
    );
}
