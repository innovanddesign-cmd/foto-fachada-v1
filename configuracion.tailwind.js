/** @type {import('tailwindcss').Config} */
module.exports = {
    theme: {
        extend: {
            colors: {
                coloresDeMarca: {
                    principal: "var(--color-principal)",
                    secundario: "var(--color-secundario)",
                    acento: "var(--color-acento)",
                    superficie: "var(--color-superficie)",
                    fondo: "var(--color-fondo)",
                },
            },
            backgroundImage: {
                'cristal-ligero': 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%)',
                'cristal-profundo': 'linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.2) 100%)',
                'cristal-oscuro': 'linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.6) 100%)',
            },
            backdropBlur: {
                'cristal-ligero': '20px',
                'cristal-profundo': '40px',
                'cristal-oscuro': '30px',
            },
            borderColor: {
                'cristal-ligero': 'rgba(255, 255, 255, 0.2)',
                'cristal-profundo': 'rgba(255, 255, 255, 0.1)',
                'cristal-oscuro': 'rgba(255, 255, 255, 0.05)',
            },
            borderRadius: {
                'extra-redondeado': '32px',
                'esfera': '48px',
                'pildora': '9999px',
            },
            boxShadow: {
                'profundidad-3d': '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 4px 10px -5px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            },
        },
    },
}
