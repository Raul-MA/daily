import { getThingsSettings, saveThingsSettings, THINGS_PROJECT_NAME, buildThingsProjectURL } from '../integrations/things.js';
import { el, field, submit, save, announce, button } from './elements.js';

export function thingsSettings(context) {
  const section = el('section', 'settings-section');
  section.append(el('h2', 'settings-section-label', 'Things 3'), el('p', '', context.copy.thingsSetup));
  const form = el('form');
  form.id = 'plant-things-settings';
  const project = field('project', context.copy.thingsProject, getThingsSettings().project || THINGS_PROJECT_NAME);
  project.querySelector('input').required = true;
  form.append(project, submit(context.copy.thingsSave));
  form.oninput = () => { form.dataset.unsaved = 'true'; };
  form.onsubmit = event => {
    event.preventDefault();
    const value = form.elements.namedItem('project').value.trim();
    if (!value) return announce(context, context.copy.thingsMissing, true);
    if (save(context, form, () => saveThingsSettings({ enabled: true, project: value }))) {
      form.elements.namedItem('project').value = value;
      announce(context, context.copy.saved);
    }
  };
  const create = button(context.copy.thingsCreate, () => {
    const value = form.elements.namedItem('project').value.trim();
    if (!value) return announce(context, context.copy.thingsMissing, true);
    location.assign(buildThingsProjectURL(value));
  }, 'btn btn-outline btn-sm');
  section.append(form, create);
  return section;
}
