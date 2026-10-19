import { copy } from '../../../i18n.js';
import { buildKeyboardDiagramHTML } from '../keyboard-diagram.js';
import { getKeyboardVoicing } from '../../music/notes.js';
import { escapeHTML } from './format.js';
export function answerHTML(answer, specification) {
    const keyboard = specification?.tones.length ? getKeyboardVoicing(specification.tones, specification) : null
    return `<div class="practice-answer" role="region" aria-label="Revealed answer" tabindex="-1"><p>${copy(escapeHTML(answer))}</p>${copy(keyboard ? buildKeyboardDiagramHTML(keyboard.tones, { ...keyboard, label: 'One way to place these notes on the piano' }) : '')}</div>`
  }
