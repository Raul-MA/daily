import { defineConfig } from '@playwright/test';

const module = process.env.DAILY_MODULE || 'coffee';
const baseline = process.env.DAILY_BASELINE_URL;

export default defineConfig({
  testDir: module === 'general' ? 'tests/e2e' : `modules/${module}/e2e`,
  testMatch: baseline && ['time-budget', 'reading', 'whatsapp'].includes(module) ? `**/${({ reading: 'reader', whatsapp: 'source' })[module] ?? 'time-budget'}.spec.js` : '**/*.spec.js',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30000,
  expect: { timeout: 5000 },
  reporter: [['list']],
  use: {
    actionTimeout: 5000,
    baseURL: baseline || 'http://127.0.0.1:8766/daily/',
    launchOptions: process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {},
    serviceWorkers: 'block',
  },
  metadata: { module },
  webServer: baseline ? undefined : {
    command: 'npm run build && node scripts/serve.mjs --port 8766',
    url: 'http://127.0.0.1:8766/daily/',
    reuseExistingServer: false,
  },
});
