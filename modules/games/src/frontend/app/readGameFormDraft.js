import { testIds } from './testIds.js';

export function readGameFormDraft(form) {
  const draft = Object.fromEntries(new FormData(form));
  draft.isCollaborative = form.querySelector(`[data-testid="${testIds.gameCollaborative}"]`)?.checked ? "true" : "false";
  return draft;
}
