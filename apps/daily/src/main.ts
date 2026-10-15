import { mountShell } from './shell/app.ts';
import './shell/style.css';

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Missing application mount.');
const cleanup = mountShell(root, import.meta.env.BASE_URL);
if (import.meta.hot) import.meta.hot.dispose(cleanup);
