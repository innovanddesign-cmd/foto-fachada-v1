import type { Config } from "tailwindcss";
import configuracionMaestra from "./configuracion.tailwind.js";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    presets: [configuracionMaestra],
    theme: {
        extend: {},
    },
    plugins: [],
};

export default config;
