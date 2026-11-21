/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        apple: {
          bg: '#000000',
          oled: '#09090b',
          surface: '#121214',
          card: 'rgba(255, 255, 255, 0.03)',
          cardHover: 'rgba(255, 255, 255, 0.06)',
          border: 'rgba(255, 255, 255, 0.10)',
          borderHover: 'rgba(255, 255, 255, 0.20)',
          blue: '#007AFF',
          blueHover: '#0062cc',
          blueLight: '#58A6FF',
          blueMuted: 'rgba(0, 122, 255, 0.15)',
          text: '#F5F5F7',
          secondary: '#86868B',
          muted: '#636366',
          emerald: '#30D158',
          emeraldMuted: 'rgba(48, 209, 88, 0.15)',
          red: '#FF453A',
          amber: '#FF9F0A',
          purple: '#BF5AF2',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'apple-glow': '0 0 35px -5px rgba(0, 122, 255, 0.4)',
        'apple-glow-emerald': '0 0 30px -5px rgba(48, 209, 88, 0.4)',
        'apple-glass': '0 20px 50px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.10)',
        'apple-card': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        'apple-subtle': '0 2px 10px rgba(0, 0, 0, 0.3)',
      },
      backdropBlur: {
        'xs': '2px',
        'xl': '20px',
        '2xl': '40px',
        '3xl': '64px',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
