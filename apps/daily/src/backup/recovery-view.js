import { shellText } from '../../../../packages/i18n/src/shell.js';
import { element, heading, link } from '../shell/elements.js';
import { mountDailyBackup } from './view.js';

export function mountStorageRecovery(options) {
  const copy = shellText(options.language);
  document.documentElement.lang = options.language;
  const host = element('main', 'storage-failure');
  host.append(heading(copy.storageTitle), element('p', '', copy.storageError));
  host.append(element('p', '', options.language === 'es'
    ? 'La copia de recuperación conserva los datos ilegibles. Para restaurar, selecciona una copia completa de Daily.'
    : 'The recovery file preserves unreadable data. To restore, select a full Daily backup.'));
  const ui = {};
  const page = mountDailyBackup({ ...options, ui, recoveryOnly: true });
  host.append(page.node, link(copy.diagnostic, `${options.base}diagnostics.html`));
  return {
    node: host,
    dispose: page.dispose,
    conflict: () => { const status = host.querySelector('#daily-backup-status'); status.textContent = options.language === 'es' ? 'Los datos cambiaron. Cancela y selecciona de nuevo la copia.' : 'Stored data changed. Cancel and select the backup again.'; },
  };
}
