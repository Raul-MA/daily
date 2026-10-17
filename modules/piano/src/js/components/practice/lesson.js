import { localizedLesson } from '../../../localized-lessons.js';
import { LESSONS } from '../../music/learning-path.js';
export function lesson() { return localizedLesson(LESSONS[this.lessonIndex]); }
