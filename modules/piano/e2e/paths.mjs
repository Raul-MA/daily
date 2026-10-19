import { loadModule } from '../../../tests/support/load-module.mjs';

const { DESTINATIONS } = await loadModule('piano', 'js/components/navigation-data.js');
export const baseline = Boolean(process.env.DAILY_SOURCE_ROOT);
export const sourcePrefix = baseline ? './js/' : './modules/piano/src/js/';
export function hashFor(path) {
  if (baseline) return `#${path}`;
  const [pathname, query] = path.split('?');
  const destination = DESTINATIONS.find(item => item.path === pathname);
  if (!destination) throw new Error(`Unknown piano fixture path: ${path}`);
  const top = { course: '/piano', library: '/piano/library', learn: '/piano/learn' };
  const section = destination.activity === 'practice' ? 'exercises' : 'reference';
  const target = top[destination.id] ?? `/piano/${section}/${encodeURIComponent(destination.id)}`;
  return `#${target}${query ? `?${query}` : ''}`;
}
export function hrefFor(path) { return baseline ? hashFor(path) : `/daily/${hashFor(path)}`; }
