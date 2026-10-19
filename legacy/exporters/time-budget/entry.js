import { exportLegacyBudget } from './export.js';

const copy = {
  en: { title: 'Export Time Budget for Daily', 'language-label': 'Language', preview: 'Preview saved data', download: 'Download migration backup', back: 'Back to Time Budget',
    explain: 'Includes saved templates and the current session. Timers keep their original timestamps and may already be overdue. Import this file in Daily → Time Budget.',
    privacy: 'Exports saved Time Budget data. Original records stay on this device; other apps and credentials are excluded. Keep the original installation and this backup.',
    counts: '{templates} template(s), {sessions} current session, {tasks} task(s).', invalid: 'Saved data is invalid or could not be read. Nothing was changed. Return to the original app to inspect its data.', downloaded: 'Migration backup downloaded. The original data was kept.' },
  es: { title: 'Exportar Time Budget para Daily', 'language-label': 'Idioma', preview: 'Vista previa de datos guardados', download: 'Descargar copia de migración', back: 'Volver a Time Budget',
    explain: 'Incluye las plantillas guardadas y la sesión actual. Los temporizadores conservan sus horas originales y pueden mostrar tiempo excedido. Importa el archivo en Daily → Time Budget.',
    privacy: 'Exporta los datos guardados de Time Budget. Los registros originales se conservan en este dispositivo; se excluyen otras aplicaciones y credenciales. Conserva la instalación original y esta copia.',
    counts: '{templates} plantilla(s), {sessions} sesión actual, {tasks} tarea(s).', invalid: 'Los datos guardados no son válidos o no se pudieron leer. No se ha cambiado nada. Vuelve a la aplicación original para revisar sus datos.', downloaded: 'Copia de migración descargada. Se conservaron los datos originales.' },
};
const language = document.getElementById('language');
const state = { file: null, message: '' };
function draw() {
  const text = copy[language.value];
  document.documentElement.lang = language.value;
  document.title = text.title;
  for (const id of ['title', 'language-label', 'preview', 'download', 'back', 'explain', 'privacy']) document.getElementById(id).textContent = text[id];
  document.getElementById('download').disabled = !state.file;
  document.getElementById('status').textContent = text[state.message] ?? '';
  const data = state.file ? JSON.parse(state.file) : null;
  document.getElementById('counts').textContent = data ? text.counts.replace('{templates}', Object.keys(data.templates).length).replace('{sessions}', data.session ? 1 : 0).replace('{tasks}', data.session?.tasks.length ?? 0) : '';
}
function preview() {
  state.file = null;
  state.message = '';
  try { state.file = exportLegacyBudget(localStorage); }
  catch { state.message = 'invalid'; }
  draw();
}
function download() {
  preview();
  if (!state.file) return;
  const url = URL.createObjectURL(new Blob([state.file], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'time-budget-daily-migration.json';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  state.message = 'downloaded';
  draw();
}
language.value = navigator.language.startsWith('es') ? 'es' : 'en';
language.addEventListener('change', draw);
document.getElementById('preview').addEventListener('click', preview);
document.getElementById('download').addEventListener('click', download);
draw();
