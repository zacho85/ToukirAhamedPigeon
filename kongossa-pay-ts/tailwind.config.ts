import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', // all JS/TS/React files
  ],
  theme: {
    extend: {
      colors: {
        // You can define your custom color palette here
        primary: '#0f172a', // example: dark-blue for theme
        secondary: '#1e293b',
        accent: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
  darkMode: 'class', // enables class-based dark mode
}

export default config
