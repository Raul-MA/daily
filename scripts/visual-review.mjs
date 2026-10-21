import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { widthFixture } from '../tests/e2e/width-fixture.js';
import { openBrowser } from './visual-review/browser.mjs';
import { reviewRoutes } from './visual-review/routes.mjs';
import { captureView } from './visual-review/screenshots.mjs';
import { galleries } from './visual-review/gallery.mjs';
import { pianoStates } from './visual-review/piano.mjs';
import { whatsappStates } from './visual-review/whatsapp.mjs';
import { readingStates } from './visual-review/reading.mjs';

const [group, phase = 'before', mode = 'routes', begin = '0', amount = '6'] = process.argv.slice(2);
const directory = `reports/visual-review/${group}/${phase}`;
await mkdir(directory, { recursive: true });
const fixture = await widthFixture();
const kind = mode === 'routes' ? 'manifest' : 'states';
let records;
try { records = JSON.parse(await readFile(`${directory}/${kind}.json`, 'utf8')); }
catch { records = []; }
const states = { piano: pianoStates, reading: readingStates, whatsapp: whatsappStates };
const all = mode === 'routes' ? reviewRoutes(group, fixture) : await states[group](fixture);
const views = all.slice(Number(begin), Number(begin) + Number(amount));
const session = await openBrowser();
try {
  for (const view of views) {
    const captured = await captureView({ ...session, directory }, view);
    records = records.filter(record => view.name ? record.name !== view.name : record.index !== view.index);
    records.push(...captured);
    records.sort((a, b) => (a.index ?? 0) - (b.index ?? 0) || a.width - b.width);
    await writeFile(`${directory}/${kind}.json`, JSON.stringify(records, null, 2));
    console.log(`${group} ${phase}: ${view.name ?? view.index} ${view.url}`);
  }
  await galleries(session.browser, { directory, kind, records });
  console.log(JSON.stringify({ group, phase, kind, screenshots: records.length, overflows: records.filter(record => record.overflow > 0).length }));
} finally { await session.browser.close(); session.preview.kill(); }
