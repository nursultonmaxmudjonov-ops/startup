import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const root = path.join(process.cwd(), 'public');
const svgFile = path.join(root, 'icon.svg');
const svgBuf = fs.readFileSync(svgFile);

const sizes = [192, 512];
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));

(async () => {
  for (const size of sizes) {
    const out = path.join(root, 'icons', `icon-${size}.png`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await sharp(svgBuf, { density: 300 }).resize(size, size).png().toFile(out);
    console.log('yozildi:', out);
  }
  // screenshots uchun placeholder (masshtablanadigan, quyida mos lashtirilgan)
  for (const [w, h, name] of [[1280, 720, 'screenshot-wide'], [720, 1280, 'screenshot-narrow']]) {
    const out = path.join(root, 'icons', `${name}.png`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await sharp(svgBuf, { density: 300 }).resize(w, h, { fit: 'contain', background: '#050505' }).png().toFile(out);
    console.log('yozildi:', out);
  }
  console.log('manifest icons:', manifest.icons.map((i) => i.src).join(', '));
})();
