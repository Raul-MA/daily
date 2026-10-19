import { initialDailyDocument } from '../../../packages/data/src/daily-document.js';
import { normalizeData } from '../src/backend/core/schema.js';
import { synchronizeGameActivities } from '../src/activity-sync.js';
import { STORAGE_KEY } from './storage-key.js';

export function gameFixture(data) {
  if (process.env.DAILY_BASELINE_URL) return data;
  const root = initialDailyDocument(data.settings.language || 'en');
  const normalized = normalizeData(data);
  root.modules.games = { version: 1, data: normalized };
  root.modules.activities = { version: 1, data: synchronizeGameActivities([], normalized, { replace: true }) };
  return root;
}
export async function seedGameData(page, data) {
  await page.evaluate(({ key, data }) => localStorage.setItem(key, JSON.stringify(data)), { key: STORAGE_KEY, data: gameFixture(data) });
}
export async function readGameData(page) {
  return page.evaluate(key => {
    const data = JSON.parse(localStorage.getItem(key));
    return key === 'daily:v1' ? data.modules.games.data : data;
  }, STORAGE_KEY);
}
export async function confirmGameImport(page) {
  if (process.env.DAILY_BASELINE_URL) return;
  await page.locator('[data-games-recovery]').click();
  await page.locator('[data-games-confirm-import]').click();
}
