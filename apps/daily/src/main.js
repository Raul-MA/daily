import { mountShell } from './shell/app.js';

const root = document.querySelector('#app');
if (!root) throw new Error('Missing application mount.');
mountShell(root, document.querySelector('meta[name="daily-base"]').content);
