import { copy } from './copy.js';
import { formatDuration } from './formatDuration.js';

export function formatDurationRange(shortest, longest) {
  if (shortest === null || longest === null || shortest === undefined || longest === undefined) return copy("Not tracked");
  if (shortest === longest) return formatDuration(shortest);
  return `${formatDuration(shortest)} / ${formatDuration(longest)}`;
}
