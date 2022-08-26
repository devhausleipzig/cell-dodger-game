/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: ["./src/**/*.{html,js,ts,css}"],
  theme: {
    extend: {
      fontFamily: {
        space: ["Space Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
