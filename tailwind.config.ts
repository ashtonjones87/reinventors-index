import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#334a69",
        teal: "#2A7B7B",
        amber: "#C17D10",
        offwhite: "#F5F3EE",
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-libre)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
