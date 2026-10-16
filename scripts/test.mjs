import { openSync, writeSync, closeSync } from 'node:fs';
import { withBrowserServer } from './browser-server.mjs';
import { spawnSync } from 'node:child_process';
import { discover, discoverBrowser, discoverDomainUnit } from './discovery.mjs';

const modules = ['general', 'plants', 'coffee', 'games', 'time-budget', 'piano', 'reading', 'whatsapp'];
const scope = process.argv[2];
const baselineIndex = process.argv.indexOf('--baseline');
if (baselineIndex >= 0) {
  process.env.DAILY_BASELINE_URL = process.argv[baselineIndex + 1];
  process.env.DAILY_SOURCE_ROOT = '/workspaces';
  if (scope === 'piano') process.env.TONIQ_URL = process.env.DAILY_BASELINE_URL;
}
const reportIndex = process.argv.indexOf('--report');
const reportPath = reportIndex < 0 ? null : process.argv[reportIndex + 1];
if (reportPath !== null && !/^reports\/[a-z0-9][a-z0-9.-]*\.txt$/.test(reportPath)) throw new Error('Invalid report path.');
const report = reportPath === null ? null : openSync(reportPath, 'w');
if (!modules.includes(scope) && scope !== 'all') throw new Error(`Unknown suite: ${scope}`);

function execute(args, env = process.env) {
  return spawnSync(process.execPath, args, { stdio: ['inherit', report ?? 'inherit', report ?? 'inherit'], env }).status ?? 1;
}

function runNode(module) {
  if (module === 'piano' && !process.env.DAILY_BASELINE_URL) {
    const build = execute(['scripts/build.mjs']);
    if (build) return build;
  }
  const files = ['coffee', 'games', 'time-budget'].includes(module) ? discoverDomainUnit(module) : discover(module);
  return execute(['--test', '--test-isolation=none', ...files.filter(file => !process.env.DAILY_BASELINE_URL || !file.endsWith('service.test.mjs'))]);
}

async function runBrowser(module) {
  if (['general', 'plants', 'coffee', 'games', 'time-budget'].includes(module)) {
    discoverBrowser(module);
    return execute(['node_modules/@playwright/test/cli.js', 'test'], { ...process.env, DAILY_MODULE: module });
  }
  if (module !== 'piano') return 0;
  discoverBrowser(module);
  const native = process.env.DAILY_BASELINE_URL ? 0 : execute(['node_modules/@playwright/test/cli.js', 'test'], { ...process.env, DAILY_MODULE: module });
  const legacy = await withBrowserServer(() => {
    const ui = execute(['modules/piano/e2e/browser-smoke.mjs']);
    const offline = execute(['modules/piano/e2e/service-worker-smoke.mjs']);
    return ui || offline;
  });
  return native || legacy;
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
