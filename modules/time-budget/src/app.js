import { copy, message } from './i18n.js';
import { methods } from './methods/index.js';
import { initialState } from './initial-state.js';
import * as persistence from './persistence.js';

export function createTimeApp(options = {}) {
  return { copy, message, ui: {}, ...methods, ...persistence, state: initialState(), dom: options.dom ?? globalThis.document, ...options };
}
