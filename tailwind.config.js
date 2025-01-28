/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mood: {
          1: '#FF6B6B', // Very Bad (colorblind-friendly red)
          2: '#FF9F43', // Bad (orange)
          3: '#FECA57', // Neutral (yellow)
          4: '#54A0FF', // Good (blue)
          5: '#00D2D3', // Very Good (teal)
        },
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.dir-ltr': {
          direction: 'ltr',
        },
        '.dir-rtl': {
          direction: 'rtl',
        },
      };
      addUtilities(newUtilities);
    },
  ],
};