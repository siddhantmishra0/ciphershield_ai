/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(222, 47%, 5%)',
        foreground: 'hsl(210, 40%, 98%)',
        card: 'hsl(222, 47%, 8%)',
        muted: 'hsl(222, 47%, 12%)',
        border: 'hsl(222, 47%, 14%)',
        primary: {
          DEFAULT: 'hsl(142, 76%, 36%)',
          foreground: 'white',
        },
        cyber: {
          green: '#00ff80',
          cyan: '#00c8ff',
          purple: '#9333ea',
          dark: '#050d1a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'matrix-fall': 'matrixFall 3s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        matrixFall: {
          '0%': { transform: 'translateY(-100%)', opacity: '1' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0,255,128,0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(0,255,128,0.7)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      backgroundImage: {
        'cyber-grid': `linear-gradient(rgba(0,255,128,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,128,0.03) 1px, transparent 1px)`,
        'hero-gradient': 'radial-gradient(ellipse at 20% 50%, rgba(0,255,128,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(0,200,255,0.12) 0%, transparent 50%)',
      },
      backgroundSize: {
        'grid': '50px 50px',
      }
    },
  },
  plugins: [],
}
