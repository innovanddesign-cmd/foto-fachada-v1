const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const tailwindcss = require("tailwindcss");

const OUT = path.join(__dirname, "..", "public", "design-references");
const INPUT = "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n";

const designs = [
  {
    html: "elite-estates.html",
    css: "elite-estates.css",
    theme: {
      colors: {
        primary: "#0f49bd",
        "accent-gold": "#d4af37",
        "background-light": "#f6f6f8",
        "background-dark": "#050a1a",
      },
      fontFamily: {
        display: ["Newsreader", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: { DEFAULT: "0.25rem", lg: "0.5rem", xl: "0.75rem", full: "9999px" },
    },
  },
  {
    html: "familyfirst.html",
    css: "familyfirst.css",
    theme: {
      colors: {
        primary: "#ee7c2b",
        "background-light": "#fcfaf8",
        "background-dark": "#221810",
      },
      fontFamily: { display: ["Plus Jakarta Sans", "sans-serif"] },
      borderRadius: { DEFAULT: "1rem", lg: "1.5rem", xl: "2rem", full: "9999px" },
    },
  },
  {
    html: "aura-luxe.html",
    css: "aura-luxe.css",
    theme: {
      colors: {
        primary: "#e43f58",
        "background-light": "#f8f6f6",
        "background-dark": "#1a0d0f",
      },
      fontFamily: { display: ["Newsreader", "serif"] },
      borderRadius: { DEFAULT: "0.25rem", lg: "0.5rem", xl: "0.75rem", full: "9999px" },
    },
  },
  {
    html: "purezen.html",
    css: "purezen.css",
    theme: {
      colors: {
        primary: "#39c91d",
        "background-light": "#f6f8f6",
        "background-dark": "#142111",
        sage: "#8da38a",
        "warm-wood": "#d9c5b2",
      },
      fontFamily: { display: ["Manrope"] },
      borderRadius: { DEFAULT: "0.5rem", lg: "1rem", xl: "1.5rem", full: "9999px" },
    },
  },
];

(async () => {
  for (const design of designs) {
    const htmlPath = path.join(OUT, design.html);
    if (!fs.existsSync(htmlPath)) {
      console.error("[design-css] missing " + design.html);
      process.exitCode = 1;
      continue;
    }
    const result = await postcss([
      tailwindcss({
        content: [htmlPath],
        darkMode: "class",
        theme: { extend: design.theme },
        plugins: [],
      }),
    ]).process(INPUT, { from: undefined, to: path.join(OUT, design.css) });
    fs.writeFileSync(path.join(OUT, design.css), result.css);
    console.log("[design-css] " + design.html + " -> " + design.css + " (" + result.css.length + " bytes)");
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
