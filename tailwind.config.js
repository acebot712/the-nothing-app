/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'luxury-gold': '#D4AF37',
        'luxury-platinum': '#E5E4E2',
        'luxury-black': '#0D0D0D',
        'luxury-dark': '#1A1A1A',
        'luxury-gray': '#333333',
      }
    },
  },
  plugins: [],
}

