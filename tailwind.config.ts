import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    container: { center: true, padding: { DEFAULT: '1.25rem', md: '2rem', xl: '3rem' } },
    extend: {
      colors: {
        cream: 'rgb(var(--cream) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        rose: 'rgb(var(--rose) / <alpha-value>)',
        gold: 'rgb(var(--gold) / <alpha-value>)',
        beige: 'rgb(var(--beige) / <alpha-value>)',
        taupe: 'rgb(var(--taupe) / <alpha-value>)',
        wine: 'rgb(var(--wine) / <alpha-value>)',
      },
      fontFamily: {
        serif: ['var(--font-serif-latin)', 'var(--font-serif-ka)', 'Georgia', 'serif'],
        sans: ['var(--font-sans-latin)', 'var(--font-sans-ka)', 'system-ui', 'sans-serif'],
        script: ['var(--font-script)', 'cursive'],
      },
      fontSize: {
        display: ['clamp(2.75rem, 8vw, 7.5rem)', { lineHeight: '0.98', letterSpacing: '-0.02em' }],
        h1: ['clamp(2.25rem, 5.5vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.015em' }],
        h2: ['clamp(1.875rem, 4vw, 3.25rem)', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
      },
      letterSpacing: { widest2: '0.3em' },
      transitionTimingFunction: { silk: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
      },
      animation: {
        marquee: 'marquee 38s linear infinite',
        pulseRing: 'pulseRing 2.2s cubic-bezier(0.22,1,0.36,1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
