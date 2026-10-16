import { copy } from './copy.js';


export function formatDuration(minutes) {
  if (minutes === null || minutes === undefined) return copy("Not tracked");
  const total = Number(minutes);
  if (!Number.isFinite(total) || total < 0) return copy("Not tracked");
  const rounded = Math.round(total);
  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;
  if (!hours) return `${mins} min`;
  if (!mins) return `${hours} ${copy("hr")}`;
  return `${hours} ${copy("hr")} ${mins} min`;
}
