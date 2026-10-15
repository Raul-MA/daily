import { DataConflictError } from '../../../../packages/data/src/errors.js';
import { getPlant, addCareLog, addCareLogAndSetNextDue } from '../store/store.js';
import { generateId, nowUTC, today, dateInputToUTC, addDays } from '../utils/utils.js';
import { getNextDueDate } from '../care/care.js';
import { openWateringReminderInThings } from '../integrations/things.js';
import { el, field, submit, button, save } from './elements.js';

function careEntry(context, form, type, action) {
  const data = new FormData(form);
  const note = data.get('note').trim();
  const entry = { id: generateId(), type, date: dateInputToUTC(data.get('date')), note };
  if (action === 'skip') {
    const days = Number.parseInt(data.get('days'), 10);
    if (!Number.isFinite(days) || days < 1) throw new Error('Invalid days.');
    return { entry: { ...entry, type: 'skip', careType: type, date: nowUTC(), note: `${context.copy[type]}: ${days}d. ${note}` }, due: addDays(today(), days) };
  }
  if (action === 'next') {
    const due = data.get('next');
    if (!due) throw new Error('Missing care date.');
    return { entry: { ...entry, type: 'reschedule', careType: type, date: nowUTC(), note: `${context.copy[type]}: ${due}. ${note}` }, due };
  }
  return { entry, due: null };
}

function commitCare(context, form, type, action) {
  if (!getPlant(context.route.id)) throw new DataConflictError();
  const record = careEntry(context, form, type, action);
  if (type === 'note') addCareLog(context.route.id, record.entry);
  else addCareLogAndSetNextDue(context.route.id, record.entry, type, record.due);
  context.ui.care = null;
  context.render();
  if (type === 'watering' && action === 'record') {
    const updated = getPlant(context.route.id);
    const next = getNextDueDate(updated, 'watering');
    if (next) openWateringReminderInThings(updated.name, next);
  }
}

export function openCareForm(context, type, action = 'record') {
  context.ui.care = { type, action };
  context.host.querySelector('#plant-care-form')?.remove();
  for (const card of context.host.querySelectorAll('.care-action-wrap')) {
    card.classList.remove('is-open');
    card.querySelector('.care-action-btn').setAttribute('aria-expanded', 'false');
  }
  const form = el('form', 'care-log-form visible');
  form.id = 'plant-care-form';
  form.append(el('h3', '', context.copy[type]));
  if (action === 'skip') {
    const control = field('days', context.copy.skipDays, '3', 'number');
    control.querySelector('input').min = 1;
    control.querySelector('input').required = true;
    form.append(control);
  } else if (action === 'next') {
    const control = field('next', context.copy.nextCare, today(), 'date');
    control.querySelector('input').required = true;
    form.append(control);
  } else form.append(field('date', context.copy.careDate, today(), 'date'));
  form.append(field('note', context.copy.careNote, '', 'textarea'), button(context.copy.cancel, () => { context.ui.care = null; form.closest('.care-action-wrap').classList.remove('is-open'); form.closest('.care-action-wrap').querySelector('.care-action-btn').setAttribute('aria-expanded', 'false'); form.remove(); }), submit(context.copy.saveCare));
  form.onsubmit = event => { event.preventDefault(); save(context, form, () => commitCare(context, form, type, action)); };
  const card = context.host.querySelector(`.care-action-wrap[data-type="${type}"]`);
  card.classList.add('is-open');
  const actionButton = card.querySelector('.care-action-btn');
  actionButton.setAttribute('aria-expanded', 'true');
  actionButton.after(form);
  form.querySelector('input, textarea')?.focus();
}
