import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function galleries(browser, options) {
  const page = await browser.newPage({ viewport: { width: 1250, height: 1900 } });
  const rows = options.records.filter(record => record.width === 390);
  try {
    for (let offset = 0; offset < rows.length; offset += 6) {
      const body = rows.slice(offset, offset + 6).map(record => `<div><p>${record.name ?? record.index}. ${record.url}</p><img src="${record.file}" style="width:390px;height:844px;object-fit:cover;object-position:top"></div>`).join('');
      const file = resolve(options.directory, `gallery-${options.kind}-${offset / 6 + 1}.html`);
      await writeFile(file, `<html><body style="margin:0;padding:16px;background:#ddd;font:14px system-ui;display:grid;grid-template-columns:repeat(3,390px);gap:16px">${body}</body></html>`);
      await page.goto(`file://${file}`);
      await page.screenshot({ path: file.replace('.html', '.png'), fullPage: true });
    }
  } finally { await page.close(); }
}
