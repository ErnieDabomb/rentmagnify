/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        floaty: {
          '0%':   { transform: 'translate3d(0,0,0) scale(1)' },
          '50%':  { transform: 'translate3d(2vmax,-2vmax,0) scale(1.06)' },
          '100%': { transform: 'translate3d(0,0,0) scale(1)' },
        },
      },
      animation: {
        floaty: 'floaty 24s ease-in-out infinite',
        'floaty-med': 'floaty 28s ease-in-out infinite',
        'floaty-slow': 'floaty 32s ease-in-out infinite',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(2, 6, 23, 0.08)',
      },
    },
  },
  plugins: [],
}
