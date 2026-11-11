import { getPlant } from '../store/store.js';
import { getNextDueDate } from '../care/care.js';
import { getThingsSettings, buildThingsTodoURL, THINGS_PROJECT_NAME } from '../integrations/things.js';
import { el, button } from './elements.js';

export function promptNextReminder(context, type) {
  const { enabled, project } = getThingsSettings();
  if (!enabled || !['watering', 'soil', 'fertilizer'].includes(type)) return;
  const plant = getPlant(context.route.id);
  if (!plant) return;
  const date = getNextDueDate(plant, type);
  if (!date) return;
  const url = buildThingsTodoURL({ plant, type, date, project: project || THINGS_PROJECT_NAME, copy: context.copy });
  if (!url) return;
  const dialog = el('dialog', 'plant-dialog plant-things-prompt');
  dialog.setAttribute('aria-label', context.copy.thingsPrompt);
  dialog.setAttribute('aria-describedby', 'plant-things-prompt-description');
  const description = el('p', '', context.copy.thingsPromptMessage);
  description.id = 'plant-things-prompt-description';
  const reminder = el('p', 'plant-things-prompt-reminder');
  reminder.append(el('strong', '', `${context.copy[type]} — ${plant.name}`), el('br'), document.createTextNode(`${context.copy.next}: ${date}`));
  const dismiss = button(context.copy.thingsNotNow, () => dialog.close());
  dismiss.autofocus = true;
  const add = button(context.copy.thingsAdd, () => {
    dialog.close();
    location.assign(url);
  }, 'btn btn-primary');
  dialog.append(el('h2', '', context.copy.thingsPrompt), description, reminder, dismiss, add);
  dialog.onclose = () => {
    dialog.remove();
    context.host.querySelector(`.care-action-wrap[data-type="${type}"] .care-action-btn`)?.focus();
  };
  context.host.append(dialog);
  dialog.showModal();
}
