import globals from 'globals';

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
  { files: ['**/e2e/**'], languageOptions: { globals: globals.browser } },
  { files: ['**/*.cjs'], languageOptions: { sourceType: 'commonjs' } },
  { files: ['**/sw.{js,ts}', 'tests/fixtures/legacy-workers/*.js'], languageOptions: { globals: globals.serviceworker } },
  {
    ignores: ['**/node_modules/**', '**/playwright-report/**', '**/test-results/**', '**/dist/**', '**/coverage/**'],
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
    files: ['apps/daily/src/**/*.{js,mjs,ts,tsx}', 'modules/*/src/**/*.{js,mjs,ts,tsx}', 'packages/*/src/**/*.{js,mjs,ts,tsx}'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['**/test/**/*.{js,mjs,cjs,ts,tsx}', '**/tests/**/*.{js,mjs,cjs,ts,tsx}', '**/e2e/**/*.{js,mjs,cjs,ts,tsx}', 'scripts/**/*.{js,mjs,cjs,ts,tsx}', '*.{js,mjs,cjs,ts,tsx}', 'packages/eslint-config/**'],
    languageOptions: { globals: globals.node },
  },
];
