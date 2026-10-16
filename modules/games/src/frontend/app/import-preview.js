import { copy, message } from './copy.js';
import { gameUI } from './context.js';
import { getState } from './state.js';
import { showToast } from './showToast.js';
import { render } from './render.js';
import { applyResult } from './applyResult.js';

function downloadRecovery() {
  const url = URL.createObjectURL(new Blob([gameUI.service.exportRecovery()], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'daily-before-games-import.json';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function selectGameImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  let text;
  try { text = await file.text(); JSON.parse(text); }
  catch {
    showToast('Import failed. Choose a valid JSON backup.', 'error', 0);
    render();
    return;
  }
  try { showPreview(gameUI.service.previewImport(text)); }
  catch (error) { showToast(error.message, 'error', 0); render(); }
}
function button(label, key) {
  const node = document.createElement('button');
  node.textContent = label;
  node.type = 'button';
  node.dataset[key] = '';
  return node;
}
function showPreview(preview) {
  const spanish = getState().settings.language === 'es';
  const dialog = document.createElement('dialog');
  dialog.dataset.gamesImportPreview = '';
  dialog.dataset.unsaved = 'true';
  const heading = document.createElement('h2');
  heading.textContent = spanish ? 'Reemplazar datos de juegos' : copy("Replace game data");
  const counts = document.createElement('p');
  counts.textContent = `${preview.counts.players} ${spanish ? 'jugadores' : 'players'}, ${preview.counts.games} ${spanish ? 'juegos' : 'games'}, ${preview.counts.sessions} ${spanish ? 'sesiones' : 'sessions'}`;
  const recovery = button(spanish ? 'Descargar copia de recuperación' : copy("Download recovery backup"), 'gamesRecovery');
  const confirm = button(spanish ? 'Confirmar reemplazo' : copy("Confirm replacement"), 'gamesConfirmImport');
  const cancel = button(spanish ? 'Cancelar' : copy("Cancel"), 'gamesCancelImport');
  confirm.disabled = true;
  recovery.addEventListener('click', () => { downloadRecovery(); confirm.disabled = false; });
  cancel.addEventListener('click', () => dialog.close());
  confirm.addEventListener('click', () => confirmImport(preview, dialog));
  dialog.addEventListener('close', () => { dialog.remove(); document.dispatchEvent(new Event('daily:form-state')); });
  dialog.append(heading, counts, recovery, confirm, cancel);
  gameUI.host.append(dialog);
  dialog.showModal();
  document.dispatchEvent(new Event('daily:form-state'));
}
function confirmImport(preview, dialog) {
  try {
    gameUI.service.applyImport(preview);
    dialog.close();
    applyResult({ data: getState(), errors: [] }, 'Backup imported.');
  } catch (error) {
    const alert = document.createElement('p');
    alert.setAttribute('role', 'alert');
    alert.textContent = message(error.message);
    dialog.append(alert);
  }
}
