import { TOAST_DURATION_MS } from './constants.js';
import { showToast } from './showToast.js';
import { setState } from './state.js';
import { render } from './render.js';
import { clearDrafts } from './drafts.js';

export function applyResult(result, successMessage = "", successDurationMs = TOAST_DURATION_MS) {
  if (result?.errors?.length) {
    showToast(result.errors.join(" "), "error", 0);
  } else {
    clearDrafts();
    setState(result.data);
    showToast(successMessage, "success", successDurationMs);
  }
  render();
}
