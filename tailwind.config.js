/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        verde:    '#5C7A00',
        vermelho: '#C0392B',
        ambar:    '#D4A017',
        preto:    '#111111',
        offwhite: '#F7F7F5',
        borda:    '#EBEBEB',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
