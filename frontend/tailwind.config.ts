import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF6B35",
          dark: "#E0531F",
          light: "#FFF0EB",
        },
        darkbg: {
          DEFAULT: "#121212",
          card: "#1E1E1E",
          hover: "#2A2A2A",
        },
        lightbg: {
          DEFAULT: "#FAFAFA",
          card: "#FFFFFF",
          hover: "#F3F3F3",
        }
      },
      boxShadow: {
        premium: "0 10px 30px -10px rgba(255, 107, 53, 0.15)",
        premiumDark: "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
      }
    },
  },
  plugins: [],
};

export default config;
