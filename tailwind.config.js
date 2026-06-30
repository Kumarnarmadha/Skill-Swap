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
        // Dark theme colors mapped to Tailwind keys
        darkBg: '#1C1917',
        darkCard: '#292524',
        primary: {
          light: '#D97706',
          dark: '#F59E0B',
          DEFAULT: '#F59E0B'
        },
        accent: {
          light: '#E11D48',
          dark: '#F43F5E',
          DEFAULT: '#F43F5E'
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        
        // Light theme colors
        lightBg: '#FAFAF9',
        lightCard: '#F5F5F4'
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'premium-dark': '0 4px 30px rgba(0, 0, 0, 0.4)',
        'premium-light': '0 4px 30px rgba(245, 158, 11, 0.05)',
        'glow-purple': '0 0 20px rgba(244, 63, 94, 0.15)',
        'glow-indigo': '0 0 20px rgba(245, 158, 11, 0.15)'
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { 'background-position': 'left center' },
          '50%': { 'background-position': 'right center' }
        }
      }
    },
  },
  plugins: [],
}
