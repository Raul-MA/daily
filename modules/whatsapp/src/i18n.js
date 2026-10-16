const en = { opening: 'Opening Things… If it doesn’t open, use Copy link.', copied: 'Things link copied.', manual: 'Touch and hold the selected link to copy it.', save: 'Saving failed. The previous saved draft has been kept.', conflict: 'Data changed in another view. Your draft has been kept.', exported: 'WhatsApp backup downloaded.' };
const es = { opening: 'Abriendo Things… Si no se abre, usa Copiar enlace.', copied: 'Enlace de Things copiado.', manual: 'Mantén pulsado el enlace seleccionado para copiarlo.', save: 'No se pudo guardar. Se ha conservado el borrador guardado anterior.', conflict: 'Los datos cambiaron en otra vista. Se ha conservado tu borrador.', exported: 'Copia de WhatsApp descargada.' };
const errors = {
  'Complete all three fields to create your reminder.': 'Completa los campos para crear el recordatorio.',
  'Choose a valid date and time.': 'Elige una fecha y hora válidas.',
  'Choose a valid local date and time.': 'Elige una fecha y hora locales válidas.',
  'Choose a time in the future.': 'Elige una hora futura.',
  'Use a shorter recipient name.': 'Usa un nombre de destinatario más corto.',
  'This message is too long for a Things link. Please shorten it.': 'El mensaje es demasiado largo para un enlace de Things. Acórtalo.',
  'Your text contains an unsupported character. Please edit it and try again.': 'El texto contiene un carácter no compatible. Edítalo e inténtalo de nuevo.',
};
export function text(language, key) { return (language === 'es' ? es : en)[key] ?? key; }
export function validationText(language, error) { return language === 'es' ? errors[error] ?? error : error; }
export function saveError(language, error) {
  if (/changed|conflict/i.test(error.message)) return text(language, 'conflict');
  if (/quota|storage|full/i.test(`${error.name} ${error.message}`)) return text(language, 'save');
  return error.message;
}

const spanish = {
  'A little reminder to stay in touch': 'Un recordatorio para mantener el contacto',
  'Write now. Send later.': 'Escribe ahora. Envía después.', To: 'Para', 'Person or group': 'Persona o grupo',
  'A name for your reminder. Choose the chat in WhatsApp.': 'Un nombre para el recordatorio. Elige el chat en WhatsApp.',
  When: 'Cuándo', 'Reminder date': 'Fecha del recordatorio', 'Reminder time': 'Hora del recordatorio',
  'In your local time.': 'En tu hora local.', Message: 'Mensaje', 'Write your message...': 'Escribe tu mensaje...',
  'Create in Things': 'Crear en Things', 'Things 3 must be installed.': 'Things 3 debe estar instalado.',
  'Copy link': 'Copiar enlace', 'Select and copy this Things link': 'Selecciona y copia este enlace de Things',
  'Things reminds you. You choose the chat and send.': 'Things te lo recuerda. Tú eliges el chat y envías.',
  'Please enable JavaScript to compose a reminder.': 'Activa JavaScript para redactar un recordatorio.',
};
export function translateMarkup(host, language) {
  if (language !== 'es') return;
  const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const value = node.textContent.trim();
    if (Object.hasOwn(spanish, value)) node.textContent = node.textContent.replace(value, spanish[value]);
  }
  for (const node of host.querySelectorAll('[placeholder], [aria-label]')) {
    for (const key of ['placeholder', 'aria-label']) {
      const value = node.getAttribute(key);
      if (Object.hasOwn(spanish, value)) node.setAttribute(key, spanish[value]);
    }
  }
}
