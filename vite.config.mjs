import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'apps/daily',
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
