import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Merriweather', 'serif'], // Optional: Add a serif font for the blog body
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [
    typography,
  ],
}
