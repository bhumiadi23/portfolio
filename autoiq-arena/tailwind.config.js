/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A0F1E',
          50:  '#f0f4ff',
          100: '#dce6ff',
          200: '#b8ccff',
          300: '#7da5ff',
          400: '#3d78ff',
          500: '#0A0F1E',
          600: '#08132a',
          700: '#060d1e',
          800: '#040a16',
          900: '#02060e',
        },
        secondary: '#0D1B2A',
        surface: '#111827',
        surfaceLight: '#1a2744',
        accent: {
          DEFAULT: '#00D4FF',
          glow: 'rgba(0,212,255,0.25)',
          dark: '#0099bb',
        },
        warm: {
          DEFAULT: '#FF6B35',
          glow: 'rgba(255,107,53,0.25)',
        },
        success: '#00E676',
        warning: '#FFB300',
        danger: '#FF3B3B',
        border: '#1E3A5F',
        borderLight: '#2a4a7f',
        text: {
          primary: '#F0F4FF',
          secondary: '#B8CCF0',
          muted: '#8B9EC7',
          dim: '#4a5f8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'Courier New', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-2xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-xl':  ['3.75rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-lg':  ['3rem',    { lineHeight: '1.2',  letterSpacing: '-0.01em' }],
        'display-md':  ['2.25rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'display-sm':  ['1.875rem',{ lineHeight: '1.3'                            }],
        'display-xs':  ['1.5rem',  { lineHeight: '1.35'                           }],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-mesh': 'radial-gradient(ellipse at 20% 50%, rgba(0,212,255,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(255,107,53,0.05) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(0,150,255,0.05) 0%, transparent 50%)',
        'card-glass': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        'accent-gradient': 'linear-gradient(135deg, #00D4FF 0%, #0066FF 100%)',
        'warm-gradient': 'linear-gradient(135deg, #FF6B35 0%, #FF3B3B 100%)',
      },
      boxShadow: {
        'glow-accent': '0 0 20px rgba(0,212,255,0.3), 0 0 60px rgba(0,212,255,0.1)',
        'glow-warm': '0 0 20px rgba(255,107,53,0.3), 0 0 60px rgba(255,107,53,0.1)',
        'glow-sm': '0 0 10px rgba(0,212,255,0.2)',
        'card': '0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.5), 0 0 20px rgba(0,212,255,0.15)',
        'nav': '0 1px 0 rgba(30,58,95,0.8), 0 4px 24px rgba(0,0,0,0.5)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in': 'slideIn 0.4s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0,212,255,0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(0,212,255,0.5), 0 0 60px rgba(0,212,255,0.2)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
