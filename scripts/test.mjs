import { withBrowserServer } from './browser-server.mjs';
import { spawnSync } from 'node:child_process';
import { discover } from './discovery.mjs';

const modules = ['general', 'plants', 'coffee', 'games', 'time-budget', 'piano', 'reading', 'whatsapp'];
const scope = process.argv[2];
if (!modules.includes(scope) && scope !== 'all') throw new Error(`Unknown suite: ${scope}`);

function execute(args, env = process.env) {
  return spawnSync(process.execPath, args, { stdio: 'inherit', env }).status ?? 1;
}

function runNode(module) {
  const files = discover(module);
  return execute(['--test', '--test-isolation=none', ...files]);
}

async function runBrowser(module) {
  if (module === 'coffee' || module === 'games') {
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
  try {
    discover(module);
    const unit = module === 'coffee' || module === 'games' ? 0 : runNode(module);
    const browser = await runBrowser(module);
    if (unit || browser) failed = true;
  } catch (error) {
    console.error(error);
    failed = true;
  }
}
process.exitCode = failed ? 1 : 0;
