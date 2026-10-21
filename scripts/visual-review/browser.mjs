import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

export async function openBrowser() {
  const port = 20000 + Math.floor(Math.random() * 30000);
  const preview = spawn(process.execPath, ['scripts/serve.mjs', '--port', String(port)], { stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((resolve, reject) => {
    preview.stdout.once('data', resolve);
    preview.once('error', reject);
    preview.once('exit', code => reject(new Error(`Preview exited: ${code}`)));
  });
  const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH ?? '/home/codespace/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome';
  const browser = await chromium.launch({ executablePath });
  return { browser, preview, origin: `http://127.0.0.1:${port}` };
}

export async function mockReading(route) {
  const url = new URL(route.request().url());
  if (url.pathname.endsWith('/auth/')) return route.fulfill({ status: 204 });
  if (url.pathname.includes('/review/')) return route.fulfill({ json: {
    review_id: 7, review_url: 'https://readwise.io/reviews/7', review_completed: false,
    highlights: [{ id: 9, text: 'Attention begins with noticing what is already here.', title: 'Small observations', author: 'Review fixture' },
      { id: 10, text: 'A second passage gives the review progress room to breathe.', title: 'Reading notes', author: 'Review fixture' }],
  } });
  return route.fulfill({ json: { results: [{ id: 'read-one', title: 'A saved read', url: 'https://read.readwise.io/read/read-one', location: 'new', reading_time: '5 mins', reading_progress: 0 }], nextPageCursor: null } });
}
