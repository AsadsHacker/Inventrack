/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Hanken Grotesk"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        bg: 'var(--bg)',
        'bg-card': 'var(--bg-card)',
        'bg-surface': 'var(--bg-surface)',
        blue: {
          DEFAULT: 'var(--blue)',
          light: 'var(--blue-light)',
          600: '#2563EB',
        },
        red: {
          DEFAULT: 'var(--red)',
          600: '#EF4444',
        },
        green: {
          DEFAULT: 'var(--green)',
          600: '#22C55E',
        },
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        border: 'var(--border)',
      }
    },
  },
  plugins: [],
}
