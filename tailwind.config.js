/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#0a0a0a',
        'secondary': '#151515',
        'text-primary': '#ffffff',
        'text-secondary': '#b3b3b3',
        'text-tertiary': '#8a8a8a',
        'text-muted': '#666666',
        'accent-primary': '#6366f1',
        'accent-secondary': '#8b5cf6',
        'accent-hover': '#4f46e5',
        'success': '#10b981',
        'warning': '#f59e0b',
        'error': '#ef4444',
        'info': '#3b82f6',
      },
    },
  },
  plugins: [],
}
