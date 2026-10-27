/** @type {import('tailwindcss').Config} */

// Every colour is a CSS variable (see src/index.css) so the accessibility
// settings can swap themes (dark / light / high contrast) and colour-vision
// palettes at runtime without touching any component.
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // DESIGN.md §2 — brand
        brand: { primary: v('brand-primary'), accent: v('brand-accent') },
        surface: {
          page: v('surface-page'),
          card: v('surface-card'),
          raised: v('surface-raised'),
          line: v('surface-line'),
        },
        ink: { primary: v('ink-primary'), muted: v('ink-muted') },
        // DESIGN.md §2 — task type (M6)
        feature: v('feature'),
        bug: v('bug'),
        // DESIGN.md §2 — due states (M8)
        due: {
          safe: v('due-safe'),
          soon: v('due-soon'),
          warning: v('due-warning'),
          overdue: v('due-overdue'),
          neutral: v('due-neutral'),
        },
        // M7 — avatar colours
        person: { taygun: v('person-taygun'), claude: v('person-claude'), gemini: v('person-gemini') },
      },
      keyframes: {
        fadein: { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'none' } },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-sans)'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
