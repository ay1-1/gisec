/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gisec: {
          blue: "#1d3ede",
          cyan: "#01e6f8",
          dark: "#0f172a",
        }
      }
    },
  },
  plugins: [],
};
