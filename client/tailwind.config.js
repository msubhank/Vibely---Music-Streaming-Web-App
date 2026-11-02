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
        primary:  '#7C3AED',
        'primary-hover': '#6D28D9',
        accent:   '#CC147E',
        surface:  '#18181B',
        elevated: '#27272A',
        bg:       '#09090B',
        muted:    '#71717A',
        'muted-fg': '#A1A1AA',
        border:   '#3F3F46',
        success:  '#22C55E',
        warning:  '#F59E0B',
        error:    '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        equalizer: {
          '0%, 100%': { height: '4px' },
          '50%': { height: '16px' },
        },
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'eq-1': 'equalizer 0.8s ease-in-out infinite',
        'eq-2': 'equalizer 0.8s ease-in-out 0.2s infinite',
        'eq-3': 'equalizer 0.8s ease-in-out 0.4s infinite',
      },
    },
  },
  plugins: [],
}
