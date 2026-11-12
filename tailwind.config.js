/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blush: {
          50: '#fff5f6',
          100: '#ffe8eb',
          200: '#ffd6dc',
          300: '#ffb3bf',
          400: '#ff7e95',
          500: '#f44369',
          600: '#e1214c',
          700: '#bd133a',
          800: '#9d1334',
          900: '#841530',
        },
        rosewood: {
          50: '#fdf8f7',
          100: '#f9f0ee',
          200: '#f3e1dc',
          300: '#e8c9c1',
          400: '#d7a69b',
          500: '#c58476',
          600: '#b06757',
          700: '#935244',
          800: '#7a453a',
          900: '#673d34',
        },
        peach: {
          50: '#fff9f5',
          100: '#ffefe6',
          200: '#ffdcc9',
          300: '#ffc1a1',
          400: '#ff9b6d',
          500: '#f7733b',
          600: '#e85420',
        },
        sage: {
          50: '#f4f8f5',
          100: '#e6f0e8',
          200: '#cfdfd3',
          300: '#aac5b1',
          400: '#7fa488',
          500: '#5e8668',
        },
        lavender: {
          50: '#faf7fd',
          100: '#f3ecfa',
          200: '#e9dcf5',
          300: '#d7beed',
          400: '#bd96e1',
          500: '#a36fd3',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(244, 67, 105, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 30px -4px rgba(244, 67, 105, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.05)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.03)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-subtle': 'pulseSubtle 3s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85', transform: 'scale(0.99)' },
        }
      }
    },
  },
  plugins: [],
}
