"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { fisicasGlobales } from "@/lib/animaciones";

interface PropiedadesBoton extends HTMLMotionProps<"button"> {
    children: React.ReactNode;
    variante?: "solido" | "fantasma";
}

export const BotonInteractiva = ({
    children,
    variante = "solido",
    className,
    ...otrasPropiedades
}: PropiedadesBoton) => {
    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            transition={fisicasGlobales}
            className={`
        flex items-center justify-center
        min-h-[44px] px-6 py-3
        rounded-pildora font-medium
        ${variante === "solido" ? "bg-white text-black" : "bg-transparent border border-white/20 text-white"}
        ${className || ""}
      `}
            {...otrasPropiedades}
        >
            {children}
        </motion.button>
    );
};
