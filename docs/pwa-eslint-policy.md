# Shared lint policy for the daily PWA

Status: mandatory installed policy supporting [the consolidation plan](./pwa-consolidation-plan.md). The exact rules below are installed in `packages/eslint-config/index.mjs`; runtime globs are adapted for this monorepo. Actual check results are recorded in `progress.md`.

## Mandatory from the first implementation step

Use one flat configuration and local no-comments plugin across every application, shared package, migration script, and JavaScript/TypeScript test. Keep rule severity at error so reporting and enforcement describe the same policy.

1. Copy existing tests and E2E suites before application logic, alongside the minimum runner/harness and this shared configuration. Record real red results for unimplemented behavior.
2. Enforce the full rule set on every authored file entering the new repo, including imported tests, app code, scripts, and configuration. Refactor oversized units and move explanations to docs without weakening assertions.
3. Implement each module against its copied tests until its whole suite passes. Add tests first for uncovered behavior. No skipped tests, blanket legacy exclusions, relaxed thresholds, or inline disables.
4. Keep lint blocking even while the initial feature suites are red. Reports may explain failures but must preserve ESLint's failing exit status. Tool/parser/config errors also fail verification.
5. Run scoped suites for module work and general/affected suites for shared changes. Run full strict lint, typecheck, all tests, and build before declaring the migration complete or releasing.

This supersedes the earlier advisory report and legacy-debt baseline proposal. There is no grandfathered code in the new repository. Preserve required legal attribution in appropriate license files when moving source explanations to documentation.

## Monorepo adjustments required

Keep the exact rule choices below, including the specified TypeScript safe-call allowances. Adapt file globs to the actual layout without changing the policy:

- Global ignores need nested patterns such as `**/node_modules/**`, `**/playwright-report/**`, `**/test-results/**`, plus generated build/coverage output. Do not ignore source apps or tests as "legacy."
- Browser globals belong on `apps/daily/src/**` and module/browser package sources, not only `public/**`. The original blanket `src/** = node` mapping does not fit this browser application.
- Service-worker source needs service-worker globals. Node scripts, build configs, unit tests, and Playwright test files need their respective Node globals. Browser test helpers need browser globals when they run as browser modules.
- Each TypeScript source/test/config file must belong to a suitable tsconfig for `projectService: true`. Include test projects explicitly; avoid a wide default-project escape hatch.
- Preserve `.cjs` CommonJS handling. Keep authored `.js/.mjs/.cjs/.ts/.tsx` in scope; include any remaining inline application scripts in the migration inventory and move them into linted source modules.
- The type-aware rules below apply to TypeScript only. Existing JavaScript does not acquire promise/type analysis merely by inheriting this configuration. New shared TypeScript code also receives a separate typecheck in CI.
- The supplied rules do not include `no-undef` or an ESLint recommended preset. Do not silently claim those checks exist or add a different ruleset under the same name.
- Blank/comment exclusions do not permit new comments: `local/no-comments` reports every source comment independently, including ESLint disable comments and JSDoc.

## User-supplied configuration

```js
import globals from 'globals';
import tseslint from 'typescript-eslint';

const sourceFiles = ['**/*.{js,mjs,cjs,ts,tsx}'];

const noComments = {
  rules: {
    'no-comments': {
      meta: {
        type: 'suggestion',
        docs: { description: 'Keep explanations in readable code or documentation' },
        schema: [],
        messages: { unexpected: 'Remove this comment. Clarify the code or document the design decision instead.' },
      },
      create(context) {
        return {
          Program() {
            for (const comment of context.sourceCode.getAllComments()) {
              context.report({ loc: comment.loc, messageId: 'unexpected' });
            }
          },
        };
      },
    },
  },
};

export default [
  {
    ignores: ['node_modules/**', 'playwright-report/**', 'test-results/**'],
  },
  {
    files: sourceFiles,
    plugins: { local: noComments },
    linterOptions: { noInlineConfig: true },
    rules: {
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 60, skipBlankLines: true, skipComments: true }],
      'max-depth': ['error', 3],
      'max-params': ['error', 4],
      complexity: ['error', { max: 8, variant: 'modified' }],
      'no-unused-vars': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-param-reassign': 'error',
      'prefer-const': 'error',
      'no-empty': ['error', { allowEmptyCatch: false }],
      'no-nested-ternary': 'error',
      'local/no-comments': 'error',
    },
  },
  {
    files: ['public/**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['src/**/*.{js,mjs,cjs,ts,tsx}', 'test/**/*.{js,mjs,cjs,ts,tsx}', 'e2e/**/*.{js,mjs,cjs,ts,tsx}', 'scripts/**/*.{js,mjs,cjs,ts,tsx}', '*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { projectService: true },
    },
    plugins: { '@typescript-eslint': tseslint.plugin },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-floating-promises': ['error', {
        allowForKnownSafeCalls: [
          { from: 'package', name: ['test', 'it', 'describe'], package: 'node:test' },
          { from: 'package', name: ['test', 'it', 'describe'], package: '@playwright/test' },
        ],
      }],
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/only-throw-error': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { disallowTypeAnnotations: false }],
    },
  },
];
```

## Root command contract

| Command | Purpose |
| --- | --- |
| `npm run lint:report` | Optional full diagnostic artifact; failures remain blocking. |
| `npm run lint` | Full-policy ESLint for all authored source/tests/scripts, blocking from day one. |
| `npm run typecheck` | Typecheck new TypeScript packages and their tests. |
| `npm run test:general` | Platform/shared tests and whole-PWA integration/E2E. |
| `npm run test:coffee` | Coffee unit/integration and E2E only; equivalent commands for each module. |
| `npm run test:all` | General and all module suites, including every E2E suite. |
| `npm run build` | One deployable static PWA. |
| `npm run verify` | Strict lint, typecheck, all tests, and build. |

These commands are installed at the root. Unimplemented feature suites intentionally fail; a successful harness build is not a release. Verify nested workspace coverage, browser/Node/worker globals, typed test project ownership, and failure exit codes. Scoped runners must fail if expected tests are not discovered; full verification must include every registered suite. No lint-baseline checker is needed.
