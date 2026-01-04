/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': '#2463eb',
        'primary-hover': '#1d4ed8',
        'secondary': '#7c3aed',
        'secondary-hover': '#6d28d9',
        'background-light': '#f3f4f6',
        'background-dark': '#111621',
        'surface-light': '#ffffff',
        'surface-dark': '#1f2937',
        'success': '#10b981',
        'error': '#ef4444',
      },
      fontFamily: {
        'display': ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
}
