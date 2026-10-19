function object(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function validDate(value) {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function validDraft(value) {
  if (!object(value) || Object.keys(value).length !== 4) return false;
  if (!['recipient', 'date', 'time', 'message'].every(key => typeof value[key] === 'string')) return false;
  return validDate(value.date) && (!value.time || /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value.time));
}
export function validWhatsApp(value) { return object(value) && Object.keys(value).length === 1 && (value.draft === null || validDraft(value.draft)); }
export function initialWhatsApp() { return { draft: null }; }
