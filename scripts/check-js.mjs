import { globSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const files = globSync(['apps/**/*.{js,mjs}', 'packages/**/*.{js,mjs}', 'modules/**/*.{js,mjs,cjs}', 'legacy/**/*.{js,mjs,cjs}', 'scripts/*.mjs', 'tests/**/*.{js,mjs,cjs}', '*.mjs'], { exclude: ['**/node_modules/**'] });
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log(`JavaScript syntax checked: ${files.length} files`);
