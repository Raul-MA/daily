import { defineConfig } from '@playwright/test';

const module = process.env.DAILY_MODULE || 'coffee';
const baseline = process.env.DAILY_BASELINE_URL;

export default defineConfig({
  testDir: `modules/${module}/e2e`,
  testMatch: '**/*.spec.js',
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
    command: 'npm run dev -- --port 8766 --strictPort',
    url: 'http://127.0.0.1:8766/daily/',
    reuseExistingServer: false,
  },
});
