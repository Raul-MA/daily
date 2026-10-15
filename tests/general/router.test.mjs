import test from 'node:test';
import assert from 'node:assert/strict';

const load = () => import('../../packages/platform/src/router.ts');

test('hash routes cover all seven modules and their canonical deep links', async () => {
  const { parseHash } = await load();
  const cases = [['', 'home'], ['#/', 'home'], ['#/plants', 'plants'], ['#/plants/plant-1', 'plant'], ['#/coffee/new', 'coffeeNew'], ['#/games/new', 'gameNew'], ['#/games/session/session-1', 'gameSession'], ['#/time', 'time'], ['#/piano/exercises/intervals', 'pianoExercise'], ['#/piano/learn?lesson=lesson-1', 'pianoLearn'], ['#/reading/picker', 'reader'], ['#/reading/review', 'review'], ['#/whatsapp', 'whatsapp'], ['#/settings', 'settings']];
  for (const [hash, page] of cases) assert.equal(parseHash(hash).page, page, hash);
});

test('href builder encodes stable IDs and supports configurable local base paths', async () => {
  const { href, parseHash } = await load();
  const id = 'planta/á #1';
  const url = href({ page: 'plant', id }, '/preview/');
  assert.equal(url, '/preview/#/plants/planta%2F%C3%A1%20%231');
  assert.equal(parseHash(url.slice(url.indexOf('#'))).id, id);
  assert.equal(href({ page: 'settings' }, '/'), '/#/settings');
});

test('query parameters and repeated values survive routing without changing settings', async () => {
  const { href, parseHash } = await load();
  const route = parseHash('#/reading/picker?count=5&minutes=15&location=later&location=shortlist');
  assert.equal(route.query.get('count'), '5');
  assert.deepEqual(route.query.getAll('location'), ['later', 'shortlist']);
  assert.equal(href(route, '/daily/'), '/daily/#/reading/picker?count=5&minutes=15&location=later&location=shortlist');
});

test('unknown and malformed routes fail safely instead of executing external URLs', async () => {
  const { parseHash, href } = await load();
  for (const hash of ['#javascript:alert(1)', '#/missing', '#/plants/%ZZ', '#/plants/', '#//evil.example/']) assert.equal(parseHash(hash).page, 'notFound');
  assert.throws(() => href({ page: 'javascript:alert(1)' }, '/daily/'), /route/i);
  assert.throws(() => href({ page: 'plant' }, '/daily/'), /id/i);
  assert.throws(() => href({ page: 'home' }, 'https://evil.example/'), /base/i);
});

test('browser hash listener supports navigation and removes itself on cleanup', async () => {
  const { startRouter } = await load();
  const events = new EventTarget();
  const routes = [];
  const location = { hash: '#/plants/fern' };
  const browser = { location, addEventListener: events.addEventListener.bind(events), removeEventListener: events.removeEventListener.bind(events) };
  const cleanup = startRouter(browser, route => routes.push(route));
  assert.equal(routes[0].id, 'fern');
  location.hash = '#/settings';
  events.dispatchEvent(new Event('hashchange'));
  assert.equal(routes[1].page, 'settings');
  cleanup();
  events.dispatchEvent(new Event('hashchange'));
  assert.equal(routes.length, 2);
});
