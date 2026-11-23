/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy:  '#101F5C',
        blue:  '#1D3FAE',
        cream: '#F8F1E2',
        paper: '#FFFDF7',
        red:   '#E5392B',
        yel:   '#F7C531',
        pink:  '#F4B9C2',
        sky:   '#BBD3F5',
        ink:   '#1E2747',
        grey:  '#4A5272',
        line:  '#D9D2BF',
      },
      fontFamily: {
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        ui:      ['Jost', 'system-ui', 'sans-serif'],
        body:    ['Figtree', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '6px',
        pill: '999px',
      },
    },
  },
  plugins: [],
}
