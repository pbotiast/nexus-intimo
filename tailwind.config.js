/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Escanea todos los archivos de tu proyecto
  ],
  theme: {
    extend: {
        // Aquí puedes extender el tema de Tailwind con tus propios colores, fuentes, etc.
        colors: {
            'nexus-dark': '#0D1117',
            'nexus-primary': '#6366F1',
            'nexus-secondary': '#EC4899',
            'nexus-accent': '#F59E0B',
        },
    },
  },
  plugins: [],
}
