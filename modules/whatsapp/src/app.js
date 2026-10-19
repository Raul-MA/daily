export function buildThingsUrl(recipient, date, time, message) {
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  return `things:///add?title=${encodeURIComponent(`WhatsApp ${recipient}`)}&when=${encodeURIComponent(`${date}@${time}`)}&notes=${encodeURIComponent(whatsappUrl)}&reveal=true`;
}
export function localFields(date) {
  const pad = value => String(value).padStart(2, '0');
  return { date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`, time: `${pad(date.getHours())}:${pad(date.getMinutes())}` };
}
function dateError(draft, now) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date) || !/^\d{2}:\d{2}$/.test(draft.time)) return 'Choose a valid date and time.';
  const selected = new Date(`${draft.date}T${draft.time}:00`);
  const fields = localFields(selected);
  if (!Number.isFinite(selected.getTime()) || fields.date !== draft.date || fields.time !== draft.time) return 'Choose a valid local date and time.';
  return selected <= now ? 'Choose a time in the future.' : '';
}
function textError(draft) {
  if (`WhatsApp ${draft.recipient}`.length > 4000) return 'Use a shorter recipient name.';
  try {
    if (`https://wa.me/?text=${encodeURIComponent(draft.message)}`.length > 10000) return 'This message is too long for a Things link. Please shorten it.';
    encodeURIComponent(draft.recipient);
  } catch { return 'Your text contains an unsupported character. Please edit it and try again.'; }
  return '';
}
export function draftError(draft, now = new Date()) {
  if (!draft.recipient.trim() || !draft.message.trim() || !draft.date || !draft.time) return 'Complete all three fields to create your reminder.';
  return dateError(draft, now) || textError(draft);
}
export function defaultDraft(now = Date.now()) {
  return { recipient: '', message: '', ...localFields(new Date(Math.ceil((now + 3600000) / 60000) * 60000)) };
}
