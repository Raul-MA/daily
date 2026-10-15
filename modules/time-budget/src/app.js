import { methods } from './methods/index.js';
import { initialState } from './initial-state.js';
import * as persistence from './persistence.js';

export function createTimeApp(options = {}) {
  return { ...methods, ...persistence, state: initialState(), dom: options.dom ?? globalThis.document, ...options };
}
