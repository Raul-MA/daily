import { getPlants } from '../store/store.js';
import { getStatus, getUrgencyScore } from '../care/care.js';
import { href } from '../../../../packages/platform/src/router.js';
import { el, anchor } from './elements.js';

export const careTypes = ['watering', 'soil', 'fertilizer'];

export function pendingCare(plants) {
  return plants.flatMap(plant => careTypes.map(type => ({ plant, type, info: getStatus(plant, type) })))
    .filter(item => item.info.status === 'overdue' || item.info.days === 0).sort((a, b) => a.info.days - b.info.days);
}

export function statusText(info, copy) {
  if (info.status === 'paused') return copy.paused;
  if (info.status === 'neutral') return copy.never;
  if (info.days === 0) return copy.today;
  if (info.days < 0) return `${copy.overdue} ${Math.abs(info.days)}d`;
  return `${info.days}d`;
}

export function plantList(context) {
  const view = el('div', 'plant-list-view');
  const plants = getPlants().sort((a, b) => getUrgencyScore(b) - getUrgencyScore(a));
  if (!plants.length) {
    view.append(el('p', 'empty-state-text', context.copy.empty), anchor(context.copy.add, href({ page: 'plantNew' }, context.base), 'btn btn-primary'));
    return view;
  }
  view.append(el('h2', 'task-section-title', context.copy.due));
  const tasks = pendingCare(plants);
  for (const task of tasks) view.append(anchor(`${task.plant.name} · ${context.copy[task.type]} · ${statusText(task.info, context.copy)}`, href({ page: 'plant', id: task.plant.id }, context.base), 'task-row'));
  if (!tasks.length) view.append(el('p', 'task-caught-up', context.copy.caughtUp));
  view.append(el('h2', 'dashboard-plants-title', context.copy.all));
  const grid = el('div', 'plant-cards-grid');
  for (const plant of plants) grid.append(plantCard(plant, context));
  view.append(grid);
  return view;
}

function plantCard(plant, context) {
  const card = anchor('', href({ page: 'plant', id: plant.id }, context.base), 'plant-card');
  card.append(el('span', 'plant-card-icon', '🌿'));
  const body = el('div', 'plant-card-body');
  body.append(el('h3', 'plant-card-name', plant.name), el('p', 'plant-card-species', plant.commonName || plant.species || ''), el('p', 'plant-card-location', plant.location || ''));
  const pills = el('div', 'plant-card-pills');
  for (const type of careTypes) {
    const info = getStatus(plant, type);
    pills.append(el('span', `pill pill-${info.status}`, `${context.copy[type]} · ${statusText(info, context.copy)}`));
  }
  body.append(pills);
  card.append(body);
  return card;
}
