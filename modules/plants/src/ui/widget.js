import { plantText } from './copy.js';
import { pendingCare, careGroups } from './list.js';
import { el } from './elements.js';

export function plantWidget(options) {
  const section = el('div', 'plant-widget-summary');
  const copy = plantText(options.language);
  try {
    const tasks = pendingCare(options.service.getPlants());
    if (!tasks.length) section.append(el('p', 'widget-note', copy.caughtUp));
    section.append(careGroups({ ...options, copy }, tasks, 'module-link'));
  } catch {
    section.append(el('p', 'widget-note', copy.readError));
  }
  return section;
}
