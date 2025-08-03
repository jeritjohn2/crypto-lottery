/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f172a', // bg-gray-900
        primary: '#1e293b', // bg-gray-800
        secondary: '#334155', // bg-gray-700
        accent: '#3b82f6', // bg-blue-500
        text: '#e2e8f0', // text-gray-200
      },
    },
  },
  plugins: [],
}

