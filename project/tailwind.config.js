/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        teal: {
          50: '#f0fbfa',
          100: '#d6f3f0',
          200: '#b0e7e2',
          300: '#7cd5cd',
          400: '#46b8af',
          500: '#2a9d94',
          600: '#1f8079',
          700: '#1c6761',
          800: '#1a534e',
          900: '#174541',
        },
        sky: {
          50: '#f0f7fb',
          100: '#dceef7',
          200: '#bbdded',
          300: '#8cc5dd',
          400: '#56a6c8',
          500: '#378aae',
          600: '#2b7091',
          700: '#275b76',
          800: '#264d63',
          900: '#234154',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 60, 60, 0.04), 0 8px 24px rgba(15, 60, 60, 0.06)',
        cardHover: '0 2px 6px rgba(15, 60, 60, 0.06), 0 14px 36px rgba(15, 60, 60, 0.1)',
        soft: '0 1px 2px rgba(15, 60, 60, 0.05), 0 4px 12px rgba(15, 60, 60, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out both',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1) both',
        'pop': 'pop 0.18s ease-out both',
        'ring': 'ring 1.1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        pop: { from: { transform: 'scale(0.9)' }, to: { transform: 'scale(1)' } },
        ring: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '20%': { transform: 'rotate(14deg)' },
          '40%': { transform: 'rotate(-12deg)' },
          '60%': { transform: 'rotate(8deg)' },
          '80%': { transform: 'rotate(-6deg)' },
        },
      },
    },
  },
  plugins: [],
};
