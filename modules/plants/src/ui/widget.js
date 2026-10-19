import { href } from '../../../../packages/platform/src/router.js';
import { plantText } from './copy.js';
import { pendingCare, statusText } from './list.js';
import { el, anchor } from './elements.js';

export function plantWidget(options) {
  const section = el('div', 'plant-widget-summary');
  const copy = plantText(options.language);
  try {
    const tasks = pendingCare(options.service.getPlants());
    if (!tasks.length) section.append(el('p', 'widget-note', copy.caughtUp));
    for (const { plant, type, info } of tasks) {
      section.append(anchor(`${plant.name} · ${copy[type]} · ${statusText(info, copy)}`, href({ page: 'plant', id: plant.id }, options.base), 'module-link'));
    }
  } catch {
    section.append(el('p', 'widget-note', copy.readError));
  }
  return section;
}
