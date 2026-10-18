export const paths = {
    home: '/', plants: '/plants', plantNew: '/plants/new', plantSettings: '/plants/settings', plantEdit: '/plants/:id/edit', plant: '/plants/:id', coffee: '/coffee', coffeeNew: '/coffee/new',
    coffeeHistory: '/coffee/history', coffeeInsights: '/coffee/insights', coffeeSettings: '/coffee/settings', coffeeEntryEdit: '/coffee/entry/:id/edit', coffeeEntry: '/coffee/entry/:id',
    games: '/games', gameNew: '/games/new', gameSession: '/games/session/:id', time: '/time',
    gamesSession: '/games/session', gamesHistory: '/games/history', gameDetail: '/games/history/:id', gamesCatalog: '/games/catalog', gamesPlayers: '/games/players', gamesStats: '/games/stats', gamesSettings: '/games/settings',
    piano: '/piano', pianoLibrary: '/piano/library', pianoReference: '/piano/reference/:id', pianoExercise: '/piano/exercises/:id', pianoLearn: '/piano/learn',
    reader: '/reading/picker', review: '/reading/review', whatsapp: '/whatsapp', settings: '/settings',
};
export function parseHash(hash) {
    if (!hash || hash === '#')
        return { page: 'home', query: new URLSearchParams() };
    const [path, query = ''] = hash.slice(1).split(/\?(.*)/s);
    for (const [page, pattern] of Object.entries(paths)) {
        const match = path.match(new RegExp(`^${pattern.replace(':id', '([^/]+)')}$`));
        if (!match)
            continue;
        try {
            const route = { page: page, query: new URLSearchParams(query) };
            if (match[1])
                route.id = decodeURIComponent(match[1]);
            return route;
        }
        catch {
            return { page: 'notFound', query: new URLSearchParams() };
        }
    }
    return { page: 'notFound', query: new URLSearchParams() };
}
export function href(route, base) {
    if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(base))
        throw new Error('Invalid application base.');
    if (!Object.hasOwn(paths, route.page) || route.page === 'notFound')
        throw new Error('Unknown route.');
    let path = paths[route.page];
    if (path.includes(':id')) {
        if (!route.id)
            throw new Error('A stable ID is required.');
        path = path.replace(':id', encodeURIComponent(route.id));
    }
    const query = new URLSearchParams(route.query).toString();
    return `${base}#${path}${query ? `?${query}` : ''}`;
}
export function startRouter(browser, onRoute) {
    const change = () => onRoute(parseHash(browser.location.hash));
    browser.addEventListener('hashchange', change);
    change();
    return () => browser.removeEventListener('hashchange', change);
}
