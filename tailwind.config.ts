import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#1b1b1b',
        surface: '#242424',
        'surface-raised': '#2a2a2a',
        border: 'rgba(255,255,255,0.08)',
        'text-primary': '#c5c1b9',
        'text-secondary': '#8a8680',
        'text-hover': '#dcdad5',
        accent: '#575ECF',
        'accent-hover': '#6b72d9',
        'green-signal': '#4ade80',
        'yellow-signal': '#facc15',
        'red-signal': '#f87171',
      },
      fontFamily: {
        sans: ['CameraPlainVariable', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
