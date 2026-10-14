import { loadModule, modulePath } from '../../../tests/support/load-module.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const { ACTIVITY_LABELS, DESTINATIONS, DESTINATION_SEARCH_ENTRIES, LIBRARY_GROUPS, getDestination, validateRouteLoaders } = await loadModule('piano', 'js/components/navigation-data.js');
test('every catalog destination has exactly one existing page loader', () => {
    assert.equal(new Set(DESTINATIONS.map(item => item.id)).size, DESTINATIONS.length);
    assert.equal(new Set(DESTINATIONS.map(item => item.path)).size, DESTINATIONS.length);
    const app = readFileSync(modulePath('piano', 'js/app.js'), 'utf8');
    const loaders = [...app.matchAll(/'([^']+)': \(\) => import\('([^']+)'\)/g)];
    assert.equal(loaders.length, DESTINATIONS.length);
    const registry = Object.fromEntries(loaders.map(([, id, path]) => {
        assert.ok(existsSync(modulePath('piano', `js/${path}`)), path);
        return [id, () => { }];
    }));
    assert.doesNotThrow(() => validateRouteLoaders(registry));
    const missing = { ...registry };
    delete missing['intervals.theory'];
    assert.throws(() => validateRouteLoaders(missing), /Missing route loader: intervals.theory/);
    assert.throws(() => validateRouteLoaders({ ...registry, typo: () => { } }), /Unknown destination: typo/);
});
test('library links and search aliases use canonical destinations', () => {
    const links = LIBRARY_GROUPS.flatMap(group => group.topics.flatMap(topic => topic.links));
    for (const link of links) {
        const destination = getDestination(link.id);
        assert.equal(link.path, destination.path);
        assert.equal(link.kind, ACTIVITY_LABELS[destination.activity]);
        assert.ok(DESTINATION_SEARCH_ENTRIES.some(entry => entry.path === link.path));
    }
    for (const destination of DESTINATIONS.filter(item => item.activity)) {
        assert.ok(links.some(link => link.id === destination.id), destination.id);
    }
    assert.equal(DESTINATION_SEARCH_ENTRIES.find(entry => entry.title === 'Scales — Theory (Pentatonic)').path, getDestination('scales.theory').path);
    assert.equal(getDestination('pentatonic.theory').path, '/pentatonic/theory');
    assert.ok(DESTINATION_SEARCH_ENTRIES.find(entry => entry.path === '/bebop/theory').keywords.includes('dominant'));
});
