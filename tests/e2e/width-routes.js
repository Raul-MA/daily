import { paths, href } from '../../packages/platform/src/router.js';
import { DESTINATIONS } from '../../modules/piano/src/js/components/navigation-data.js';
import { LESSONS } from '../../modules/piano/src/js/music/learning-path.js';

function sampleId(page, root) {
  if (page.startsWith('plant')) return root.modules.plants.data.plants[0].id;
  if (page.startsWith('coffee')) return root.modules.coffee.data.entries[0].id;
  if (page === 'gameDetail') return root.modules.games.data.sessions.find(item => item.status === 'completed').id;
  if (page.startsWith('game')) return root.modules.games.data.sessions.find(item => item.status === 'active').id;
  if (page === 'pianoReference') return DESTINATIONS.find(item => item.activity === 'theory').id;
  return DESTINATIONS.find(item => item.activity === 'practice').id;
}

export function widthRoutes(root) {
  const registered = Object.entries(paths).map(([page, pattern]) => ({
    page, url: href({ page, id: pattern.includes(':id') ? sampleId(page, root) : undefined }, '/daily/'),
  }));
  const piano = DESTINATIONS.map(item => {
    const pages = { course: 'piano', library: 'pianoLibrary', learn: 'pianoLearn' };
    const page = pages[item.id] ?? (item.activity === 'practice' ? 'pianoExercise' : 'pianoReference');
    const route = { page, url: href({ page, id: item.id }, '/daily/') };
    if (item.id === 'pentatonic.theory') route.redirect = '/daily/#/piano/reference/scales.theory';
    return route;
  });
  const lessons = LESSONS.map(lesson => ({ page: 'pianoLearn', url: href({ page: 'pianoLearn', query: { lesson: lesson.id } }, '/daily/') }));
  const all = [...registered, ...piano, ...lessons, { page: 'notFound', url: '/daily/#/not-a-route' }];
  return [...new Map(all.map(route => [route.url, route])).values()];
}
