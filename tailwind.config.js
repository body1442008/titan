
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './context/**/*.{js,ts,jsx,tsx,mdx}', // If you put components with styles here
    './app/**/*.{js,ts,jsx,tsx,mdx}', // If using App Router in the future
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {"50":"#eff6ff","100":"#dbeafe","200":"#bfdbfe","300":"#93c5fd","400":"#60a5fa","500":"#3b82f6","600":"#2563eb","700":"#1d4ed8","800":"#1e40af","900":"#1e3a8a","950":"#172554"},
        secondary: {"50":"#f8fafc","100":"#f1f5f9","200":"#e2e8f0","300":"#cbd5e1","400":"#94a3b8","500":"#64748b","600":"#475569","700":"#334155","800":"#1e293b","900":"#0f172a","950":"#020617"}
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        slideInUp: 'slideInUp 0.5s ease-out forwards',
      },
      patterns: {
        opacities: {
            10: '0.1', 20: '0.2', 30: '0.3', 40: '0.4', 50: '0.5',
            60: '0.6', 70: '0.7', 80: '0.8', 90: '0.9', 100: '1.0',
        },
        sizes: {
            1: '0.25rem', 2: '0.5rem', 3: '0.75rem', 4: '1rem', 6: '1.5rem',
            8: '2rem', 10: '2.5rem', 12: '3rem', 16: '4rem', 20: '5rem',
        }
      }
    }
  },
  plugins: [
    require('tailwindcss-patterns'),
  ],
};
