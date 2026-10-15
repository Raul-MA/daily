import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#f2f2f7"/><text x="76" y="340" font-size="340" font-weight="700" font-family="sans-serif" fill="#1c1c1e">d</text><circle cx="400" cy="330" r="28" fill="#007aff"/></svg>';

export function pwaBuild() {
  let base;
  return {
    name: 'daily-offline-assets',
    configResolved(config) { base = config.base; },
    generateBundle(...args) {
      const bundle = args[1];
      const manifest = { id: base, name: 'Daily', short_name: 'Daily', start_url: `${base}#/`, scope: base, display: 'standalone', background_color: '#f2f2f7', theme_color: '#f2f2f7', icons: [{ src: `${base}icon.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }] };
      this.emitFile({ type: 'asset', fileName: 'manifest.webmanifest', source: JSON.stringify(manifest) });
      this.emitFile({ type: 'asset', fileName: 'icon.svg', source: icon });
      const paths = [base, `${base}index.html`, `${base}diagnostics.html`, ...Object.keys(bundle).map(path => `${base}${path}`), `${base}manifest.webmanifest`, `${base}icon.svg`];
      const source = readFileSync(new URL('../apps/daily/src/sw.js', import.meta.url), 'utf8');
      const hash = createHash('sha256').update(JSON.stringify(bundle)).update(icon).update(base).update(source).digest('hex').slice(0, 16);
      const constants = `self.DAILY_BASE=${JSON.stringify(base)};self.DAILY_ASSETS=${JSON.stringify([...new Set(paths)])};self.DAILY_CACHE="daily-pwa-${hash}";\n`;
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: constants + source });
    },
  };
}
