import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Verde smeraldo brand
        primary: {
          50:  '#f0f9f4',
          100: '#dcf0e6',
          200: '#b8e0cd',
          300: '#84c8a8',
          400: '#4aaa7e',
          500: '#0E7A5A',
          600: '#0A5C44',  // brand principale
          700: '#094d3a',
          800: '#083d2e',
          900: '#062e23',
        },
        // Oro caldo
        accent: {
          100: '#fef3d0',
          200: '#fce89e',
          300: '#f9d45a',
          400: '#E8C84A',
          500: '#C49A2A',  // brand accento
          600: '#a07d1e',
          700: '#7d6018',
        },
        // Antracite
        dark: '#1C1C1E',
        'dark-mid': '#3A3A3C',
        mid: '#8A8A8E',
        light: '#D1D1D6',
        'ultra-light': '#F5F5F7',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.10)',
        hero: '0 20px 60px rgba(10,92,68,0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(12px)' },
                   '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}

export default config
