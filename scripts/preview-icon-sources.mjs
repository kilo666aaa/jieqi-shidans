import fs from 'node:fs/promises';
import sharp from 'sharp';
const sources = JSON.parse((await fs.readFile(process.argv[2], 'utf8')).replace(/^\uFEFF/, ''));
const columns = 8, size = 240, rows = Math.ceil(sources.length / columns);
const layers = [];
for (let i = 0; i < sources.length; i++) {
  const x = i % columns * size, y = Math.floor(i / columns) * size;
  layers.push({ input: await sharp(sources[i].path).resize(194, 194, { fit: 'contain' }).png().toBuffer(), left: x + 23, top: y + 8 });
  layers.push({ input: Buffer.from(`<svg width="240" height="30"><text x="120" y="21" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#304F41">${sources[i].id}</text></svg>`), left: x, top: y + 202 });
}
await sharp({ create: { width: columns * size, height: rows * size, channels: 4, background: '#F8F6F0' } }).composite(layers).png().toFile(process.argv[3]);
console.log({ icons: sources.length, file: process.argv[3] });
