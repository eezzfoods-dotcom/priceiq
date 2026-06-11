/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0eaff',
          500: '#4F6EF7',
          600: '#3B55E6',
          700: '#2840D4',
          900: '#1a2a7a',
        },
        surface: '#0F1117',
        card: '#181C27',
        border: '#252A38',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
      }
    },
  },
  plugins: [],
}
