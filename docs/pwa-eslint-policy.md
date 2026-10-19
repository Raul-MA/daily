# Shared lint policy for the Daily PWA

## Problem

Every authored or imported source file, script and test must meet one blocking policy. Refactoring for lint must preserve behavior and source assertions. There is no legacy exclusion, debt baseline, report-only exemption or permission to weaken a threshold.

## How It Works

`packages/eslint-config/index.mjs` is the installed flat configuration. All listed rules have severity `error`; root `npm run lint` uses `--max-warnings 0`.

| Rule | Installed setting |
| --- | --- |
| `max-lines` | 300; blank lines and comments excluded from the count |
| `max-lines-per-function` | 60; blank lines and comments excluded from the count |
| `max-depth` | 3 |
| `max-params` | 4 |
| `complexity` | 8, modified variant |
| `no-unused-vars` | Error |
| `eqeqeq` | Always; null comparisons ignored |
| `no-param-reassign`, `prefer-const` | Error |
| `no-empty` | Error, including empty catch blocks |
| `no-nested-ternary` | Error |
| `local/no-comments` | Every source comment is an error, including JSDoc and disable comments |

`noInlineConfig: true` prevents inline overrides. Counting exclusions do not permit comments: the independent no-comments rule still rejects them. Move non-obvious explanations into focused docs and preserve required legal notices in appropriate license files.

Source globs include `.js`, `.mjs`, `.cjs`, `.ts` and `.tsx`; the project authoring rule remains plain HTML/CSS/JavaScript. TypeScript, its parser and type-aware rules were removed when that requirement replaced the earlier typed checkpoint. The original supplied configuration remains available in Git history; it is not the installed policy. `check:js` checks syntax only, with no static type/promise analysis. The supplied policy includes neither `no-undef` nor an ESLint recommended preset.

Browser globals apply to app, module and shared browser sources. Node globals apply to scripts, configuration, unit tests and Playwright files; browser test helpers also receive browser globals. Worker sources and retained worker fixtures receive service-worker globals, and `.cjs` uses CommonJS. Generated/dependency directories (`node_modules`, `dist`, coverage, Playwright reports/results) are ignored; authored apps and tests remain in scope. Keep inline application logic in linted source modules.

| Command | Contract |
| --- | --- |
| `npm run lint` | Full-policy source/script/test check; errors and warnings fail |
| `npm run check:js` | Parse authored JavaScript; no typecheck |
| `npm run test:general` | Shared platform and whole-PWA integration/browser contracts |
| `npm run test:coffee` | Coffee scope; equivalent scripts exist for every module |
| `npm run test:all` | All registered suites, sequentially; missing expected discovery fails |
| `npm run build` | Prepare the static native application |
| `npm run verify` | Lint, syntax, all suites and static preparation |

## Gotchas

- Copy/characterize tests and record behavioral red before implementing or intentionally changing behavior. Preserve source assertions; do not skip tests to pass lint or verification.
- Refactor oversized imported units into compliant modules. Parser/configuration errors and missing test discovery also fail; diagnostic reports cannot convert a failing command into success.
- Run General plus affected module suites for shared changes and full verification before release. A passing harness/build cannot substitute for application acceptance.
- The [consolidation plan](pwa-consolidation-plan.md) owns migration gates; [progress](progress.md) records actual results. Runtime schemas and tests remain necessary because JavaScript syntax checks provide no type analysis.
