import tailwindcss from 'tailwindcss'

/** @type {import('tailwindcss').Config} */
export default {
  plugins: [
    tailwindcss({
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
      ],
      theme: {
        extend: {
          colors: {
            // Paleta de colores de café CoffeCraft
            'cafe': {
              50: '#fdf8f6',
              100: '#f2e8e5',
              200: '#eaddd7',
              300: '#e0cfc5',
              400: '#d2bab0',
              500: '#bfa094',
              600: '#a08072',
              700: '#8b6f56',
              800: '#6d5a47',
              900: '#4a3f33',
              950: '#2d211a',
            },
            'amber': {
              50: '#fffbeb',
              100: '#fef3c7',
              200: '#fde68a',
              300: '#fcd34d',
              400: '#fbbf24',
              500: '#f59e0b',
              600: '#d97706',
              700: '#b45309',
              800: '#92400e',
              900: '#78350f',
              950: '#451a03',
            }
          },
          fontFamily: {
            'sans': ['Inter', 'system-ui', 'sans-serif'],
            'display': ['Playfair Display', 'serif'],
          },
          animation: {
            'fade-in': 'fadeIn 0.5s ease-in-out',
            'slide-up': 'slideUp 0.3s ease-out',
            'bounce-soft': 'bounceSoft 2s infinite',
          },
          keyframes: {
            fadeIn: {
              '0%': { opacity: '0' },
              '100%': { opacity: '1' },
            },
            slideUp: {
              '0%': { transform: 'translateY(10px)', opacity: '0' },
              '100%': { transform: 'translateY(0)', opacity: '1' },
            },
            bounceSoft: {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-5px)' },
            }
          }
        },
      },
    })
  ],
} 