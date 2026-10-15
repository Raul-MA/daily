

export function visibleItems(items, showArchived) {
  return items.filter((item) => showArchived || !item.archived);
}
