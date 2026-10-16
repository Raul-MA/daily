import { href } from '../../../packages/platform/src/router.js';
import { LESSONS } from './js/music/learning-path.js';

function item(text, target, base, marker) {
  const link = document.createElement('a');
  link.className = 'module-link';
  link.textContent = text;
  link.href = href(target, base);
  link.setAttribute(marker, '');
  return link;
}
export function pianoWidget(service, language, base) {
  const node = document.createElement('div');
  try {
    const data = service.read();
    const spanish = language === 'es';
    node.append(item(spanish ? 'Ejercicio al azar' : 'Random exercise', { page: 'piano', query: { random: '1' } }, base, 'data-piano-random'));
    if (data.lastExerciseId) node.append(item(spanish ? 'Último ejercicio' : 'Last exercise', { page: 'pianoExercise', id: data.lastExerciseId }, base, 'data-piano-last'));
    if (data.practice) {
      const title = LESSONS.find(lesson => lesson.id === data.practice.lessonId).title;
      node.append(item(`${spanish ? 'Continuar' : 'Resume'}: ${title}`, { page: 'pianoLearn', query: { lesson: data.practice.lessonId } }, base, 'data-piano-practice'));
    }
  } catch { node.textContent = language === 'es' ? 'No se pudo leer el estado del piano.' : 'Could not read piano state.'; }
  return node;
}
