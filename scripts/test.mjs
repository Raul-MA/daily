import { openSync, writeSync, closeSync } from 'node:fs';
import { withBrowserServer } from './browser-server.mjs';
import { spawnSync } from 'node:child_process';
import { discover, discoverBrowser, discoverDomainUnit } from './discovery.mjs';

const modules = ['general', 'plants', 'coffee', 'games', 'time-budget', 'piano', 'reading', 'whatsapp'];
const scope = process.argv[2];
const reportIndex = process.argv.indexOf('--report');
const reportPath = reportIndex < 0 ? null : process.argv[reportIndex + 1];
if (reportPath !== null && !/^reports\/[a-z0-9][a-z0-9.-]*\.txt$/.test(reportPath)) throw new Error('Invalid report path.');
const report = reportPath === null ? null : openSync(reportPath, 'w');
if (!modules.includes(scope) && scope !== 'all') throw new Error(`Unknown suite: ${scope}`);

function execute(args, env = process.env) {
  return spawnSync(process.execPath, args, { stdio: ['inherit', report ?? 'inherit', report ?? 'inherit'], env }).status ?? 1;
}

function runNode(module) {
  const files = ['coffee', 'games'].includes(module) ? discoverDomainUnit(module) : discover(module);
  return execute(['--test', '--test-isolation=none', ...files]);
}

async function runBrowser(module) {
  if (module === 'general' || module === 'plants' || module === 'coffee' || module === 'games') {
    discoverBrowser(module);
    return execute(['node_modules/@playwright/test/cli.js', 'test'], { ...process.env, DAILY_MODULE: module });
  }
  if (module !== 'piano') return 0;
  return withBrowserServer(() => {
    const ui = execute(['modules/piano/e2e/browser-smoke.mjs']);
    const offline = execute(['modules/piano/e2e/service-worker-smoke.mjs']);
    return ui || offline;
  });
}

let failed = false;
for (const module of scope === 'all' ? modules : [scope]) {
  console.log(`Suite: ${module}`);
  if (report !== null) writeSync(report, `Suite: ${module}\n`);
  try {
    discover(module);
    const unit = runNode(module);
    const browser = await runBrowser(module);
    if (unit || browser) failed = true;
  } catch (error) {
    console.error(error);
    if (report !== null) writeSync(report, `${String(error)}\n`);
    failed = true;
  }
}
if (report !== null) closeSync(report);
if (reportPath) console.log(`Report: ${reportPath}`);
process.exitCode = failed ? 1 : 0;
