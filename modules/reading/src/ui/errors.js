const spanish = {
  'Add your Readwise token in Settings.': 'Añade tu token de Readwise en Configuración.',
  'Changed Reader import preview.': 'La vista previa de Reader cambió. Selecciona de nuevo el archivo.',
  'Data changed in another view. Your draft has been kept.': 'Los datos cambiaron en otra vista. Se ha conservado tu borrador.',
  'Invalid Reader backup.': 'La copia de Reader no es válida. No se ha reemplazado nada.',
  'Invalid Reader data.': 'Los datos de Reader no son válidos. No se ha guardado nada.',
  'Invalid Reader document.': 'El documento de Reader no es válido.',
  'Invalid Reader locations.': 'Las ubicaciones de Reader no son válidas.',
  'Invalid Reader response.': 'La respuesta de Reader no es válida.',
  'Invalid credential preference.': 'La preferencia de almacenamiento del token no es válida.',
  'Invalid or repeating Reader cursor.': 'Reader devolvió un cursor no válido o repetido.',
  'Invalid remembered Reader item.': 'La lectura recordada de Reader no es válida.',
  'Invalid review highlight.': 'El subrayado del repaso no es válido.',
  'Invalid scheduled review response.': 'La respuesta del repaso programado no es válida.',
  'No review is available to complete.': 'No hay ningún repaso disponible para completar.',
  'Reader request aborted because its account or settings changed.': 'Solicitud de Reader cancelada porque cambió la cuenta o la configuración.',
  'Remembered item changed during validation.': 'La lectura recordada cambió durante la validación.',
  'Review completion is already in progress.': 'El repaso ya se está marcando como completado.',
  'Review completion was not confirmed by Readwise.': 'Readwise no confirmó que el repaso se haya completado.',
  'Review request aborted because its account changed.': 'Solicitud de repaso cancelada porque cambió la cuenta.',
  'The latest review changed. Refresh before completing it.': 'El último repaso cambió. Actualízalo antes de completarlo.',
  'Unknown Reader import preview.': 'La vista previa de Reader no es válida. Selecciona de nuevo el archivo.',
  'Unknown review feedback.': 'La opción de seguimiento del repaso no es válida.',
  'Unsupported Reader backup format.': 'El formato de la copia de Reader no es compatible.',
  'Unsupported Reader schema version.': 'La versión de la copia de Reader no es compatible.',
};
export function authoredReaderError(language, message) {
  if (!Object.hasOwn(spanish, message)) return undefined;
  return language === 'es' ? spanish[message] : message;
}
