import { defineConfig } from 'vite';

export default defineConfig({
  root: 'apps/daily',
  base: process.env.DAILY_BASE || '/daily/',
  build: { outDir: '../../dist', emptyOutDir: true },
});
