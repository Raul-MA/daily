import { checkReadwise } from './connections.js';
import { messages } from './messages.js';
function element(selector) {
    const node = document.querySelector(selector);
    if (!node)
        throw new Error(`Missing diagnostic control: ${selector}`);
    return node;
}
const language = element('#language');
const input = element('#token');
const button = element('button');
const status = element('#status');
let state = 'idle';
let checks = [];
function dictionary() {
    return language.value === 'es' ? messages.es : messages.en;
}
function render() {
    const copy = dictionary();
    document.documentElement.lang = language.value;
    document.title = copy.title;
    for (const node of document.querySelectorAll('[data-copy]')) {
        const key = node.dataset.copy;
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
    }
    catch {
        state = 'error';
    }
    finally {
        button.disabled = false;
        render();
    }
}
language.value = navigator.language.startsWith('es') ? 'es' : 'en';
language.addEventListener('change', render);
element('#checks').addEventListener('submit', event => {
    event.preventDefault();
    if (state !== 'running')
        void run();
});
render();
