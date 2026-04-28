/** @type {import('tailwindcss').Config} */
/* =========================================================
   PRONTO.IA · TAILWIND CONFIG · v1.0
   Drop into tailwind.config.js
   Pareia 1:1 com prontoia-tokens.css
   ========================================================= */

module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx,html,vue}',
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx,vue}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      black: '#000000',

      neutral: {
        50:  '#FAFAF7',
        100: '#F0F0EC',
        200: '#E0E0DA',
        300: '#C8C8C0',
        400: '#9E9E94',
        500: '#6E6E64',
        600: '#4A4A40',
        700: '#2E2E26',
        800: '#1A1A14',
        900: '#0A0A0A',
      },

      green: {
        50:  '#E5FBF0',
        100: '#B8F4D6',
        200: '#8AEDBC',
        300: '#5DE6A1',
        400: '#2EDF87',
        500: '#00D97E',
        600: '#00A862',
        700: '#007746',
        800: '#04342C',
        900: '#021A16',
        DEFAULT: '#00D97E',
      },

      night: {
        50:  '#E8EBEF',
        100: '#C5CCD6',
        200: '#A1ADBD',
        300: '#7E8FA4',
        400: '#4D6080',
        500: '#1F3658',
        600: '#142847',
        700: '#0F2038',
        800: '#0B1929',
        900: '#050D17',
        DEFAULT: '#0B1929',
      },

      gold: {
        50:  '#FFF9DB',
        100: '#FFEFB0',
        200: '#FFE685',
        300: '#FFDC5A',
        400: '#FFD32F',
        500: '#FFD60A',
        600: '#CCAB08',
        700: '#998006',
        800: '#665504',
        900: '#412402',
        DEFAULT: '#FFD60A',
      },

      blue: {
        50:  '#EFF6FF',
        100: '#DBEAFE',
        200: '#BFDBFE',
        300: '#93C5FD',
        400: '#60A5FA',
        500: '#3B82F6',
        600: '#2563EB',
        700: '#1D4ED8',
        800: '#1E40AF',
        900: '#1E3A8A',
        DEFAULT: '#3B82F6',
      },

      success: '#00A862',
      warning: '#998006',
      danger:  '#B83232',
      info:    '#1F3658',
    },

    fontFamily: {
      sans:    ['Geist', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      display: ['Geist', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      serif:   ['"Instrument Serif"', 'Times New Roman', 'Georgia', 'serif'],
      mono:    ['"Geist Mono"', '"SF Mono"', 'Menlo', 'Consolas', 'monospace'],
    },

    fontSize: {
      'micro':       ['11px', { lineHeight: '1.4', letterSpacing: '0.08em' }],
      'caption':     ['13px', { lineHeight: '1.5' }],
      'body-s':      ['14px', { lineHeight: '1.55' }],
      'body-m':      ['16px', { lineHeight: '1.6' }],
      'body-l':      ['18px', { lineHeight: '1.55' }],
      'heading-s':   ['18px', { lineHeight: '1.4', fontWeight: '500' }],
      'heading-m':   ['20px', { lineHeight: '1.3', fontWeight: '500' }],
      'heading-l':   ['24px', { lineHeight: '1.2', fontWeight: '500', letterSpacing: '-0.01em' }],
      'display-s':   ['28px', { lineHeight: '1.15', fontWeight: '500', letterSpacing: '-0.015em' }],
      'display-m':   ['36px', { lineHeight: '1.1',  fontWeight: '500', letterSpacing: '-0.02em' }],
      'display-l':   ['48px', { lineHeight: '1.05', fontWeight: '500', letterSpacing: '-0.025em' }],
      'display-xl':  ['64px', { lineHeight: '1.0',  fontWeight: '500', letterSpacing: '-0.035em' }],
      'display-2xl': ['88px', { lineHeight: '0.95', fontWeight: '500', letterSpacing: '-0.04em' }],
    },

    fontWeight: {
      regular:  '400',
      medium:   '500',
      semibold: '600',
    },

    spacing: {
      0:  '0',
      1:  '4px',
      2:  '8px',
      3:  '12px',
      4:  '16px',
      5:  '20px',
      6:  '24px',
      8:  '32px',
      10: '40px',
      12: '48px',
      16: '64px',
      20: '80px',
      24: '96px',
      32: '128px',
    },

    borderRadius: {
      none:  '0',
      xs:    '4px',
      sm:    '8px',
      md:    '12px',
      lg:    '16px',
      xl:    '24px',
      '2xl': '32px',
      full:  '9999px',
    },

    boxShadow: {
      'none': 'none',
      'elev-1': '0 1px 2px rgba(10, 10, 10, 0.04), 0 1px 1px rgba(10, 10, 10, 0.03)',
      'elev-2': '0 4px 12px rgba(10, 10, 10, 0.06), 0 2px 4px rgba(10, 10, 10, 0.04)',
      'elev-3': '0 12px 32px rgba(10, 10, 10, 0.10), 0 4px 8px rgba(10, 10, 10, 0.05)',
    },

    transitionTimingFunction: {
      'out':    'cubic-bezier(0.22, 1, 0.36, 1)',
      'in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
    },

    transitionDuration: {
      fast: '160ms',
      base: '240ms',
      slow: '400ms',
    },

    extend: {
      backgroundImage: {
        'gradient-signature': 'linear-gradient(135deg, #0B1929 0%, #00D97E 100%)',
      },
      maxWidth: {
        container: '1280px',
      },
      animation: {
        'fade-in-up': 'fadeInUp 500ms both cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
