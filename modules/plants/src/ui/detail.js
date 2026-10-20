import { getPlant, deletePlant } from '../store/store.js';
import { plantTemplates } from '../plants/localized.js';
import { href } from '../../../../packages/platform/src/router.js';
import { el, button, anchor, confirm } from './elements.js';
import { careCard } from './care-card.js';
import { observation } from './observation.js';
import { history } from './history.js';
import { careTypes } from './list.js';

function guide(plant, copy, language) {
  const template = plantTemplates(language).find(item => item.id === plant.templateId || item.species === plant.species);
  const section = el('details', 'care-guide');
  if (!template?.guide) return null;
  section.append(el('summary', '', copy.guide));
  const fields = [['water', 'waterGuide'], ['soil', 'soilGuide'], ['fertilizer', 'fertGuide'], ['light', 'light'], ['humidity', 'humidity']];
  for (const [field, label] of fields) {
    if (template.guide[field]) section.append(el('h3', '', copy[label]), el('p', '', template.guide[field]));
  }
  section.append(el('h3', '', copy.alerts));
  const list = el('ul');
  for (const alert of template.guide.alerts || []) list.append(el('li', '', alert));
  section.append(list);
  return section;
}

export function plantDetail(context) {
  const plant = getPlant(context.route.id);
  if (!plant) {
    const missing = el('p', '', context.copy.missing);
    const id = el('code', 'route-id', context.route.id);
    id.dataset.routeId = '';
    missing.append(id);
    return missing;
  }
  const view = el('div', 'detail-view plant-detail-content');
  view.append(metadata(plant));
  const actions = el('div', 'detail-actions');
  actions.append(anchor(context.copy.edit, href({ page: 'plantEdit', id: plant.id }, context.base)), button(context.copy.remove, () => confirm(context, { title: context.copy.deleteQuestion, message: context.copy.deleteMessage, affirm: context.copy.confirmDelete }, () => {
    deletePlant(plant.id);
    location.assign(href({ page: 'plants' }, context.base));
  })));
  view.append(actions, el('div', 'divider'));
  const cards = el('div', 'care-actions');
  for (const type of careTypes) cards.append(careCard(context, plant, type));
  view.append(cards, el('div', 'divider'));
  const careGuide = guide(plant, context.copy, context.language);
  if (careGuide) view.append(careGuide, el('div', 'divider'));
  view.append(observation(context), el('div', 'divider'), history(context));
  return view;
}

function metadata(plant) {
  const section = el('div');
  const species = plant.commonName || plant.species;
  if (species) section.append(el('p', 'detail-species', species));
  if (plant.location) section.append(el('p', 'detail-location', plant.location));
  if (plant.difficulty) section.append(el('p', 'detail-stars', '★'.repeat(plant.difficulty)));
  if (plant.notes) section.append(el('p', 'detail-notes', plant.notes));
  return section;
}
