import { copy } from '../../i18n.js';
import { createPracticeSession } from '../components/practice-session.js';
import { pianoContext } from '../context.js';

export default function render(container) {
  const query = new URLSearchParams(window.location.hash.split('?')[1] || '');
  let lessonId = query.get('lesson');
  if (query.has('activity')) {
    const current = pianoContext.service.read().practice;
    if (!current || current.id !== query.get('activity')) {
      container.innerHTML = copy(`<h1>${copy("This practice is no longer active.")}</h1><a href="#/">${copy("Choose a lesson")}</a>`);
      return undefined;
    }
    lessonId = current.lessonId;
  }
  return createPracticeSession(container, lessonId);
}
