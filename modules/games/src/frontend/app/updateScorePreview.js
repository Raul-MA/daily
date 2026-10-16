import { copy } from './copy.js';
import { evaluateScoreExpression } from './evaluateScoreExpression.js';
import { testIds } from './testIds.js';

export function updateScorePreview(input, evaluated = evaluateScoreExpression(input.value)) {
  const preview = input.closest("label")?.querySelector(`[data-testid="${testIds.scorePreview}"]`);
  input.setAttribute("aria-invalid", evaluated.valid ? "false" : "true");
  if (preview) preview.textContent = evaluated.valid ? copy("Total: {value}", { value: evaluated.value }) : copy("Invalid");
}
