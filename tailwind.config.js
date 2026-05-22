/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        verde: '#97A624',
        vermelho: '#8C1414',
        ambar: '#D9B504',
        preto: '#0D0D0D',
        offwhite: '#FAFAF8',
        borda: '#E8E8E2',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
