export function appURL(module, route = '') {
  const baseline = process.env.DAILY_BASELINE_URL;
  if (baseline) return `${baseline}${route ? `#/${route}` : ''}`;
  return `/daily/#/${module}${route ? `/${route}` : ''}`;
}
