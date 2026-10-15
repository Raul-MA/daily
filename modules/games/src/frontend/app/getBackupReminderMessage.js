import { t } from '../../backend/core/i18n.js';
import { formatDate } from './formatDate.js';

export function getBackupReminderMessage(settings, language) {
  const base = t(language, "backupReminder");
  if (!settings.lastExportedAt) return `${base} Last export: never.`;
  const lastExported = new Date(settings.lastExportedAt);
  if (Number.isNaN(lastExported.getTime())) return `${base} Last export: unknown.`;
  const daysSince = Math.max(0, Math.floor((Date.now() - lastExported.getTime()) / (24 * 60 * 60 * 1000)));
  const dayLabel = daysSince === 1 ? "day" : "days";
  return `${base} Last export: ${formatDate(settings.lastExportedAt)} (${daysSince} ${dayLabel} ago).`;
}
