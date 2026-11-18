// tailwind.config.ts
// Design System — Event Ticketing (Dominant Light Blue)
// Based on Inter font + Glassmorphism + Gradient style
// Copy file ini ke apps/frontend/tailwind.config.ts

import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // ============================================================
      // FONTS
      // ============================================================
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      // ============================================================
      // COLOR PALETTE — DOMINANT LIGHT BLUE
      // ============================================================
      colors: {
        // Primary Blue (main brand)
        blue: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB', // <-- Primary CTA
          700: '#1D4ED8',
          900: '#1E3A8A',
        },
        // Sky Blue (accent, secondary)
        sky: {
          100: '#E0F2FE',
          200: '#BAE6FD',
          400: '#38BDF8',
          500: '#0EA5E9', // <-- Accent
        },
        // Neutral (text, backgrounds)
        slate: {
          50:  '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A', // <-- Dark text
        },
        // Status Colors
        success: '#10B981',
        warning: '#F59E0B',
        error:   '#EF4444',
      },

      // ============================================================
      // BACKGROUND GRADIENTS
      // ============================================================
      backgroundImage: {
        // Page background — soft blue gradient
        'page-gradient':   'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 40%, #BAE6FD 70%, #E0F2FE 100%)',
        // Hero section gradient
        'hero-gradient':   'linear-gradient(135deg, #DBEAFE 0%, #BAE6FD 50%, #E0F2FE 100%)',
        // Primary button gradient
        'btn-gradient':    'linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%)',
        // Accent/secondary gradient
        'accent-gradient': 'linear-gradient(135deg, #60A5FA 0%, #38BDF8 100%)',
        // Glass card gradient
        'glass-gradient':  'linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(219,234,254,0.5) 100%)',
        // Text gradient (clip)
        'text-gradient':   'linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%)',
      },

      // ============================================================
      // BORDER RADIUS
      // ============================================================
      borderRadius: {
        'sm':   '8px',
        'md':   '12px',
        'lg':   '16px',
        'xl':   '20px',
        '2xl':  '24px',
        '3xl':  '28px',
        'full': '9999px',
      },

      // ============================================================
      // BOX SHADOWS
      // ============================================================
      boxShadow: {
        'sm':   '0 1px 3px rgba(37,99,235,0.08), 0 1px 2px rgba(37,99,235,0.04)',
        'md':   '0 4px 16px rgba(37,99,235,0.12), 0 2px 6px rgba(37,99,235,0.06)',
        'lg':   '0 20px 48px rgba(37,99,235,0.15), 0 8px 20px rgba(37,99,235,0.08)',
        'glow': '0 0 24px rgba(59,130,246,0.3)',
        'card': '0 1px 4px rgba(15,23,42,0.06), 0 4px 16px rgba(37,99,235,0.08)',
      },

      // ============================================================
      // SPACING (extends defaults, no overrides)
      // ============================================================
      spacing: {
        '18': '72px',
        '22': '88px',
        '26': '104px',
      },

      // ============================================================
      // TYPOGRAPHY SCALE
      // ============================================================
      fontSize: {
        'display': ['48px', { lineHeight: '1.1', letterSpacing: '-1.5px', fontWeight: '800' }],
        'h1':      ['36px', { lineHeight: '1.15', letterSpacing: '-1px', fontWeight: '800' }],
        'h2':      ['28px', { lineHeight: '1.25', letterSpacing: '-0.5px', fontWeight: '700' }],
        'h3':      ['22px', { lineHeight: '1.3', letterSpacing: '-0.3px', fontWeight: '700' }],
        'h4':      ['18px', { lineHeight: '1.35', fontWeight: '600' }],
        'body':    ['15px', { lineHeight: '1.65', fontWeight: '400' }],
        'small':   ['13px', { lineHeight: '1.5', fontWeight: '400' }],
        'xs':      ['11px', { lineHeight: '1.4', fontWeight: '400' }],
      },

      // ============================================================
      // ANIMATIONS
      // ============================================================
      keyframes: {
        'scan-line': {
          '0%':   { top: '0%' },
          '50%':  { top: 'calc(100% - 3px)' },
          '100%': { top: '0%' },
        },
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-blue': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(59,130,246,0.4)' },
          '50%':      { boxShadow: '0 0 0 12px rgba(59,130,246,0)' },
        },
        'countdown': {
          '0%':   { width: '100%' },
          '100%': { width: '0%' },
        },
      },
      animation: {
        'scan-line':   'scan-line 2s ease-in-out infinite',
        'fade-in':     'fade-in 0.3s ease-out',
        'slide-up':    'slide-up 0.4s ease-out',
        'pulse-blue':  'pulse-blue 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'countdown':   'countdown 10s linear forwards',
      },
    },
  },
  plugins: [],
}

export default config
