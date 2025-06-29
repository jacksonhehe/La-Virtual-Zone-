/** @type {import('tailwindcss').Config} */
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
          'bg-surface': 'var(--bg-surface)',
          'bg-overlay': 'var(--bg-overlay)',
          dark: '#1a1a24',
          'dark-light': '#47474f',
          'dark-lighter': '#75757b',
          'text-secondary': '#b5b5b5'
        },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Rajdhani', 'sans-serif']
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': "url('https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=1600&auto=format&fit=crop&fm=webp&ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw2fHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0')"
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      boxShadow: {
        neon: '0 0 6px rgba(0, 224, 255, .45)'
      }
    }
  },
  safelist: [
    'hover:border-primary',
    'hover:shadow-primary',
    'focus:ring-primary',
    'focus:ring-opacity-50'
  ],
  plugins: []
};
