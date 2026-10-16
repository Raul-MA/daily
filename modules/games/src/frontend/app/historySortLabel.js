import { copy } from './copy.js';


export function historySortLabel(sort) {
  if (sort === "oldest") return copy("Oldest first");
  if (sort === "game") return copy("Game name");
  if (sort === "winner") return copy("Winner name");
  return copy("Newest first");
}
