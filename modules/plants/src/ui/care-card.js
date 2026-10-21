import { getStatus, getEffectiveFertilizerInterval, getEffectiveWateringInterval } from '../care/care.js';
import { el, button, announce } from './elements.js';
import { openCareForm } from './care-form.js';
import { statusText } from './list.js';
import { buildThingsShortcutURL, getThingsSettings } from '../integrations/things.js';

function intervalLabel(plant, type, copy) {
  if (type === 'watering') return `${copy.every} ${getEffectiveWateringInterval(plant)} ${copy.days}`;
  if (type === 'soil') return `${copy.every} ${plant.schedule.soilIntervalMonths ?? 12} ${copy.months}`;
  const weeks = getEffectiveFertilizerInterval(plant);
  return weeks === null ? copy.paused : `${copy.every} ${weeks} ${copy.weeks}`;
}

function quickActions(context, type) {
  const section = el('div', 'care-quick-actions');
  const skip = button(context.copy.skipShort, () => openCareForm(context, type, 'skip'), 'btn btn-ghost btn-sm');
  skip.setAttribute('aria-label', context.copy.skipAction[type]);
  const next = button(context.copy.nextShort, () => openCareForm(context, type, 'next'), 'btn btn-ghost btn-sm');
  next.setAttribute('aria-label', context.copy.nextAction[type]);
  section.append(skip, next);
  return section;
}

function thingsAction(context, plant, type, info) {
  const action = button(context.copy.thingsAdd, () => {
    const { project } = getThingsSettings();
    if (!project) return announce(context, context.copy.thingsMissing, true);
    location.assign(buildThingsShortcutURL({ title: `${context.copy[type]} — ${plant.name}`, date: info.nextDue, project }));
  }, 'btn btn-ghost btn-sm plant-things-action');
  action.setAttribute('aria-label', `${context.copy.thingsAdd}: ${context.copy[type]} — ${plant.name}`);
  return action;
}

export function careCard(context, plant, type) {
  const info = getStatus(plant, type);
  const card = el('section', 'care-action-wrap');
  card.dataset.type = type;
  const action = button('', () => openCareForm(context, type), 'care-action-btn');
  action.setAttribute('aria-label', context.copy.record[type]);
  action.setAttribute('aria-expanded', 'false');
  const emoji = { watering: '💧', soil: '🌱', fertilizer: '🌿' };
  const label = el('span', 'care-label');
  label.append(el('strong', '', context.copy[type]), el('small', 'care-interval', intervalLabel(plant, type, context.copy)), el('small', '', `${context.copy.last}: ${info.lastDate || context.copy.never}`));
  if (info.nextDue) label.append(el('small', '', `${context.copy.next}: ${info.nextDue}`));
  const meta = el('span', 'care-action-meta');
  meta.append(el('span', `pill pill-${info.status}`, statusText(info, context.copy)));
  action.append(el('span', 'care-icon', emoji[type]), label, meta);
  const quick = quickActions(context, type);
  if (info.days > 0) quick.append(thingsAction(context, plant, type, info));
  card.append(action, quick);
  return card;
}
