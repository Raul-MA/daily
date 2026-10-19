import { globSync, readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from 'node:fs';
import { dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { iconFiles, prepareIcons, installIcons } from './icons.mjs';

const base = process.env.DAILY_BASE || '/daily/';
if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(base)) throw new Error('Invalid application base.');
const extensions = /\.(?:js|css|json|svg|png|jpg|webp|woff2?|mp3|ogg|wav)$/;
const files = globSync(['apps/daily/src/**/*', 'packages/*/src/**/*', 'modules/*/src/**/*']).filter(path => extensions.test(path)).sort();
const assets = ['index.html', 'diagnostics.html', 'manifest.webmanifest', ...iconFiles, ...files];
rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
for (const file of files) {
  mkdirSync(dirname(`dist/${file}`), { recursive: true });
  cpSync(file, `dist/${file}`);
}
for (const page of ['index.html', 'diagnostics.html']) {
  writeFileSync(`dist/${page}`, readFileSync(`apps/daily/${page}`, 'utf8').replaceAll('%BASE_URL%', base));
}
prepareIcons('dist');
const manifest = { id: base, name: 'Daily', short_name: 'Daily', start_url: `${base}#/`, scope: base, display: 'standalone', background_color: '#f2f2f7', theme_color: '#f2f2f7', icons: installIcons(base) };
writeFileSync('dist/manifest.webmanifest', JSON.stringify(manifest));
const digest = createHash('sha256').update(base);
for (const file of assets) digest.update(readFileSync(`dist/${file}`));
const version = digest.digest('hex').slice(0, 16);
const paths = [base, ...assets.map(path => `${base}${path}`)];
const constants = `self.DAILY_BASE=${JSON.stringify(base)};self.DAILY_ASSETS=${JSON.stringify(paths)};self.DAILY_CACHE="daily-pwa-${version}";\n`;
writeFileSync('dist/sw.js', constants + readFileSync('apps/daily/src/sw.js', 'utf8'));
writeFileSync('dist/asset-list.json', JSON.stringify(assets));
console.log(`Prepared ${assets.length} HTML/CSS/JavaScript/assets at ${base}`);
