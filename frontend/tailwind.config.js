/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mora: {
          dark: '#0f172a',   // Azul oscuro del sidebar
          orange: '#f97316', // Naranja corporativo
          light: '#f3f4f6',  // Fondo gris
        }
      }
    },
  },
  plugins: [],
}