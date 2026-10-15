import { DataConflictError } from '../../../../packages/data/src/errors.js';
import { getPlant, addPlant, updatePlant, requestPersistentStorage } from '../store/store.js';
import { generateId, nowUTC } from '../utils/utils.js';
import { PLANT_TEMPLATES } from '../plants/plant-templates.js';
import { href } from '../../../../packages/platform/src/router.js';
import { el, field, select, checkbox, submit, anchor, save } from './elements.js';

function identity(context, plant) {
  const section = el('section', 'form-section');
  const data = plant || {};
  section.append(el('h2', 'form-section-title', context.copy.identity));
  for (const name of ['name', 'commonName', 'species', 'location']) {
    const control = field(name, context.copy[name], data[name] || '');
    const input = control.querySelector('input');
    input.maxLength = name === 'name' ? 500 : 10000;
    input.required = name === 'name';
    section.append(control);
  }
  section.append(rating(context, data.difficulty || 0), field('notes', context.copy.notes, data.notes || '', 'textarea'));
  return section;
}

function rating(context, value) {
  const section = el('fieldset', 'star-rating');
  section.append(el('legend', 'form-label', context.copy.difficulty));
  const input = el('input');
  input.type = 'hidden';
  input.name = 'difficulty';
  input.value = value;
  section.append(input);
  for (let i = 1; i <= 5; i++) {
    const star = el('button', `star-btn${i <= value ? ' active' : ''}`, '★');
    star.type = 'button';
    star.dataset.value = i;
    star.setAttribute('aria-label', `${context.copy.difficulty}: ${i}/5`);
    star.setAttribute('aria-pressed', String(i <= value));
    star.onclick = () => { input.value = i; refreshRating(section, i); input.dispatchEvent(new Event('input', { bubbles: true })); };
    section.append(star);
  }
  return section;
}

function refreshRating(section, value) {
  for (const node of section.querySelectorAll('.star-btn')) {
    const selected = Number(node.dataset.value) <= Number(value);
    node.classList.toggle('active', selected);
    node.setAttribute('aria-pressed', String(selected));
  }
}

function interval(seasons, start, key, fallback) {
  return seasons.find(item => item.startMonth === start)?.[key] ?? fallback;
}
function wateringValues(schedule) {
  const seasons = schedule.wateringSeasons || [];
  return { waterDry: interval(seasons, 10, 'intervalDays', schedule.wateringIntervalDays ?? 14), waterGrow: interval(seasons, 3, 'intervalDays', schedule.wateringIntervalDays ?? 7) };
}
function fertilizerValues(schedule) {
  const seasons = schedule.fertilizerSeasons || [];
  return { fertGrow: interval(seasons, 3, 'intervalWeeks', schedule.fertilizerIntervalWeeks ?? 4), fertPause: seasons.some(item => item.intervalWeeks === null) };
}
function scheduleValues(schedule = {}) {
  return { ...wateringValues(schedule), ...fertilizerValues(schedule), soilMonths: schedule.soilIntervalMonths ?? 12 };
}

function schedule(context, plant) {
  const section = el('section', 'form-section');
  section.append(el('h2', 'form-section-title', context.copy.schedule));
  const values = scheduleValues(plant?.schedule);
  for (const [name, max] of [['waterDry', 365], ['waterGrow', 365], ['soilMonths', 120], ['fertGrow', 52]]) {
    const control = field(name, context.copy[name], values[name], 'number');
    const input = control.querySelector('input');
    input.min = 1;
    input.max = max;
    section.append(control);
  }
  section.append(checkbox('fertPause', context.copy.fertPause, values.fertPause));
  return section;
}

function applyTemplate(form, id) {
  const template = PLANT_TEMPLATES.find(item => item.id === id);
  if (!template) return;
  const values = { ...scheduleValues(template.schedule), commonName: template.label, species: template.species, notes: template.notes, difficulty: template.difficulty, templateId: template.id };
  for (const [name, value] of Object.entries(values)) {
    const input = form.elements.namedItem(name);
    if (input.type === 'checkbox') input.checked = value;
    else input.value = value;
  }
  refreshRating(form, template.difficulty);
}

function numeric(data, key, fallback, maximum) { return Math.min(maximum, Math.max(1, Number.parseInt(data.get(key), 10) || fallback)); }
function scheduleData(data, existing) {
  const dry = numeric(data, 'waterDry', 14, 365);
  const grow = numeric(data, 'waterGrow', 7, 365);
  const weeks = numeric(data, 'fertGrow', 4, 52);
  return {
    wateringIntervalDays: grow, wateringSeasons: [{ startMonth: 10, endMonth: 2, intervalDays: dry }, { startMonth: 3, endMonth: 9, intervalDays: grow }],
    soilIntervalMonths: numeric(data, 'soilMonths', 12, 120), fertilizerIntervalWeeks: weeks,
    fertilizerSeasons: [{ startMonth: 3, endMonth: 8, intervalWeeks: weeks }, { startMonth: 9, endMonth: 2, intervalWeeks: data.has('fertPause') ? null : weeks }],
    nextDueOverrides: existing?.schedule.nextDueOverrides,
  };
}
function savePlant(context, form, existing) {
  if (existing && JSON.stringify(getPlant(existing.id)) !== form.dataset.expectedPlant) throw new DataConflictError();
  const data = new FormData(form);
  const values = Object.fromEntries(['name', 'commonName', 'species', 'location', 'notes', 'templateId'].map(key => [key, data.get(key).trim()]));
  const record = { ...values, difficulty: Number(data.get('difficulty')), schedule: scheduleData(data, existing) };
  const id = existing?.id || generateId();
  if (existing) updatePlant(id, record);
  else {
    addPlant({ ...record, id, dateAdded: nowUTC(), careLog: [] });
    void requestPersistentStorage().catch(() => undefined);
  }
  location.assign(href({ page: 'plant', id }, context.base));
}

export function plantForm(context) {
  const existing = context.route.page === 'plantEdit' ? getPlant(context.route.id) : null;
  if (context.route.page === 'plantEdit' && !existing) return el('p', '', context.copy.missing);
  const form = el('form', 'plant-form');
  form.id = 'plant-form';
  if (existing) form.dataset.expectedPlant = JSON.stringify(existing);
  const templateId = el('input');
  templateId.type = 'hidden';
  templateId.name = 'templateId';
  templateId.value = existing?.templateId || '';
  form.append(templateId);
  if (!existing) {
    const options = [['', context.copy.manual], ...PLANT_TEMPLATES.map(item => [item.id, item.label])];
    const template = select('template', context.copy.template, options, '');
    template.querySelector('select').onchange = event => applyTemplate(form, event.target.value);
    form.append(template);
  }
  form.append(identity(context, existing), schedule(context, existing));
  form.append(formActions(context, existing));
  form.onsubmit = event => { event.preventDefault(); save(context, form, () => savePlant(context, form, existing)); };
  return form;
}

function formActions(context, existing) {
  const actions = el('div', 'form-actions');
  const route = existing ? { page: 'plant', id: existing.id } : { page: 'plants' };
  actions.append(anchor(context.copy.cancel, href(route, context.base)), submit(existing ? context.copy.save : context.copy.add));
  return actions;
}
