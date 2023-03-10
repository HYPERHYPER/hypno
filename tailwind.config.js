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
      },
      animation: {
        'jpeg-strip': 'jpeg-strip 800ms steps(1, end) infinite',
      },
      keyframes: {
        'jpeg-strip': {
          '0%': { backgroundPosition: '0 0' },
          '14.2857142857%': { backgroundPosition: '0 25%' },
          '28.5714285714%': { backgroundPosition: '0 50%' },
          '42.8571428571%': { backgroundPosition: '0 75%' },
          '57.1428571429%': { backgroundPosition: '0 100%' },
          '71.4285714286%': { backgroundPosition: '0 75%' },
          '85.7142857143%': { backgroundPosition: '0 50%' },
          '100%': { backgroundPosition: '0 25%' },
        }
      }
    },
  },
  plugins: [require("daisyui")],
}
