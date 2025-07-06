/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',  // <-- add pages folder here
    './components/**/*.{js,ts,jsx,tsx}', // if you have components folder
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
