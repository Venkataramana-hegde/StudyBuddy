import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bgDarkViolet: "oklch(0.208 0.042 265.755)",
      },
    },
  },
  plugins: [],
};

export default config;
