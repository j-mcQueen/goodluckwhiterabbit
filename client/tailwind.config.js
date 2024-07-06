/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        tnr: ["Times New Roman", "serif"],
        inter: ["Inter", "sans-serif"],
      },
      dropShadow: {
        cyn: "2px 2px 2px #08FF09",
        blu: "2px 2px 2px #0075FF",
        mag: "2px 2px 2px #FF73FF",
        red: "2px 2px 2px #DC2626",
        grn: "2px 2px 2px #08FF09",
        ylw: "2px 2px 2px #FFF500",
      },
      colors: {
        blu: "#0075FF",
        ylw: "#FFF500",
        gray: "#818181",
        mag: "#FF73FF",
        cyn: "#00FFFF",
        grn: "#08FF09",
      },
    },
  },
  plugins: [],
};
