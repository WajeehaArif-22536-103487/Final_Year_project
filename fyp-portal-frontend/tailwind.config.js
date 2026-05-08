/** @type {import('tailwindcss').Config} */
module.exports = {
  
 content: ["./src/**/*.{js,jsx,ts,tsx}"],
darkMode: 'class', // Enables dark mode
  theme: {
    extend: {
      colors: {
        brand: {
          teal: '#4fd1c5',    // The bright teal from your image
          dark: '#0d2b3e',    // The deep navy/slate background
          muted: '#1a3a4a',   // Lighter slate for cards
          accent: '#2c7a7b',  // Darker teal for buttons
        }
      }
    },
  },plugins: [],
}

