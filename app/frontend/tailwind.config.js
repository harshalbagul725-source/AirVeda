/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0B132B',
          800: '#1C2541',
          700: '#283457',
          600: '#3A506B',
          500: '#4F6D7A',
          100: '#E2E8F0',
          50: '#F8FAFC',
        },
        aqi: {
          good: '#059669', // CPCB 0-50
          satisfactory: '#65A30D', // CPCB 51-100
          moderate: '#D97706', // CPCB 101-200
          poor: '#EA580C', // CPCB 201-300
          verypoor: '#DC2626', // CPCB 301-400
          severe: '#7F1D1D', // CPCB 401-500
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

