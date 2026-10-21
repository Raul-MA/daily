import { resolve } from 'node:path';
import { mockReading } from './browser.mjs';

function seed({ root, credentials, broken }) {
  localStorage.setItem('daily:v1', broken ? '{broken' : JSON.stringify(root));
  if (credentials) sessionStorage.setItem('daily:readwise:session:v1', JSON.stringify({ token: 'visual-fixture', accountId: 'visual-fixture-account' }));
}

function measure() {
  return {
    overflow: document.documentElement.scrollWidth - innerWidth,
    height: document.documentElement.scrollHeight,
    headings: [...document.querySelectorAll('main h1, main h2')].filter(node => node.getClientRects().length).map(node => ({
      text: node.textContent.slice(0, 80), x: Math.round(node.getBoundingClientRect().x), y: Math.round(node.getBoundingClientRect().y), size: getComputedStyle(node).fontSize,
    })),
  };
}

async function positionPage(page, view) {
  await page.evaluate(bottom => window.scrollTo({ top: bottom ? document.documentElement.scrollHeight : 0, left: 0, behavior: 'instant' }), view.scroll === 'bottom');
}

function contextOptions(view, width) {
  return { colorScheme: view.colorScheme ?? 'light', serviceWorkers: 'block', viewport: { width, height: width === 1280 ? 900 : 844 } };
}

async function captureWidth(session, view, width) {
  const context = await session.browser.newContext(contextOptions(view, width));
  await context.route('https://**/*', view.network ?? mockReading);
  const page = await context.newPage();
  try {
    await page.addInitScript(seed, { root: view.root, credentials: view.credentials !== false, broken: view.broken });
    await page.goto(`${session.origin}${view.url}`, { waitUntil: 'domcontentloaded' });
    await page.locator('.shell-main h1:visible').first().waitFor();
    if (view.prepare) await view.prepare(page, width);
    await page.mouse.move(0, 0);
    await positionPage(page, view);
    await page.waitForTimeout(350);
    const base = view.name ? `state-${view.name}` : `${String(view.index).padStart(2, '0')}-${view.page}`;
    const file = resolve(session.directory, `${base}-${width}.png`);
    await page.screenshot({ path: file, fullPage: view.fullPage !== false });
    const measurements = await page.evaluate(measure);
    const sections = [];
    for (const [name, selector] of Object.entries(view.sections ?? {})) {
      const sectionFile = resolve(session.directory, `${base}-${name}-${width}.png`);
      await page.locator(selector).screenshot({ path: sectionFile });
      sections.push({ name, file: sectionFile });
    }
    return { name: view.name, page: view.page, index: view.index, url: view.url, width, file, fullPage: view.fullPage !== false, sections, nativeDialog: page.visualDialog ?? null, ...measurements };
  } finally { await context.close(); }
}

export async function captureView(session, view) {
  if (view.sequential) {
    const records = [];
    for (const width of [390, 320, 1280]) records.push(await captureWidth(session, view, width));
    return records;
  }
  return Promise.all([390, 320, 1280].map(width => captureWidth(session, view, width)));
}
