import { addCareLog } from '../store/store.js';
import { generateId, today, dateInputToUTC } from '../utils/utils.js';
import { el, field, submit, save, announce } from './elements.js';

export function observation(context) {
  const form = el('form', 'detail-section');
  form.id = 'plant-observation-form';
  form.append(el('h2', 'detail-section-title', context.copy.note), field('note', context.copy.observationNote, '', 'textarea'), field('date', context.copy.observationDate, today(), 'date'), submit(context.copy.observe));
  const input = form.querySelector('textarea');
  input.required = true;
  input.maxLength = 10000;
  input.onkeydown = event => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); form.requestSubmit(); }
  };
  form.onsubmit = event => {
    event.preventDefault();
    save(context, form, () => {
      const data = new FormData(form);
      const note = data.get('note').trim();
      if (!note) throw new Error('Observation is required.');
      addCareLog(context.route.id, { id: generateId(), type: 'note', date: dateInputToUTC(data.get('date')), note });
      context.render();
      announce(context, context.copy.saved);
    });
  };
  return form;
}
