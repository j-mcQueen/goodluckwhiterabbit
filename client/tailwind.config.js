/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        tnrI: ["Times New Roman Italic", "serif"],
        tnrBI: ["Times New Roman Bold Italic", "serif"],
        vt: ["VT323", "sans-serif"],
      },
      gridTemplateColumns: {
        imageQueue: "repeat(auto-fit, minmax(100px, 200px))",
        full: "repeat(auto-fit, minmax(100dvh, 100dvw)",
      },
      dropShadow: {
        cyn: "2px 2px 2px #08FF09",
        blu: "2px 2px 2px #0075FF",
        mag: "2px 2px 2px #FF73FF",
        red: "2px 2px 2px #DC2626",
        grn: "2px 2px 2px #08FF09",
        ylw: "2px 2px 2px #FFF500",
        glo: "0px 0px 2px #FFF",
      },
      colors: {
        ylw: "#FFF500",
        gray: "#818181",
        rd: "#DC2626",
      },
      backgroundColor: {
        red: "#DC2626",
      },
      borderColor: {
        red: "#DC2626",
      },
      width: {
        outer: "calc(100dvw - 1.5rem - 2px)",
      },
      height: {
        outer: "calc(100dvh - 1.5rem - 2px)",
      },
      keyframes: {
        blink: {
          "0%": { opacity: 1 },
        },
        typing: {
          from: { width: 0 },
          to: { width: "100%" },
        },
      },
      animation: {
        blink: "blink 1.5s steps(2) infinite",
        typing: "typing 2s steps(80, end)",
      },
    },
  },
  plugins: [],
};
