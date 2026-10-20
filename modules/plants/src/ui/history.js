import { DataConflictError } from '../../../../packages/data/src/errors.js';
import { getPlant, updateCareLog, deleteCareLog } from '../store/store.js';
import { toLocalDateInput, dateInputToUTC } from '../utils/utils.js';
import { CARE_TYPES } from '../store/constants.js';
import { el, field, select, button, submit, confirm, save } from './elements.js';

function editEntry(context, entry, node) {
  context.ui.editEntry = entry.id;
  const form = el('form', 'tl-edit-form');
  form.id = `plant-entry-${entry.id}`;
  form.dataset.expectedEntry = JSON.stringify(entry);
  const options = [...CARE_TYPES].map(type => [type, context.copy[type]]);
  form.append(field('date', context.copy.entryDate, toLocalDateInput(entry.date), 'date'), select('type', context.copy.entryType, options, entry.type), field('note', context.copy.entryNote, entry.note || '', 'textarea'));
  form.append(button(context.copy.cancel, () => { context.ui.editEntry = null; context.render(); }), submit(context.copy.saveEntry));
  form.onsubmit = event => {
    event.preventDefault();
    save(context, form, () => {
      const current = getPlant(context.route.id).careLog.find(item => item.id === entry.id);
      if (JSON.stringify(current) !== form.dataset.expectedEntry) throw new DataConflictError();
      const data = new FormData(form);
      updateCareLog(context.route.id, entry.id, { type: data.get('type'), date: dateInputToUTC(data.get('date')), note: data.get('note').trim() });
      context.ui.editEntry = null;
      context.render();
    });
  };
  const cell = el('td');
  cell.colSpan = 4;
  cell.append(form);
  node.replaceChildren(cell);
  form.querySelector('textarea').focus();
}

function removeEntry(context, entry) {
  confirm(context, { title: context.copy.deleteQuestion, message: context.copy.deleteMessage, affirm: context.copy.confirmDelete }, () => {
    deleteCareLog(context.route.id, entry.id);
    context.render();
  });
}

export function history(context) {
  const section = el('section', 'timeline-section');
  section.append(el('h2', 'section-title', context.copy.history));
  const wrapper = el('div', 'care-history-scroll');
  const list = el('table', 'care-history-table');
  list.setAttribute('aria-label', context.copy.history);
  const head = el('thead');
  const headings = el('tr');
  for (const label of [context.copy.entryDate, context.copy.entryType, context.copy.entryNote, context.copy.actions]) {
    const cell = el('th', '', label);
    cell.scope = 'col';
    headings.append(cell);
  }
  head.append(headings);
  const body = el('tbody');
  list.append(head, body);
  const entries = [...getPlant(context.route.id).careLog].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  if (!entries.length) section.append(el('p', '', context.copy.noHistory));
  for (const entry of entries) {
    const node = el('tr', 'care-history-row');
    node.dataset.entryId = entry.id;
    const date = new Date(entry.date).toLocaleDateString(context.language);
    const actions = el('td', 'care-history-actions');
    actions.append(button(context.copy.editEntry, () => editEntry(context, entry, node), 'btn btn-ghost'), button(context.copy.deleteEntry, () => removeEntry(context, entry), 'btn btn-ghost'));
    node.append(el('td', '', date), el('td', '', context.copy[entry.type]), el('td', 'tl-note', entry.note || ''), actions);
    if (context.ui.editEntry === entry.id) editEntry(context, entry, node);
    body.append(node);
  }
  wrapper.append(list);
  if (entries.length) section.append(wrapper);
  return section;
}
