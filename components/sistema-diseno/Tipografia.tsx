"use client";

import React from "react";

type Etiqueta = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";

interface PropiedadesTipografia {
    as?: Etiqueta;
    children: React.ReactNode;
    clase?: string;
    [key: string]: any;
}

export const Tipografia = ({
    as: Componente = "p",
    children,
    clase = "",
    ...otrasPropiedades
}: PropiedadesTipografia) => {
    // Lógica de interletrado óptico: Títulos grandes más apretados, cuerpo normal
    const esTituloPrincipal = Componente === "h1";
    const interletrado = esTituloPrincipal ? "tracking-[-0.05em]" : "tracking-normal";

    return (
        <Componente
            className={`${interletrado} ${clase}`}
            {...otrasPropiedades}
        >
            {children}
        </Componente>
    );
};
