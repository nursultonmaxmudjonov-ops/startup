const fs = require('fs');
const path = require('path');

// Bunga ochiq, minimal PNG yozish uchun oddiy sharp o'rniga — sharp o'rniga node-canvas ishlatiladi
// Lekin eng oddiy: canvas yo'q bo'lsa, "V" harfini rasmga chizish qiyin.
// Shu sababli biz shunchaki SVG yozib, uni PNG'ga aylantirish uchun
// eng sodda yo'l: canvas yo'qligida SVG'ni qoldiramiz.
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="bg" cx="30%" cy="20%" r="90%">
      <stop offset="0%" stop-color="#2a2a2a"/>
      <stop offset="100%" stop-color="#050505"/>
    </radialGradient>
    <linearGradient id="v" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e8e8e8"/>
      <stop offset="100%" stop-color="#9a9a9a"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <path d="M120 130 L256 400 L392 130" stroke="url(#v)" stroke-width="46" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="256" cy="120" r="14" fill="#f5f5f5"/>
</svg>`;

const dir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'icon.svg'), svg);
console.log('icon.svg yozildi:', path.join(dir, 'icon.svg'));
