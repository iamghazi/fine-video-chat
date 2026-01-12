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
        'background_light': '#f6f6f8',
        'background_dark': '#111621',
        'sidebar_light': '#ffffff',
        'sidebar_dark': '#0d111a',
        'surface_light': '#ffffff',
        'surface_dark': '#1f2937',
        'success': '#10b981',
        'error': '#ef4444',
      },
      fontFamily: {
        'display': ['Inter', 'sans-serif']
      },
      borderRadius: {
        'DEFAULT': '0.25rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        'full': '9999px'
      }
    }
  },
  plugins: []
}
