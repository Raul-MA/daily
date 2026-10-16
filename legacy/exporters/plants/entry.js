import { exportLegacyPlants } from './export.js';

const copy = {
  en: { title: 'Export plants for Daily', 'language-label': 'Language', preview: 'Preview saved data', download: 'Download migration backup', back: 'Back to Plants',
    explain: 'Includes plant records, care history, manual care dates and Things preferences. Import this file in Daily → Plants → Plant settings.',
    privacy: 'Original records and recovery copies stay on this device. Other apps and credentials are excluded. Keep the original installation and this backup.',
    counts: '{plants} plant(s).', project: 'Things reminders: {project}', off: 'Things reminders are off.', recovery: 'This export reads a saved recovery copy because the primary records could not be read. Original storage is kept unchanged.',
    invalid: 'Saved data is invalid, unsupported or could not be read. Nothing was changed. Return to the original app to inspect its data.', downloaded: 'Migration backup downloaded. Original records and preferences were kept.' },
  es: { title: 'Exportar plantas para Daily', 'language-label': 'Idioma', preview: 'Vista previa de datos guardados', download: 'Descargar copia de migración', back: 'Volver a Plantas',
    explain: 'Incluye las plantas, historial de cuidados, fechas manuales y preferencias de Things. Importa el archivo en Daily → Plantas → Ajustes de plantas.',
    privacy: 'Los registros originales y las copias de recuperación se conservan en este dispositivo. Se excluyen otras aplicaciones y credenciales. Conserva la instalación original y esta copia.',
    counts: '{plants} planta(s).', project: 'Recordatorios de Things: {project}', off: 'Los recordatorios de Things están desactivados.', recovery: 'Se exporta una copia de recuperación guardada porque no se pudieron leer los registros principales. El almacenamiento original se conserva sin cambios.',
    invalid: 'Los datos guardados no son válidos o compatibles, o no se pudieron leer. No se ha cambiado nada. Vuelve a la aplicación original para revisar sus datos.', downloaded: 'Copia de migración descargada. Se conservaron los registros y preferencias originales.' },
};
const language = document.getElementById('language');
const state = { file: null, message: '' };
function drawData(text, data) {
  document.getElementById('counts').textContent = data ? text.counts.replace('{plants}', data.plants.length) : '';
  document.getElementById('project').textContent = '';
  document.getElementById('recovery').hidden = true;
  if (!data) return;
  document.getElementById('project').textContent = data.things.enabled ? text.project.replace('{project}', data.things.project) : text.off;
  document.getElementById('recovery').textContent = text.recovery;
  document.getElementById('recovery').hidden = !data.recoverySource || data.recoverySource === 'plantTracker_plants';
}
function draw() {
  const text = copy[language.value];
  document.documentElement.lang = language.value;
  document.title = text.title;
  for (const id of ['title', 'language-label', 'preview', 'download', 'back', 'explain', 'privacy']) document.getElementById(id).textContent = text[id];
  document.getElementById('download').disabled = !state.file;
  document.getElementById('status').textContent = text[state.message] ?? '';
  drawData(text, state.file ? JSON.parse(state.file) : null);
}
function preview() {
  state.file = null;
  state.message = '';
  try { state.file = exportLegacyPlants(localStorage); }
  catch { state.message = 'invalid'; }
  draw();
}
function download() {
  preview();
  if (!state.file) return;
  const url = URL.createObjectURL(new Blob([state.file], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'plants-daily-migration.json';
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
