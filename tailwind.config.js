/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        tnr: ["Times New Roman", "serif"],
      },
      colors: {
        blu: "#0075FF",
        ylw: "#FFF500",
      },
    },
  },
  plugins: [],
};
