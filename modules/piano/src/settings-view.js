function labels(language) {
  if (language === 'es') return { title: 'Ajustes de Piano', minutes: 'Minutos (3–120)', piano: 'Al piano', save: 'Guardar ajustes de Piano', saved: 'Guardado en este dispositivo.', note: 'Valores para nuevas sesiones de práctica. El tempo, los bucles y el sonido se ajustan en cada ejercicio.', error: 'No se pudo guardar. Se conserva tu borrador.', conflict: 'Los datos cambiaron en otra vista. Se conserva tu borrador.' };
  return { title: 'Piano settings', minutes: 'Minutes (3–120)', piano: 'At the piano', save: 'Save Piano settings', saved: 'Saved on this device.', note: 'Defaults for new practice sessions. Tempo, loops and sound are adjusted inside each exercise.', error: 'Could not save. Your draft has been kept.', conflict: 'Data changed in another view. Your draft has been kept.' };
}
function field(title, id, type) {
  const label = document.createElement('label');
  label.textContent = title;
  const input = document.createElement('input');
  Object.assign(input, { id, name: id, type });
  label.append(input);
  return { label, input };
}
export function mountPianoSettings(options) {
  const copy = labels(options.service.language());
  const node = document.createElement('section');
  node.dataset.module = 'piano';
  node.className = 'app-settings-page';
  const title = document.createElement('h1');
  title.textContent = copy.title;
  title.tabIndex = -1;
  const note = document.createElement('p');
  note.textContent = copy.note;
  const form = document.createElement('form');
  form.id = 'piano-settings-form';
  const minutes = field(copy.minutes, 'piano-settings-minutes', 'number');
  Object.assign(minutes.input, { min: '3', max: '120', step: '1', required: true });
  const piano = field(copy.piano, 'piano-settings-at-piano', 'checkbox');
  let data = options.ui.pianoSettingsData ?? options.service.read();
  minutes.input.value = data.settings.minutes;
  piano.input.checked = data.settings.piano;
  const save = document.createElement('button');
  save.type = 'submit';
  save.textContent = copy.save;
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  form.append(minutes.label, piano.label, save, status);
  form.addEventListener('submit', event => {
    event.preventDefault();
    try {
      const settings = { minutes: Number(minutes.input.value), piano: piano.input.checked };
      data = options.service.save({ ...data, settings });
      form.dataset.unsaved = 'false';
      delete options.ui.pianoSettingsData;
      status.textContent = copy.saved;
      document.dispatchEvent(new Event('daily:form-state'));
    } catch { form.dataset.unsaved = 'true'; status.textContent = copy.error; }
  });
  node.append(title, note, form);
  return {
    node,
    dispose: () => { if (form.dataset.unsaved === 'true') options.ui.pianoSettingsData = data; },
    conflict: () => { status.textContent = copy.conflict; },
  };
}
