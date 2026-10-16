import { t, translate } from '../../backend/core/i18n.js';
import { formatDate } from './formatDate.js';

export function getBackupReminderMessage(settings, language) {
  const base = t(language, 'backupReminder');
  if (!settings.lastExportedAt) return `${base} ${translate(language, 'Last export: never.')}`;
  const lastExported = new Date(settings.lastExportedAt);
  if (Number.isNaN(lastExported.getTime())) return `${base} ${translate(language, 'Last export: unknown.')}`;
  const daysSince = Math.max(0, Math.floor((Date.now() - lastExported.getTime()) / 86400000));
  const dayLabel = translate(language, daysSince === 1 ? 'day' : 'days');
  const detail = translate(language, 'Last export: {date} ({count} {days} ago).', { date: formatDate(settings.lastExportedAt, language), count: daysSince, days: dayLabel });
  return `${base} ${detail}`;
}
