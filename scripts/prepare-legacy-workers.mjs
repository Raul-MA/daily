import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { patchWorker } from './legacy/workers.mjs';

const root = resolve(process.argv[2] || '..');
const workers = JSON.parse(await readFile('tests/fixtures/legacy-workers/provenance.json', 'utf8'));
await mkdir('legacy/patches', { recursive: true });

for (const worker of workers) {
  const source = await readFile(resolve(root, worker.repo, worker.filename), 'utf8');
  const hash = createHash('sha256').update(source).digest('hex');
  if (hash !== worker.sha256) throw new Error(`Source changed: ${worker.repo}/${worker.filename}. Review its worker before updating provenance.`);
  const changed = patchWorker(worker.repo, source);
  const patch = unifiedPatch(worker.filename, source, changed);
  await writeFile(`legacy/patches/${worker.repo}.patch`, patch);
  console.log(`Prepared ${worker.repo}: ${hash}`);
}

function unifiedPatch(filename, source, changed) {
  const before = source.split('\n');
  const after = changed.split('\n');
  const index = before.findIndex((line, index) => line !== after[index]);
  if (index < 0 || before.length !== after.length) throw new Error('Expected one changed guard line.');
  const start = Math.max(0, index - 3);
  const end = Math.min(before.length, index + 4);
  const lines = before.slice(start, end).flatMap((line, offset) => {
    if (start + offset === index) return [`-${line}`, `+${after[index]}`];
    return [` ${line}`];
  });
  return `--- a/${filename}\n+++ b/${filename}\n@@ -${start + 1},${end - start} +${start + 1},${end - start} @@\n${lines.join('\n')}\n`;
}
