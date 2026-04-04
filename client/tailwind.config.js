export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors:{
        "primary": "#e4ff00",
        "primary-dark": "#1a3a2a",
        "primary-light": "#2d5a3d",
        "bg-app": "#0f1f18",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}