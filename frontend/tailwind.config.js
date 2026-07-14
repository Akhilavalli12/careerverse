export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // "Registrar's ledger" palette — warm parchment academic tones, not the default
        // AI blue/black/white or the cream+terracotta cliché.
        paper: {
          DEFAULT: '#E8DFC8',
          light: '#F3EDE0',
          dark: '#DCD0B4',
        },
        ink: {
          DEFAULT: '#2A2420',
          soft: '#4A4038',
          faint: '#8A7F71',
        },
        // primary-* scale drives every existing bg-primary-*/text-primary-* class already
        // used throughout the app, so this single change re-themes every button/link/badge.
        primary: {
          50: '#F5EEE3',
          100: '#E9D9C2',
          200: '#D6BB94',
          300: '#BE9A6C',
          400: '#9C7A50',
          500: '#7A5738',
          600: '#6B4B2F',
          700: '#563C26',
          800: '#432E1D',
          900: '#332314',
        },
        moss: {
          50: '#EEF0E7',
          100: '#D9DEC7',
          500: '#5F6B47',
          600: '#4E5A38',
          700: '#3D452B',
        },
        clay: {
          400: '#C17A5C',
          500: '#A85C3F',
          600: '#8E4A31',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'paper-grain': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.16  0 0 0 0 0.14  0 0 0 0 0.12  0 0 0 0.03 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
