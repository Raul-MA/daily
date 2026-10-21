import { widthRoutes } from '../../tests/e2e/width-routes.js';

function app(page) {
  const prefixes = ['plant', 'coffee', 'game', 'piano', 'whatsapp'];
  const groups = ['plants', 'coffee', 'games', 'piano', 'whatsapp'];
  const index = prefixes.findIndex(prefix => page.startsWith(prefix));
  if (index !== -1) return groups[index];
  if (['reader', 'readerSettings', 'review'].includes(page)) return 'reading';
  return page === 'time' ? 'time' : 'daily';
}

async function prepareReading(page, route) {
  if (route === 'review') await page.locator('[data-review-card]').first().waitFor();
  if (route === 'reader' && await page.locator('#settingsDialog[open]').count()) await page.locator('#closeSettings').click();
}

export function reviewRoutes(group, fixture) {
  return widthRoutes(fixture.active).filter(route => app(route.page) === group).map((route, index) => ({
    ...route, index: index + 1,
    root: structuredClone(route.url.includes('?lesson=') ? fixture.lesson : fixture.active),
    prepare: group === 'reading' ? page => prepareReading(page, route.page) : undefined,
  }));
}
