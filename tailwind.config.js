/**  @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'primary-light': 'var(--primary-light)',
        'primary-dark': 'var(--primary-dark)',
        'neon-red': 'var(--neon-red)',
        'neon-blue': 'var(--neon-blue)',
        'neon-green': 'var(--neon-green)',
        'neon-yellow': 'var(--neon-yellow)',
        accent: 'var(--accent)',
        dark: '#1a1a24',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Rajdhani', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': "url('https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw2fHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0')",
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      module.exports = {
  content: [/* … */],
  theme: {
    extend: {
      boxShadow: {
        neon: '0 0 6px rgba(0, 224, 255, .45)'
      },
      colors: {
        accent: '#00e0ff',
        'text-secondary': '#b5b5b5'
      }
    }
  },
  plugins: []
},
    },
  },
  safelist: [
    'hover:border-primary',
    'hover:shadow-primary',
    'focus:ring-primary',
    'focus:ring-opacity-50'
  ],
  plugins: [],
};
 