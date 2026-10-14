import { checkReadwise } from './readwise';
import type { Check } from './readwise';
import { messages } from './messages';

function element<T extends HTMLElement>(selector: string): T {
  const node = document.querySelector<T>(selector);
  if (!node) throw new Error(`Missing diagnostic control: ${selector}`);
  return node;
}

const language = element<HTMLSelectElement>('#language');
const input = element<HTMLInputElement>('#token');
const button = element<HTMLButtonElement>('button');
const status = element('#status');
let state: 'idle' | 'running' | 'finished' | 'error' = 'idle';
let checks: Check[] = [];

function dictionary() {
  return language.value === 'es' ? messages.es : messages.en;
}

function render() {
  const copy = dictionary();
  document.documentElement.lang = language.value;
  document.title = copy.title;
  for (const node of document.querySelectorAll<HTMLElement>('[data-copy]')) {
    const key = node.dataset.copy as keyof typeof copy;
    node.textContent = copy[key];
  }
  const originLabel = location.origin === 'https://raul-ma.github.io' ? copy.target : copy.other;
  element('#origin').textContent = `${copy.origin}: ${location.origin}. ${originLabel}`;
  status.textContent = copy[state];
  const rows = checks.map(check => {
    const row = document.createElement('tr');
    for (const value of [check.id, String(check.status ?? '—'), copy[check.outcome]]) {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    }
    return row;
  });
  element('#results').replaceChildren(...rows);
}

async function run() {
  const token = input.value;
  input.value = '';
  button.disabled = true;
  checks = [];
  state = 'running';
  render();
  try {
    checks = (await checkReadwise(token, { origin: location.origin })).checks;
    state = 'finished';
  } catch {
    state = 'error';
  } finally {
    button.disabled = false;
    render();
  }
}

language.value = navigator.language.startsWith('es') ? 'es' : 'en';
language.addEventListener('change', render);
element<HTMLFormElement>('#checks').addEventListener('submit', event => {
  event.preventDefault();
  if (state !== 'running') void run();
});
render();
