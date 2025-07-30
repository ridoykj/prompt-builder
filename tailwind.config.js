const fs = require('fs');
const path = require('path');

const safelist = fs.readFileSync(path.resolve(__dirname, 'src/main/webapp/safelist.txt'), 'utf8')
  .split(',')
  .map(s => s.trim())
  .filter(s => s.length > 0);

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/main/webapp/**/*.{js,ts,jsx,tsx,html}',
  ],
  safelist: safelist,
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
