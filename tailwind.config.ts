import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#005EB8",
          hover: "#004B93",
          light: "#E5F0FC",
        },
        secondary: {
          DEFAULT: "#00A3AD",
          hover: "#00828A",
          light: "#E6F6F7",
        },
        tertiary: {
          DEFAULT: "#F0F4F8",
          hover: "#E1E8F0",
        },
        neutralBrand: {
          DEFAULT: "#4A5568",
          hover: "#3C4554",
          light: "#EDF2F7",
        }
      },
    },
  },
  plugins: [],
};
export default config;
