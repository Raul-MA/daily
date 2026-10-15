const paths = {
  home: '/', plants: '/plants', plant: '/plants/:id', coffee: '/coffee', coffeeNew: '/coffee/new',
  games: '/games', gameNew: '/games/new', gameSession: '/games/session/:id', time: '/time',
  piano: '/piano', pianoExercise: '/piano/exercises/:id', pianoLearn: '/piano/learn',
  reader: '/reading/picker', review: '/reading/review', whatsapp: '/whatsapp', settings: '/settings',
};
export type Page = keyof typeof paths;
export type Route = { page: Page | 'notFound'; id?: string; query: URLSearchParams };
type Link = { page: Route['page']; id?: string; query?: URLSearchParams | Record<string, string> };

export function parseHash(hash: string): Route {
  if (!hash || hash === '#') return { page: 'home', query: new URLSearchParams() };
  const [path, query = ''] = hash.slice(1).split(/\?(.*)/s);
  for (const [page, pattern] of Object.entries(paths)) {
    const match = path.match(new RegExp(`^${pattern.replace(':id', '([^/]+)')}$`));
    if (!match) continue;
    try {
      const route: Route = { page: page as Page, query: new URLSearchParams(query) };
      if (match[1]) route.id = decodeURIComponent(match[1]);
      return route;
    } catch {
      return { page: 'notFound', query: new URLSearchParams() };
    }
  }
  return { page: 'notFound', query: new URLSearchParams() };
}

export function href(route: Link, base: string): string {
  if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(base)) throw new Error('Invalid application base.');
  if (!Object.hasOwn(paths, route.page) || route.page === 'notFound') throw new Error('Unknown route.');
  let path = paths[route.page];
  if (path.includes(':id')) {
    if (!route.id) throw new Error('A stable ID is required.');
    path = path.replace(':id', encodeURIComponent(route.id));
  }
  const query = new URLSearchParams(route.query).toString();
  return `${base}#${path}${query ? `?${query}` : ''}`;
}

export function startRouter(browser: Pick<Window, 'location' | 'addEventListener' | 'removeEventListener'>, onRoute: (route: Route) => void) {
  const change = () => onRoute(parseHash(browser.location.hash));
  browser.addEventListener('hashchange', change);
  change();
  return () => browser.removeEventListener('hashchange', change);
}
