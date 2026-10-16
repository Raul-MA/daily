import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { createHash } from 'node:crypto';

const directory = 'legacy/exporters/time-budget';
const provenance = JSON.parse(readFileSync(join(directory, 'provenance.json'), 'utf8'));
const source = resolve(process.argv[2] ?? '..', provenance.repo);
const output = resolve(process.argv[3] ?? 'legacy/patches/timeBudget-export.patch');
const html = readFileSync(join(source, 'index.html'), 'utf8');
if (createHash('sha256').update(html).digest('hex') !== provenance.indexSha256) throw new Error('Original Time Budget HTML changed. Review it before updating export provenance.');
const validation = readFileSync(join(directory, 'validation.js'), 'utf8');
if (validation !== readFileSync('modules/time-budget/src/validation.js', 'utf8')) throw new Error('Review the Time Budget schema before updating the standalone exporter.');
const patches = [linkPatch(html), ...['index.html', 'entry.js', 'export.js', 'validation.js'].map(name => newFilePatch(name))];
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, patches.join(''));
console.log(`Prepared ${output}. Original files were only read.`);

function linkPatch(source) {
  const lines = source.split('\n');
  const index = lines.indexOf('</body>');
  if (index < 0) throw new Error('Original closing body was not found.');
  const start = Math.max(0, index - 2);
  const end = Math.min(lines.length, index + 2);
  const link = '    <a class="button ghost" href="daily-migration/index.html">Export for Daily / Exportar para Daily</a>';
  const hunk = lines.slice(start, end).flatMap((line, offset) => start + offset === index ? [`+${link}`, ` ${line}`] : [` ${line}`]);
  return `--- a/index.html\n+++ b/index.html\n@@ -${start + 1},${end - start} +${start + 1},${end - start + 1} @@\n${hunk.join('\n')}\n`;
}
function newFilePatch(name) {
  const text = readFileSync(join(directory, name), 'utf8');
  if (!text.endsWith('\n')) throw new Error(`Expected a final newline in ${name}.`);
  const lines = text.slice(0, -1).split('\n');
  return `--- /dev/null\n+++ b/daily-migration/${name}\n@@ -0,0 +1,${lines.length} @@\n${lines.map(line => `+${line}`).join('\n')}\n`;
}
