/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f3f7fc", 100: "#e6eef9", 200: "#d3ddeb", 300: "#b8cbea",
          400: "#8fb5f5", 500: "#4777c4", 600: "#0e2f66", 700: "#0e2f66",
          800: "#082653", 900: "#061b3d"
        }
      }
    }
  },
  plugins: []
};
