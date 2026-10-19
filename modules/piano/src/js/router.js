import { parseHash, href } from '../../../../packages/platform/src/router.js';
import { DESTINATIONS, getDestination } from './components/navigation-data.js';
import { pianoContext } from './context.js';

export function routeForDestination(id, query) {
  if (id === 'course') return { page: 'piano', query };
  if (id === 'library') return { page: 'pianoLibrary', query };
  if (id === 'learn') return { page: 'pianoLearn', query };
  const destination = getDestination(id);
  return { page: destination.activity === 'practice' ? 'pianoExercise' : 'pianoReference', id, query };
}
export function pianoHref(path) {
  const [source, query = ''] = path.split(/\?(.*)/s);
  const destination = DESTINATIONS.find(item => item.path === source);
  if (!destination) throw new Error('Unknown piano page.');
  return href(routeForDestination(destination.id, new URLSearchParams(query)), pianoContext.base);
}
export function destinationForRoute(route) {
  if (route.page === 'piano') return getDestination('course');
  if (route.page === 'pianoLibrary') return getDestination('library');
  if (route.page === 'pianoLearn') return getDestination('learn');
  return getDestination(route.id);
}
export function currentPath() { return destinationForRoute(parseHash(window.location.hash)).path; }
export function navigate(path, replace = false) {
  const url = path.startsWith('/piano') ? `${pianoContext.base}#${path}` : pianoHref(path);
  if (replace) {
    window.history.replaceState(null, '', url);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else window.location.hash = new URL(url, window.location.href).hash;
}
export function rewriteLinks(host) {
  for (const link of host.querySelectorAll('a[href^="#/"]')) {
    const path = link.getAttribute('href').slice(1);
    if (!path.startsWith('/piano')) link.href = pianoHref(path);
  }
}
export function pianoAsset(path) { return new URL(`../${path}`, import.meta.url).href; }
