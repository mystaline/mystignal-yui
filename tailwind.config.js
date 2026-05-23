/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Neon Reborn dark scale (bg → bright ink)
        secondary: {
          50:  '#f2f4f7',  // --ink
          100: '#c8cbd4',
          200: '#a5abb5',  // --ink-2
          300: '#8e95a2',
          400: '#6b7280',  // --ink-3
          500: '#373b45',  // --line-strong
          600: '#23262d',  // --line
          700: '#1d2026',  // --bg-3
          800: '#16181c',  // --bg-2
          900: '#0e0f11',  // --bg
        },
        // Electric lime accent
        primary: {
          50:  '#f8ffd6',
          100: '#edffbf',
          200: '#e2ff97',
          300: '#d4ff6a',
          400: '#c6ff3d',  // --accent (electric lime)
          500: '#9fc82a',
          600: '#75991e',
          700: '#4d6612',
          800: '#2e3d0b',
          900: '#1a2e05',  // --accent-ink dark bg
        },
        // Up / green
        success: {
          50:  '#f0fdf5',
          100: '#dcfce8',
          200: '#b8f9ce',
          300: '#8ff5b3',
          400: '#6cf09e',  // --up
          500: '#3dcc75',
          600: '#1a9e52',
          700: '#0e7038',
          800: '#084e26',
          900: '#052a16',
        },
        // Down / red
        danger: {
          50:  '#fff0f2',
          100: '#ffdbe0',
          200: '#ffb8c2',
          300: '#ff95a4',
          400: '#ff6a7d',  // --down
          500: '#f0374f',
          600: '#c41f37',
          700: '#9a1228',
          800: '#6b0a1c',
          900: '#300008',
        },
        // Amber
        warning: {
          50:  '#fffbef',
          100: '#fff3d4',
          200: '#ffe8b0',
          300: '#ffd989',
          400: '#ffc857',  // --amber
          500: '#e8a020',
          600: '#b87a00',
          700: '#8f5c00',
          800: '#6a4300',
          900: '#2e1a00',
        },
        info: {
          50:  '#f0f9ff',
          100: '#d4effe',
          200: '#a3d8fd',
          300: '#6dbefb',
          400: '#3aa0f8',
          500: '#1a7ecc',
          600: '#0e5fa1',
          700: '#094477',
          800: '#062d52',
          900: '#03182e',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Playfair Display', 'Georgia', 'serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      animation: {
        'fade-in':   'fadeIn 0.3s ease-out forwards',
        'slide-up':  'slideUp 0.35s cubic-bezier(0.22,1,0.36,1) forwards',
        'slide-down':'slideDown 0.3s ease-out forwards',
        'ticker':    'ticker 30s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        ticker: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
