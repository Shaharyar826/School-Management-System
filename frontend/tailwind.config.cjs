/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      'navbar': '1172px', // Custom breakpoint for navbar
    },
    extend: {
      colors: {
        // School colors based on the AI Based School Tando Jam logo
        school: {
          yellow: {
            light: '#FFE066',
            DEFAULT: '#FFCC00',
            dark: '#E6B800'
          },
          orange: {
            light: '#FFA94D',
            DEFAULT: '#FF8C00',
            dark: '#E67300'
          },
          navy: {
            light: '#4A5568',
            DEFAULT: '#2D3748',
            dark: '#1A202C'
          },
          purple: {
            light: '#805AD5',
            DEFAULT: '#553C9A',
            dark: '#44337A'
          },
          white: '#FFFFFF',
          gray: {
            light: '#F7FAFC',
            DEFAULT: '#E2E8F0',
            dark: '#4A5568'
          }
        },
        // Additional colors for dark mode
        gray: {
          750: '#2d3236'
        }
      },
      gradientColorStops: theme => ({
        ...theme('colors'),
        'school-yellow': '#FFCC00',
        'school-orange': '#FF8C00',
        'school-navy': '#2D3748',
        'school-purple': '#553C9A'
      }),
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'input': '0 2px 4px rgba(0, 0, 0, 0.05)',
        'input-focus': '0 0 0 4px rgba(255, 204, 0, 0.2)'
      }
    },
  },
  plugins: [],
}
