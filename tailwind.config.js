/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    // This now correctly scans for classes inside the 'src' directory.
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
