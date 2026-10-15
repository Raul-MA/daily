import type { Language } from '../../data/src/daily-document.ts';

const en = {
  home: 'Home', apps: 'Apps', settings: 'Settings', today: 'Today', language: 'Language',
  plants: 'Plants', activities: 'Running', review: 'Readwise', reader: 'Reader', quick: 'Quick actions', piano: 'Piano',
  coffee: 'Coffee', games: 'Games', time: 'Time Budget', whatsapp: 'WhatsApp Later',
  openPlants: 'Open plants', openTime: 'Open Time Budget', openReview: 'Open Daily Review', openReader: 'Open Reader picker', openPiano: 'Open piano',
  plantsNote: 'Your care reminders will appear here.', activitiesNote: 'Your active sessions will appear here.',
  reviewNote: 'Open your scheduled review in Readwise.', readerNote: 'Choose what to read next, using your Reader library.', pianoNote: 'Lessons, exercises and guided practice.',
  logCoffee: 'Log coffee', startGame: 'Start a game', countdown: 'New countdown', budget: 'New time budget', scheduleMessage: 'Schedule a message',
  widgets: 'Dashboard widgets', customize: 'Customize your dashboard', chooseWidgets: 'Choose which cards appear and their order.',
  moveUp: 'Move {name} up', moveDown: 'Move {name} down', saved: 'Saved on this device.', noWidgets: 'Choose your dashboard widgets in Settings.',
  noActions: 'Choose quick actions in Settings.', notFound: 'Page not found', pending: 'This app has not been migrated yet. Keep using your original installation for now.',
  local: 'Local development preview', saveError: 'Could not save. Your previous settings are still in place.',
  recovered: 'A recovery copy is being displayed. Your original stored data has been kept.',
  storageTitle: 'Local data needs attention', storageError: 'Saved data could not be read. Your stored data has been kept.',
  diagnostic: 'Connection checks', skip: 'Skip to content', reading: 'Reading',
};
const es: typeof en = {
  home: 'Inicio', apps: 'Apps', settings: 'Ajustes', today: 'Hoy', language: 'Idioma',
  plants: 'Plantas', activities: 'En marcha', review: 'Readwise', reader: 'Reader', quick: 'Acciones rápidas', piano: 'Piano',
  coffee: 'Café', games: 'Juegos', time: 'Time Budget', whatsapp: 'WhatsApp para después',
  openPlants: 'Abrir plantas', openTime: 'Abrir Time Budget', openReview: 'Abrir repaso diario', openReader: 'Abrir selector de Reader', openPiano: 'Abrir piano',
  plantsNote: 'Aquí aparecerán los recordatorios de cuidado.', activitiesNote: 'Aquí aparecerán tus sesiones activas.',
  reviewNote: 'Abre tu repaso programado en Readwise.', readerNote: 'Elige tu próxima lectura de tu biblioteca de Reader.', pianoNote: 'Lecciones, ejercicios y práctica guiada.',
  logCoffee: 'Registrar café', startGame: 'Empezar partida', countdown: 'Nueva cuenta atrás', budget: 'Nuevo presupuesto de tiempo', scheduleMessage: 'Programar un mensaje',
  widgets: 'Widgets del panel', customize: 'Personaliza tu panel', chooseWidgets: 'Elige qué tarjetas aparecen y en qué orden.',
  moveUp: 'Subir {name}', moveDown: 'Bajar {name}', saved: 'Guardado en este dispositivo.', noWidgets: 'Elige los widgets del panel en Ajustes.',
  noActions: 'Elige las acciones rápidas en Ajustes.', notFound: 'Página no encontrada', pending: 'Esta app todavía no se ha migrado. Sigue usando tu instalación original por ahora.',
  local: 'Vista previa local', saveError: 'No se pudo guardar. Se mantiene la configuración anterior.',
  recovered: 'Se muestra una copia de recuperación. Se han conservado los datos originales.',
  storageTitle: 'Los datos locales necesitan atención', storageError: 'No se pudieron leer los datos guardados. Se han conservado.',
  diagnostic: 'Comprobar conexión', skip: 'Saltar al contenido', reading: 'Lectura',
};
export type ShellText = typeof en;
export function shellText(language: Language): ShellText { return language === 'es' ? es : en; }
