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
  const q = query.trim().toLowerCase()
  const results = []

  for (const entry of SEARCH_INDEX) {
    const titleMatch    = entry.title.toLowerCase().includes(q)
    const moduleMatch   = entry.module.toLowerCase().includes(q)
    const keywordMatch  = entry.keywords.toLowerCase().includes(q)

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
