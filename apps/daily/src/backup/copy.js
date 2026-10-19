const en = {
  title: 'Daily backup and restore', export: 'Export full Daily backup', file: 'Import full Daily backup', recovery: 'Download current recovery copy', confirm: 'Replace all saved data', cancel: 'Cancel import',
  preview: 'This replaces all saved app records, preferences, dashboard layout and unfinished form drafts. Other browser storage is kept. Reenter your Readwise token after restoring.',
  clocks: 'Running timers keep their original start times and may be overdue. Download the current recovery copy before confirming.',
  success: 'Daily records restored. Reenter your Readwise token in Reader.', cleanup: 'Daily records were restored, but credential cleanup failed. Open Reader to forget the old token before refreshing.',
  json: 'This is not valid JSON. Nothing was replaced.', invalid: 'This backup contains invalid data or broken references. Nothing was replaced.',
  unsupported: 'This backup format or version is unsupported. For an old app backup, use its own import below.', stale: 'Saved data changed after this preview. Cancel and preview the file again. Nothing was replaced.',
  quota: 'Saving failed. The previous saved data has been kept.', recoverySaved: 'Recovery copy downloaded.', exported: 'Full Daily backup downloaded.',
  legacy: 'Import one app instead', legacyHelp: 'Use the app’s import for an existing single-app export. Piano tracking is included in the full Daily backup.',
  plants: 'Plants', coffee: 'Coffee', games: 'Games', time: 'Time Budget', reader: 'Reader', whatsapp: 'WhatsApp',
  counts: { plants: 'Plants', coffeeEntries: 'Coffee entries', beans: 'Beans', players: 'Players', games: 'Games', gameSessions: 'Game sessions', budgetTemplates: 'Budget templates', budgetSessions: 'Current budgets', pianoPractices: 'Piano practices', pianoHistory: 'Piano history', readerPicks: 'Reader picks', readerLastItem: 'Remembered Reader item', whatsappDrafts: 'WhatsApp drafts', activities: 'Activities' },
};
const es = {
  title: 'Copia y restauración de Daily', export: 'Exportar copia completa de Daily', file: 'Importar copia completa de Daily', recovery: 'Descargar copia de recuperación actual', confirm: 'Reemplazar todos los datos guardados', cancel: 'Cancelar importación',
  preview: 'Reemplaza los datos de todas las aplicaciones, preferencias, organización del inicio y borradores sin guardar. El resto del almacenamiento del navegador se conserva. Introduce de nuevo tu token de Readwise después.',
  clocks: 'Los temporizadores conservan sus horas de inicio originales y pueden mostrar tiempo excedido. Descarga la copia de recuperación actual antes de confirmar.',
  success: 'Datos de Daily restaurados. Introduce de nuevo tu token de Readwise en Reader.', cleanup: 'Los datos de Daily se han restaurado, pero falló la limpieza de credenciales. Abre Reader para olvidar el token anterior antes de actualizar.',
  json: 'El archivo no es JSON válido. No se ha reemplazado nada.', invalid: 'La copia contiene datos no válidos o referencias rotas. No se ha reemplazado nada.',
  unsupported: 'El formato o la versión de esta copia no son compatibles. Para una copia de una aplicación anterior, usa su propia importación.', stale: 'Los datos guardados cambiaron después de la vista previa. Cancela y selecciona de nuevo el archivo. No se ha reemplazado nada.',
  quota: 'No se pudo guardar. Se han conservado los datos guardados anteriores.', recoverySaved: 'Copia de recuperación descargada.', exported: 'Copia completa de Daily descargada.',
  legacy: 'Importar solo una aplicación', legacyHelp: 'Usa la importación de cada aplicación para sus copias anteriores. El seguimiento de piano se incluye en la copia completa de Daily.',
  plants: 'Plantas', coffee: 'Café', games: 'Juegos', time: 'Time Budget', reader: 'Reader', whatsapp: 'WhatsApp',
  counts: { plants: 'Plantas', coffeeEntries: 'Registros de café', beans: 'Cafés en grano', players: 'Jugadores', games: 'Juegos', gameSessions: 'Partidas', budgetTemplates: 'Plantillas de tiempo', budgetSessions: 'Planes de tiempo actuales', pianoPractices: 'Prácticas de piano', pianoHistory: 'Historial de piano', readerPicks: 'Selecciones de Reader', readerLastItem: 'Última lectura recordada', whatsappDrafts: 'Borradores de WhatsApp', activities: 'Actividades' },
};
export function backupCopy(language) { return language === 'es' ? es : en; }
export function backupError(error) {
  if (error.name === 'SyntaxError') return 'json';
  if (/quota|storage|full/i.test(`${error.name} ${error.message}`)) return 'quota';
  if (/changed|conflict/i.test(error.message)) return 'stale';
  if (/unsupported|version|format/i.test(error.message)) return 'unsupported';
  return 'invalid';
}
