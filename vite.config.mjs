import { pwaBuild } from './scripts/pwa-build.mjs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'apps/daily',
  plugins: [pwaBuild()],
  base: process.env.DAILY_BASE || '/daily/',
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./apps/daily/index.html', import.meta.url)),
        diagnostics: fileURLToPath(new URL('./apps/daily/diagnostics.html', import.meta.url)),
      },
    },
  },
});
