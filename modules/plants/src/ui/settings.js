import { getThingsSettings, saveThingsSettings } from '../integrations/things.js';
import { updatePlantCareFromTemplates } from '../store/store.js';
import { PLANT_TEMPLATES } from '../plants/plant-templates.js';
import { el, field, checkbox, button, submit, announce, confirm, save } from './elements.js';
import { backups } from './backup.js';

function thingsForm(context) {
  const settings = getThingsSettings();
  const form = el('form', 'things-settings-card');
  form.id = 'plant-things-form';
  form.append(el('h2', 'settings-section-label', 'Things 3'), checkbox('enabled', context.copy.thingsEnabled, settings.enabled), field('project', context.copy.project, settings.project));
  const project = form.elements.namedItem('project');
  project.maxLength = 500;
  project.required = settings.enabled;
  form.elements.namedItem('enabled').onchange = event => { project.required = event.target.checked; };
  const help = el('details', 'things-setup');
  help.append(el('summary', '', 'Stillgreen to Things'), el('p', '', context.copy.thingsHelp));
  form.append(help, submit(context.copy.thingsSave));
  form.onsubmit = event => {
    event.preventDefault();
    if (!save(context, form, () => saveThingsSettings({ enabled: form.elements.namedItem('enabled').checked, project: project.value }))) return;
    context.render();
    announce(context, context.copy.saved);
  };
  return form;
}

export function plantSettings(context) {
  const view = el('div', 'plant-settings-view');
  view.append(backups(context), thingsForm(context));
  view.append(button(context.copy.refresh, () => confirm(context, { title: context.copy.refresh, message: context.copy.refreshMessage, affirm: context.copy.refresh }, () => {
    const result = updatePlantCareFromTemplates(PLANT_TEMPLATES);
    context.render();
    announce(context, context.copy.refreshDone.replace('{count}', result.updated));
  })));
  return view;
}
