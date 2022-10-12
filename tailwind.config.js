/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist:[
    {
      pattern: /w/,
      variants: ['after']
    },
    {
      pattern: /h/,
      variants: ['after']
    },
  ],
  theme: {
    extend: {},
    colors: {
      bg: '#DADADA',
      main: '#fef9f4',
      primary:'#F14F1D',
      accent_light: '#2C5DEE',
      accent: '#2843E1',
      accent_dark: '#0834AB',
      text: '#1d2528',
      'text-disabled': '#616566',
      danger: '#FF3030',
      'danger-light': '#FFA8A8',
      success: '#22C633',
    }
  },
  plugins: [],
}
