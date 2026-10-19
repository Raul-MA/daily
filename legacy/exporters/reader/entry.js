import { exportLegacyReader } from './export.js';

const copy = {
  en: { title: 'Export Reader for Daily', 'language-label': 'Language', preview: 'Preview saved preferences', download: 'Download migration backup', back: 'Back to Reader',
    explain: 'Includes picker preferences and the optional remembered item. Import this file in Daily → Reader → Backups, then enter your token privately in Daily.',
    privacy: 'Original preferences stay on this device. Tokens, caches and article bodies are excluded. Keep the original installation and this backup.',
    counts: '{count} item(s) per pick.', remembered: 'Remembered item: {title}', none: 'No remembered item is included.',
    invalid: 'Saved preferences or the remembered item are invalid or could not be read. Nothing was changed. Return to the original app to inspect its data.', downloaded: 'Migration backup downloaded. Original preferences and credentials were kept.' },
  es: { title: 'Exportar Reader para Daily', 'language-label': 'Idioma', preview: 'Vista previa de preferencias', download: 'Descargar copia de migración', back: 'Volver a Reader',
    explain: 'Incluye las preferencias y la lectura recordada opcional. Importa el archivo en Daily → Reader → Copias de seguridad e introduce tu token de forma privada en Daily.',
    privacy: 'Las preferencias originales se conservan en este dispositivo. Se excluyen los tokens, cachés y cuerpos de artículos. Conserva la instalación original y esta copia.',
    counts: '{count} elemento(s) por selección.', remembered: 'Lectura recordada: {title}', none: 'No se incluye ninguna lectura recordada.',
    invalid: 'Las preferencias o la lectura recordada no son válidas o no se pudieron leer. No se ha cambiado nada. Vuelve a la aplicación original para revisar sus datos.', downloaded: 'Copia de migración descargada. Se conservaron las preferencias y credenciales originales.' },
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
  document.getElementById('counts').textContent = data ? text.counts.replace('{count}', data.settings.count) : '';
  document.getElementById('remembered').textContent = '';
  if (data) document.getElementById('remembered').textContent = data.lastItem ? text.remembered.replace('{title}', data.lastItem.title) : text.none;
}
function preview() {
  state.file = null;
  state.message = '';
  try { state.file = exportLegacyReader(localStorage); }
  catch { state.message = 'invalid'; }
  draw();
}
function download() {
  preview();
  if (!state.file) return;
  const url = URL.createObjectURL(new Blob([state.file], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'reader-daily-migration.json';
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
