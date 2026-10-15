import { loadData } from '../../backend/core/storage.js';

export function getState() { return loadData(); }
export function setState(value) { return value; }
export function reloadState() { return loadData(); }
