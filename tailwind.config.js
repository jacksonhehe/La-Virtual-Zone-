/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'vz-primary': 'var(--vz-primary)',
        'vz-accent': 'var(--vz-accent)',
        'vz-bg': 'var(--vz-bg-surface)',
        'vz-surface': 'var(--vz-bg-surface)',
        'vz-overlay': 'var(--vz-bg-overlay)',
        'vz-text': 'var(--vz-text-main)',
        'neon-red': 'var(--neon-red)',
        'neon-blue': 'var(--neon-blue)',
        'neon-green': 'var(--neon-green)',
        'neon-yellow': 'var(--neon-yellow)',
        primary: 'var(--primary)',
        'primary-light': 'var(--primary-light)',
        'primary-dark': 'var(--primary-dark)',
        dark: '#1a1a24',
        'dark-light': '#47474f',
        'dark-lighter': '#75757b',
        'text-secondary': '#b5b5b5',
      },
      fontFamily: {
        body: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Rajdhani', 'sans-serif'],
      },
      spacing: {
        's-1': '0.25rem',
        's-2': '0.5rem',
        's-3': '1rem',
        's-4': '1.5rem',
        's-5': '2rem',
        's-6': '3rem',
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
