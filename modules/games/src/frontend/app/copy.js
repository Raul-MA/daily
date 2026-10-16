import { gameUI } from './context.js';
import { translate, translateMessage } from '../../backend/core/i18n.js';

export function currentLanguage() { return gameUI.host?.lang || 'en'; }

export function copy(text, params = {}) { return translate(currentLanguage(), text, params); }

export function message(text) { return translateMessage(currentLanguage(), text); }
