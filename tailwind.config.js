/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2F2F33',
        secondary: '#454545',
        tableAdmin: '#373737',
        secondaryTableAdmin: '#D7D7D7',
      },
    },
  },
  plugins: [],
};
