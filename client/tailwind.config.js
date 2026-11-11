/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}', './.storybook/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Escala de marca: púrpura → violeta → lila → morado
        brand: {
          50: token('brand-50'), 100: token('brand-100'), 200: token('brand-200'),
          300: token('brand-300'), 400: token('brand-400'), 500: token('brand-500'),
          600: token('brand-600'), 700: token('brand-700'), 800: token('brand-800'),
          900: token('brand-900'), 950: token('brand-950'),
        },
        // Semánticos (cambian con el tema)
        surface: { DEFAULT: token('surface'), muted: token('surface-muted'), raised: token('surface-raised') },
        content: { DEFAULT: token('content'), muted: token('content-muted'), subtle: token('content-subtle'), inverse: token('content-inverse') },
        line: { DEFAULT: token('line'), strong: token('line-strong') },
        accent: { DEFAULT: token('accent'), fg: token('accent-fg') },
        status: {
          pending: token('status-pending'),
          confirmed: token('status-confirmed'),
          completed: token('status-completed'),
          cancelled: token('status-cancelled'),
        },
        chart: { 1: token('chart-1'), 2: token('chart-2'), 3: token('chart-3'), 4: token('chart-4') },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display': ['2rem', { lineHeight: '2.5rem', fontWeight: '700', letterSpacing: '-0.02em' }],
        'title': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'body': ['0.9375rem', { lineHeight: '1.5rem' }],
        'caption': ['0.8125rem', { lineHeight: '1.25rem' }],
        'metric': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '700', letterSpacing: '-0.01em' }],
      },
      spacing: { 'gutter': '1rem', 'section': '1.5rem', 'panel': '24rem' },
      borderRadius: { card: '1rem', control: '0.625rem' },
      boxShadow: {
        card: '0 1px 2px rgb(var(--shadow) / 0.06), 0 4px 16px rgb(var(--shadow) / 0.08)',
        focus: '0 0 0 3px rgb(var(--brand-400) / 0.55)',
      },
    },
  },
  plugins: [],
};
