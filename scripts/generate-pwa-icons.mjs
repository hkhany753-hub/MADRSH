import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const source = path.resolve('public/madrsh-icon.svg');
const out = path.resolve('public/icons');
fs.mkdirSync(out, { recursive: true });

for (const size of [192, 512]) {
  await sharp(source).resize(size, size).png().toFile(path.join(out, `icon-${size}.png`));
}
console.log('MADRSH PWA icons generated: 192x192 and 512x512');
