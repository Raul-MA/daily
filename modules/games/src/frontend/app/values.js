export function editorValue(draft, current, field) { return draft[field] ?? current?.[field] ?? ""; }
export function scoringValue(draft, game, field, fallback) { return draft[field] || game?.[field] || fallback; }
