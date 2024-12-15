/** @type {import('tailwindcss').Config} */
import { defineConfig } from 'tailwindcss';
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}