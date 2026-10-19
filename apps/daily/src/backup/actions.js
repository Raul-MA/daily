import { downloadJSON } from '../../../../packages/ui/src/download.js';
import { backupError } from './copy.js';

function failed(context, error) { context.ui.message = backupError(error); context.draw(); }
export function cancelBackup(context) {
  context.ui.job++;
  context.ui.preview = null;
  context.ui.hasFile = false;
  context.ui.recovery = false;
  context.ui.message = '';
  context.form.querySelector('#daily-backup-file').value = '';
  context.draw();
}
export async function selectBackup(context) {
  const file = context.form.querySelector('#daily-backup-file').files[0];
  if (!file) return;
  const job = ++context.ui.job;
  Object.assign(context.ui, { hasFile: true, preview: null, recovery: false, message: '' });
  context.draw();
  try {
    const input = await file.text();
    if (context.signal.aborted || context.ui.job !== job) return;
    context.ui.preview = context.service.previewImport(input);
    context.draw();
  } catch (error) { if (!context.signal.aborted && context.ui.job === job) failed(context, error); }
}
function exportBackup(context) {
  downloadJSON(context.service.exportBackup(), 'daily-backup.json');
  context.ui.message = 'exported';
  context.draw();
}
function recovery(context) {
  downloadJSON(context.service.exportRecovery(), 'daily-recovery.json');
  context.ui.recovery = Boolean(context.ui.preview);
  context.ui.message = 'recoverySaved';
  context.draw();
}
function confirm(context) {
  if (!context.ui.preview || !context.ui.recovery) return;
  try { context.restore(context.ui.preview); }
  catch (error) {
    if (error.rootApplied) { context.replaced('cleanup'); return; }
    failed(context, error);
    return;
  }
  context.replaced('success');
}
export function bindBackup(context) {
  const options = { signal: context.signal };
  const guard = action => () => { try { action(context); } catch (error) { failed(context, error); } };
  context.form.addEventListener('submit', event => event.preventDefault(), options);
  context.form.querySelector('#daily-backup-file').addEventListener('change', () => selectBackup(context), options);
  for (const [id, action] of Object.entries({ export: exportBackup, recovery, confirm, cancel: cancelBackup })) {
    context.form.querySelector(`#daily-backup-${id}`).addEventListener('click', guard(action), options);
  }
}
