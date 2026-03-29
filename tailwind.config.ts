import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f9f5",
          100: "#deecdf",
          200: "#bddac0",
          300: "#93c19a",
          400: "#6ba075",
          500: "#4f865b",
          600: "#3f6b48",
          700: "#34553b",
          800: "#2e4532",
          900: "#273a2b"
        },
        accent: {
          50: "#eefaf9",
          100: "#d4f2ef",
          200: "#ace4de",
          300: "#7ed0c8",
          400: "#53b5ad",
          500: "#3a9b95",
          600: "#307d79",
          700: "#2c6562",
          800: "#2a5150",
          900: "#254443"
        }
      },
      boxShadow: {
        card: "0 10px 30px rgba(22, 50, 34, 0.08)"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem"
      }
    }
  },
  plugins: []
};

export default config;

