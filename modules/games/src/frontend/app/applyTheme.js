import { gameUI } from './context.js';
import { getState } from './state.js';

export function applyTheme(theme) { gameUI.host.dataset.theme = theme; gameUI.host.lang = getState().settings.language; }
