"use client";

import React from "react";
import { cn } from "@/lib/utils"; // Assuming cn utility exists, usually does in shadcn/modern setups. If not, I'll fallback to template literals if needed, but standard is cn.

interface PropiedadesContenedorCristal {
    children: React.ReactNode;
    intensidad?: "ligero" | "profundo" | "oscuro";
    clase?: string;
}

export const ContenedorCristal = ({
    children,
    intensidad = "ligero",
    clase,
}: PropiedadesContenedorCristal) => {
    const mapasDeClase = {
        ligero: "bg-cristal-ligero backdrop-blur-cristal-ligero border-cristal-ligero text-coloresDeMarca-principal", // Assuming dark text for light glass
        profundo: "bg-cristal-profundo backdrop-blur-cristal-profundo border-cristal-profundo text-coloresDeMarca-principal",
        oscuro: "bg-cristal-oscuro backdrop-blur-cristal-oscuro border-cristal-oscuro text-white",
    };

    return (
        <div
            className={`rounded-extra-redondeado border shadow-profundidad-3d ${mapasDeClase[intensidad]} ${clase || ""}`}
        >
            {children}
        </div>
    );
};
