/* src/index.css */
@import "tailwindcss";

/* Indique à Tailwind où scanner les classes (équivalent v4 de `content`) */
@source "./index.html";
@source "./src/**/*.{js,ts,jsx,tsx}";

/* Tes réglages globaux */
:root { --accent: #000091; }
html, body, #root { height: 100%; }
body { background: #fff; }

/* Optionnel : rendu plus net */
@layer base {
  body { 
    @apply antialiased text-slate-800;
  }
}
