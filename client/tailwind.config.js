/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EAF5ED',
          100: '#DDF2E3',
          200: '#BDE3CA',
          500: '#087A35',
          600: '#087A35',
          700: '#075C2B',
          800: '#064923',
          900: '#043419',
        },
        lab: {
          green: '#087A35',
          darkgreen: '#075C2B',
          lightgreen: '#EAF5ED',
          softgreen: '#DDF2E3',
          bg: '#FFFFFF',
          bgsubtle: '#F7F9F7',
          text: '#172033',
          muted: '#647067',
          border: '#E5EBE6',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
