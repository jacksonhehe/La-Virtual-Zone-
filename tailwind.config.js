/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#00e0ff'
      },
      boxShadow: {
        neon: '0 0 6px rgba(0,224,255,.5)'
      },
      dropShadow: {
        neon: '0 0 6px #00e0ff'
      }
    }
  },
  plugins: []
};
