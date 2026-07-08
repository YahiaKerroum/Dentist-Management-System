/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['InterVariable', 'Inter', 'system-ui', 'sans-serif'],
        // Display face for the wordmark, page titles, and big numerals only —
        // body copy stays on Inter.
        display: ['Space Grotesk Variable', 'InterVariable', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Primary brand accent — a deeper, more confident teal than the old "mint" scale.
        primary: {
          50: '#effcf6',
          100: '#d7f6e8',
          200: '#b0ecd2',
          300: '#7ddab8',
          400: '#48bf99',
          500: '#26a37e',
          600: '#188467',
          700: '#156a55',
          800: '#145446',
          900: '#12453b',
          950: '#062720',
        },
        // Neutral surface scale used for backgrounds, borders, and text instead of raw grays.
        surface: {
          0: '#ffffff',
          50: '#f8fafa',
          100: '#f0f3f2',
          200: '#e2e8e6',
          300: '#cbd5d3',
          400: '#94a3a0',
          500: '#64756f',
          600: '#495650',
          700: '#37423d',
          800: '#242e29',
          900: '#161e1a',
          950: '#0b100d',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      borderRadius: {
        sm: '0.375rem',
        DEFAULT: '0.5rem',
        md: '0.625rem',
        lg: '0.875rem',
        xl: '1.25rem',
        '2xl': '1.75rem',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(15 23 21 / 0.04)',
        sm: '0 1px 3px 0 rgb(15 23 21 / 0.06), 0 1px 2px -1px rgb(15 23 21 / 0.06)',
        DEFAULT: '0 1px 3px 0 rgb(15 23 21 / 0.08), 0 1px 2px -1px rgb(15 23 21 / 0.08)',
        md: '0 4px 8px -2px rgb(15 23 21 / 0.08), 0 2px 4px -2px rgb(15 23 21 / 0.06)',
        lg: '0 12px 24px -6px rgb(15 23 21 / 0.10), 0 4px 8px -4px rgb(15 23 21 / 0.06)',
        xl: '0 24px 48px -12px rgb(15 23 21 / 0.16)',
        focus: '0 0 0 3px rgb(38 163 126 / 0.25)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-in-up': 'fade-in-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scale-in 0.15s ease-out',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
}
