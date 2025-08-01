/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#1a1a1a',
        primary: '#2a2a2a',
        secondary: '#3a3a3a',
        accent: '#3b82f6',
        text: '#e5e5e5',
      },
    },
  },
  plugins: [],
}

