import { currentLanguage } from './copy.js';
import { copy } from './copy.js';


export function formatDate(value, language = currentLanguage()) {
  if (!value) return copy("Unfinished");
  return new Intl.DateTimeFormat(language, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}
