/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        card: 'var(--card)',
        text: 'var(--text)',
        primary: 'var(--primary)',
        'primary-glow': 'var(--primary-glow)',
        accent: 'var(--accent)',
        'accent-glow': 'var(--accent-glow)',
      },
    },
  },
  plugins: [],
}
