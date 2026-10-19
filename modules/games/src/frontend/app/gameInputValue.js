import { gameUI } from './context.js';

export function gameInputValue(form, game, field, fallback) { return form.get(field) ?? gameUI.ui.gameFormDraft?.[field] ?? game?.[field] ?? fallback; }
