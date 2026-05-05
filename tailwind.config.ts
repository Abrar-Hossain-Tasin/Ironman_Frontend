import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        bangla: ['Hind Siliguri', 'Noto Sans Bengali', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        ironman: {
          navy: '#1B2454',
          'navy-50': '#eef0f8',
          'navy-100': '#d1d6ec',
          red: '#D81B2A',
          'red-50': '#fbeaea',
          'red-100': '#f5c3c3'
        }
      },
      boxShadow: {
        soft: '0 18px 45px rgba(27, 36, 84, 0.10)'
      }
    }
  },
  plugins: []
}

export default config
