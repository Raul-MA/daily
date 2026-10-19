import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

const background = [242, 242, 247];
const ink = [28, 28, 30];
const blue = [0, 122, 255];
const sizes = [['icon-192.png', 192], ['icon-512.png', 512], ['apple-touch-icon.png', 180]];
export const iconFiles = ['icon.svg', ...sizes.map(([name]) => name)];
const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#f2f2f7"/><circle cx="220" cy="296" r="90" fill="none" stroke="#1c1c1e" stroke-width="60"/><path d="M280 104h64v312h-64z" fill="#1c1c1e"/><circle cx="400" cy="330" r="28" fill="#007aff"/></svg>';

function color(x, y) {
  if ((x - 400) ** 2 + (y - 330) ** 2 <= 28 ** 2) return blue;
  if (x >= 280 && x <= 344 && y >= 104 && y <= 416) return ink;
  const radius = (x - 220) ** 2 + (y - 296) ** 2;
  return radius >= 60 ** 2 && radius <= 120 ** 2 ? ink : background;
}
function pixel(x, y, size) {
  const sum = [0, 0, 0];
  for (let dy = 0; dy < 4; dy++) {
    for (let dx = 0; dx < 4; dx++) {
      const sample = color((x + (dx + 0.5) / 4) * 512 / size, (y + (dy + 0.5) / 4) * 512 / size);
      sample.forEach((value, channel) => { sum[channel] += value; });
    }
  }
  return [...sum.map(value => Math.round(value / 16)), 255];
}
function row(data, y, size) {
  const offset = y * (size * 4 + 1) + 1;
  for (let x = 0; x < size; x++) data.set(pixel(x, y, size), offset + x * 4);
}
function checksum(data) {
  let value = 0xffffffff;
  for (const byte of data) {
    value ^= byte;
    for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ (value & 1 ? 0xedb88320 : 0);
  }
  return (value ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const name = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const check = Buffer.alloc(4);
  check.writeUInt32BE(checksum(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, check]);
}
function png(size) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  const data = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) row(data, y, size);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', deflateSync(data)), chunk('IEND', Buffer.alloc(0))]);
}
export function prepareIcons(directory) {
  writeFileSync(join(directory, 'icon.svg'), svg);
  for (const [name, size] of sizes) writeFileSync(join(directory, name), png(size));
}
export function installIcons(base) {
  const icons = [192, 512].map(size => ({ src: `${base}icon-${size}.png`, sizes: `${size}x${size}`, type: 'image/png', purpose: 'any' }));
  return [...icons, { src: `${base}icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' }, { src: `${base}icon.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'any' }];
}
