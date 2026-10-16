import { LESSONS } from '../music/learning-path.js';
import { pianoContext } from '../context.js';

function clock(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
function entry(record, language) {
  const node = document.createElement('li');
  node.className = 'piano-record';
  node.dataset.pianoRecord = record.id;
  const title = document.createElement('strong');
  title.textContent = LESSONS.find(item => item.id === record.lessonId).title;
  const time = document.createElement('time');
  time.dateTime = new Date(record.completedAt).toISOString();
  time.textContent = new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(record.completedAt));
  const duration = document.createElement('span');
  const modes = language === 'es' ? ['Con piano', 'Sin piano'] : ['At the piano', 'Away from the piano'];
  duration.textContent = `${clock(record.elapsedMs)} · ${record.piano ? modes[0] : modes[1]}`;
  node.append(title, time, duration);
  return node;
}
export function practiceHistory() {
  const language = document.documentElement.lang;
  const section = document.createElement('section');
  section.className = 'piano-history';
  const heading = document.createElement('h2');
  heading.textContent = language === 'es' ? 'Historial de práctica' : 'Practice history';
  section.append(heading);
  try {
    const history = pianoContext.service.read().history;
    const list = document.createElement('ol');
    list.append(...[...history].reverse().map(record => entry(record, language)));
    if (!history.length) list.textContent = language === 'es' ? 'Aún no hay prácticas terminadas.' : 'No completed practice yet.';
    section.append(list);
  } catch { section.append(language === 'es' ? 'No se pudo leer el historial.' : 'Could not read practice history.'); }
  return section;
}
