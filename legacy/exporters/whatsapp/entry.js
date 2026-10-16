import { exportLegacyWhatsApp } from './export.js';

const copy = {
  en: { title: 'Export WhatsApp for Daily', 'language-label': 'Language', preview: 'Preview saved draft', download: 'Download migration backup', back: 'Back to WhatsApp',
    explain: 'Includes the saved recipient, message and reminder date/time. Expired times stay unchanged. Import in Daily → WhatsApp, then check the date before creating a reminder.',
    privacy: 'Original data stays on this device. Other apps, credentials and previous handoff links are excluded. Keep the original installation and this backup.',
    counts: '{count} saved draft(s).', recipient: 'Recipient: {value}', time: 'Reminder: {value}', unset: 'Not set',
    invalid: 'The saved draft is invalid or could not be read. Nothing was changed. Return to the original app to inspect its data.', downloaded: 'Migration backup downloaded. The original draft was kept.' },
  es: { title: 'Exportar WhatsApp para Daily', 'language-label': 'Idioma', preview: 'Vista previa del borrador guardado', download: 'Descargar copia de migración', back: 'Volver a WhatsApp',
    explain: 'Incluye el destinatario, mensaje y fecha/hora del recordatorio guardados. Las fechas vencidas se conservan. Importa en Daily → WhatsApp y revisa la fecha antes de crear un recordatorio.',
    privacy: 'Los datos originales se conservan en este dispositivo. Se excluyen otras aplicaciones, credenciales y enlaces anteriores. Conserva la instalación original y esta copia.',
    counts: '{count} borrador(es) guardado(s).', recipient: 'Destinatario: {value}', time: 'Recordatorio: {value}', unset: 'Sin definir',
    invalid: 'Los datos del borrador no son válidos o no se pudieron leer. No se ha cambiado nada. Vuelve a la aplicación original para revisar sus datos.', downloaded: 'Copia de migración descargada. Se conservó el borrador original.' },
};
const language = document.getElementById('language');
const state = { file: null, message: '' };
function draftDetails(text, draft) {
  for (const id of ['draft-recipient', 'draft-time', 'draft-message']) document.getElementById(id).textContent = '';
  if (!draft) return;
  document.getElementById('draft-recipient').textContent = text.recipient.replace('{value}', draft.recipient || text.unset);
  document.getElementById('draft-time').textContent = text.time.replace('{value}', `${draft.date || text.unset} ${draft.time || text.unset}`);
  document.getElementById('draft-message').textContent = draft.message;
}
function draw() {
  const text = copy[language.value];
  document.documentElement.lang = language.value;
  document.title = text.title;
  for (const id of ['title', 'language-label', 'preview', 'download', 'back', 'explain', 'privacy']) document.getElementById(id).textContent = text[id];
  document.getElementById('download').disabled = !state.file;
  document.getElementById('status').textContent = text[state.message] ?? '';
  const data = state.file ? JSON.parse(state.file) : null;
  const count = data?.draft ? 1 : 0;
  document.getElementById('counts').textContent = data ? text.counts.replace('{count}', count) : '';
  draftDetails(text, data?.draft);
}
function preview() {
  state.file = null;
  state.message = '';
  try { state.file = exportLegacyWhatsApp(localStorage); }
  catch { state.message = 'invalid'; }
  draw();
}
function download() {
  preview();
  if (!state.file) return;
  const url = URL.createObjectURL(new Blob([state.file], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'whatsapp-daily-migration.json';
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
