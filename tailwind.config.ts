import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        pitch: {
          green: "#2d5a1b",
          light: "#3a7a24",
          line: "#ffffff",
        },
        brand: {
          gold: "#f59e0b",
          orange: "#f97316",
        },
      },
      fontFamily: {
        display: ["system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
