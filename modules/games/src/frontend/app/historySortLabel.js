

export function historySortLabel(sort) {
  if (sort === "oldest") return "Oldest first";
  if (sort === "game") return "Game name";
  if (sort === "winner") return "Winner name";
  return "Newest first";
}
