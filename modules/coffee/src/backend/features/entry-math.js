export function numberOrNull(value) {
  if (value === '' || value === undefined || value === null) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
export function calculateRatio(doseG, yieldValue) {
  const dose = numberOrNull(doseG);
  const output = numberOrNull(yieldValue);
  if (!dose || !output) return null;
  return Number((output / dose).toFixed(2));
}
export function calculateCompositionRatio(addInMl, yieldValue) {
  const addIn = numberOrNull(addInMl);
  const coffee = numberOrNull(yieldValue);
  if (!addIn || !coffee) return null;
  return Number((addIn / coffee).toFixed(2));
}
export function calculateDaysOffRoast(roastDate, brewedAt) {
  if (!roastDate || !brewedAt) return null;
  const roast = new Date(`${roastDate}T00:00:00`);
  const brewed = new Date(brewedAt);
  if (Number.isNaN(roast.getTime()) || Number.isNaN(brewed.getTime())) return null;
  return Math.max(0, Math.floor((brewed - roast) / 86400000));
}
export function field(input, existing, key, fallback) {
  return input?.[key] ?? existing?.[key] ?? fallback;
}
