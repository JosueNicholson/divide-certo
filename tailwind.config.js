/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.js', './src/**/*.{js,jsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#163B2B',
        'brand-lime': '#B6F14A',
        'brand-background': '#F7F7F3',
      },
    },
  },
  plugins: [],
};
