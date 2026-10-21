import { updatePlantCareFromTemplates } from '../store/store.js';
import { PLANT_TEMPLATES } from '../plants/plant-templates.js';
import { el, button, announce, confirm } from './elements.js';
import { thingsSettings } from './things-settings.js';
import { backups } from './backup.js';

export function plantSettings(context) {
  const view = el('div', 'plant-settings-view');
  view.append(thingsSettings(context), backups(context));
  view.append(button(context.copy.refresh, () => confirm(context, { title: context.copy.refresh, message: context.copy.refreshMessage, affirm: context.copy.refresh }, () => {
    const result = updatePlantCareFromTemplates(PLANT_TEMPLATES);
    context.render();
    announce(context, context.copy.refreshDone.replace('{count}', result.updated));
  })));
  return view;
}
