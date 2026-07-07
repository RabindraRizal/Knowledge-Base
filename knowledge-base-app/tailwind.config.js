/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // === GCC 2026 Command Centre Brand Palette ===
        // Source: Command Centre Planning.pptx
        gold: {
          50:  '#FFFBEA',
          100: '#FFF3C4',
          200: '#FEEA72',  // light gold highlight
          300: '#FFD40F',  // bright gold
          400: '#E5B611',  // PRIMARY GOLD — main accent
          500: '#EBCA03',  // warm gold
          600: '#CCA500',  // deep amber
          700: '#A07C00',
          800: '#7A5C00',
          900: '#464001',  // dark olive-gold (dark bg accent)
        },
        forest: {
          50:  '#EDFBF2',
          100: '#D0F4DC',
          200: '#92D050',  // light green
          300: '#70AD47',  // medium green
          400: '#00B050',  // success green
          500: '#274F31',  // dark forest green — secondary brand
          600: '#1E3D26',
          700: '#152C1B',
        },
        // Neutral dark palette for the app shell
        surface: {
          900: '#0A0A0A',  // deepest bg
          800: '#111111',  // base bg
          700: '#1A1A1A',  // card bg
          600: '#222222',  // elevated card
          500: '#2A2A2A',  // border / divider
          400: '#3A3A3A',  // hover border
          300: '#4B4B4A',  // disabled / muted text
          200: '#717171',  // secondary text
          100: '#9CA3AF',  // placeholder
          50:  '#F2F2F2',  // light text on dark
        },
        // Semantic colors
        status: {
          success: '#00B050',
          warning: '#E5B611',
          error:   '#FF0000',
          info:    '#274F31',
        },
      },
      fontFamily: {
        heading: ['Montserrat', 'system-ui', 'sans-serif'],
        body:    ['Poppins', 'system-ui', 'sans-serif'],
        label:   ['Barlow', 'system-ui', 'sans-serif'],
        mono:    ['ui-monospace', 'Consolas', 'monospace'],
      },
      fontSize: {
        'display-xl': ['3.5rem',  { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['2.75rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['2rem',    { lineHeight: '1.2',  letterSpacing: '-0.01em', fontWeight: '600' }],
        'h1': ['1.75rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h2': ['1.375rem', { lineHeight: '1.3',  letterSpacing: '-0.005em', fontWeight: '600' }],
        'h3': ['1.125rem', { lineHeight: '1.4',  fontWeight: '500' }],
        'body-lg': ['1rem',    { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'label':   ['0.75rem',  { lineHeight: '1.4', letterSpacing: '0.05em', fontWeight: '500' }],
        'caption': ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.04em' }],
      },
      borderRadius: {
        'xs':  '4px',
        'sm':  '6px',
        'md':  '8px',
        'lg':  '12px',
        'xl':  '16px',
        '2xl': '20px',
        'pill': '9999px',
      },
      boxShadow: {
        'gold-sm':  '0 0 0 1px rgba(229,182,17,0.25)',
        'gold-md':  '0 0 16px rgba(229,182,17,0.2), 0 2px 8px rgba(0,0,0,0.4)',
        'gold-lg':  '0 0 32px rgba(229,182,17,0.25), 0 4px 20px rgba(0,0,0,0.5)',
        'card':     '0 1px 3px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.3)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.5), 0 0 16px rgba(229,182,17,0.15)',
        'elevated': '0 8px 32px rgba(0,0,0,0.5)',
        'inset-gold': 'inset 0 1px 0 rgba(229,182,17,0.15)',
      },
      backgroundImage: {
        'gold-gradient':    'linear-gradient(135deg, #E5B611 0%, #CCA500 100%)',
        'gold-subtle':      'linear-gradient(135deg, rgba(229,182,17,0.12) 0%, rgba(204,165,0,0.05) 100%)',
        'forest-gradient':  'linear-gradient(135deg, #274F31 0%, #1E3D26 100%)',
        'surface-gradient': 'linear-gradient(180deg, #1A1A1A 0%, #111111 100%)',
        'hero-gradient':    'radial-gradient(ellipse at top, rgba(229,182,17,0.08) 0%, transparent 60%)',
        'card-shine':       'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'slide-in':   'slideInLeft 0.35s ease-out',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'shimmer':    'shimmer 1.8s infinite linear',
      },
      keyframes: {
        fadeIn:      { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:     { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideInLeft: { from: { opacity: '0', transform: 'translateX(-16px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        pulseGold:   { '0%,100%': { boxShadow: '0 0 8px rgba(229,182,17,0.3)' }, '50%': { boxShadow: '0 0 20px rgba(229,182,17,0.6)' } },
        shimmer:     { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
  },
  plugins: [],
}

