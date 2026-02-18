/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // INSIGHTBALL Brand Colors
        primary: {
          DEFAULT: '#5EEAD4', // Mint/Cyan
          light: '#7FFFD4',
          dark: '#2DD4BF',
        },
        dark: {
          DEFAULT: '#000000',
          lighter: '#0A0A0A',
          card: '#0F0F0F',
          border: '#1F2937',
        },
        accent: {
          red: '#EF4444',
          green: '#10B981',
          mint: '#5EEAD4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(94, 234, 212, 0.3)',
        'glow-lg': '0 0 40px rgba(94, 234, 212, 0.4)',
      },
    },
  },
  plugins: [],
}
