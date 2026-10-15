

export function formatDuration(minutes) {
  if (minutes === null || minutes === undefined) return "Not tracked";
  const total = Number(minutes);
  if (!Number.isFinite(total) || total < 0) return "Not tracked";
  const rounded = Math.round(total);
  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;
  if (!hours) return `${mins} min`;
  if (!mins) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}
