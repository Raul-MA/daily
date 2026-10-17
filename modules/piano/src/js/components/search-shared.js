import { copy } from '../../i18n.js';
import { LESSONS } from '../music/learning-path.js'
import { DESTINATION_SEARCH_ENTRIES, getDestination } from './navigation-data.js'
const SEARCH_INDEX = [
  ...LESSONS.map((lesson, index) => ({
    title: lesson.title,
    path: `${getDestination('learn').path}?lesson=${encodeURIComponent(lesson.id)}`,
    module: `Course · Lesson ${index + 1}`,
    keywords: `${lesson.objective} ${lesson.explanation}`,
  })),
  ...DESTINATION_SEARCH_ENTRIES,
]
function search(query) {
  if (!query || query.trim().length < 1) return []
  const q = normalized(query.trim())
  const results = []

  for (const source of SEARCH_INDEX) {
    const entry = localizedEntry(source);
    const titleMatch    = normalized(entry.title).includes(q)
    const moduleMatch   = normalized(entry.module).includes(q)
    const keywordMatch  = normalized(entry.keywords).includes(q)

    if (titleMatch || moduleMatch || keywordMatch) {
      results.push({ ...entry, score: resultScore(titleMatch, moduleMatch) })
    }
  }

  results.sort((a, b) => b.score - a.score)
  return results.slice(0, 8)
}
export { LESSONS, DESTINATION_SEARCH_ENTRIES, getDestination, SEARCH_INDEX, search };

function resultScore(titleMatch, moduleMatch) {
  if (titleMatch) return 2;
  return moduleMatch ? 1 : 0;
}

function normalized(text) { return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase(); }
function localizedEntry(entry) {
  const terms = entry.keywords.split(/\s+/).map(word => copy(word)).join(' ');
  return { ...entry, title: copy(entry.title), module: copy(entry.module), keywords: `${entry.keywords} ${copy(entry.keywords)} ${terms}` };
}
