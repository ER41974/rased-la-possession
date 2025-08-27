// postcss.config.cjs
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}, // <- nouveau plugin Tailwind v4
    autoprefixer: {},           // optionnel mais conseillé
  },
};
