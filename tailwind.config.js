/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      black: "#000000",
      white: "#FFFFFF",
      tangerine: "#E99D86",
      rufous: "#A42208",
      smoke: "#F6F6F3",
      alabaster: "#E4E4DD",
      onyx: "#313638",
    },
    fontFamily: {
      times: ["Times New Roman", "serif"],
    },
    extend: {
      backgroundImage: {
        life: "url('/src/assets/media/LIFE.webp')",
        still: "url('/src/assets/media/STILL.webp')",
      },
    },
  },
  plugins: [],
};
