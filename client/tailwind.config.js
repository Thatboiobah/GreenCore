/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Make sure this covers all your React files
  ],
  darkMode: "class", // Allows you to toggle dark mode if you want
  theme: {
    extend: {
      fontFamily: {
        // This links the Tailwind font classes to the Google Font we imported
        sans: ['Inter', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}