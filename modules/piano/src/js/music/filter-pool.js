export function filterPool(pool, filter) {
  return filter?.length > 0 ? pool.filter(item => filter.includes(item)) : pool;
}
