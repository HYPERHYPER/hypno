/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      nbAkademieStd: "NB Akademie Std, sans-serif",
      sans: ["NB Akademie Std","Helvetica Neue","Arial","ui-sans-serif"]
    },
    extend: {
      colors: {
        grey: '#808080',
      }
    },
  },
  plugins: [require("daisyui")],
}
