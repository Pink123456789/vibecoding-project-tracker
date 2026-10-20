/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // DESIGN.md §2 — brand
        brand: { primary: '#8B7CFF', accent: '#22D3EE' },
        surface: { page: '#0E1015', card: '#181B23', raised: '#21252F', line: '#2A2F3A' },
        ink: { primary: '#E8EAF0', muted: '#9AA3B5' },
        // DESIGN.md §2 — task type (M6)
        feature: '#34D399',
        bug: '#FB7185',
        // DESIGN.md §2 — due states (M8)
        due: {
          safe: '#5EEAD4',
          soon: '#FCD34D',
          warning: '#FB923C',
          overdue: '#F43F5E',
          neutral: '#64748B',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
