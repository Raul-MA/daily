const item = (page, en, es, extra = {}) => ({ page, en, es, ...extra });
export const sections = {
  plants: [item('plants', 'My plants', 'Mis plantas'), item('plantNew', 'Add plant', 'Añadir planta'), item('plantSettings', 'Plant settings', 'Ajustes de plantas')],
  coffee: [
    item('coffeeNew', 'New', 'Nuevo', { testId: 'nav-new', aliases: ['coffee'], matches: ['coffee', 'coffeeEntry', 'coffeeEntryEdit'] }),
    item('coffeeHistory', 'History', 'Historial', { testId: 'nav-history' }),
    item('coffeeInsights', 'Insights', 'Estadísticas', { testId: 'nav-insights' }),
    item('coffeeSettings', 'Settings', 'Ajustes', { testId: 'nav-settings' }),
  ],
  games: [
    item('games', 'Play', 'Jugar', { testId: 'nav-play', matches: ['gameNew'] }),
    item('gamesSession', 'Session', 'Sesión', { testId: 'nav-session', matches: ['gameSession'] }),
    item('gamesHistory', 'History', 'Historial', { testId: 'nav-history', matches: ['gameDetail'] }),
    item('gamesCatalog', 'Games', 'Juegos', { testId: 'nav-games' }),
    item('gamesPlayers', 'Players', 'Jugadores', { testId: 'nav-players' }),
    item('gamesStats', 'Stats', 'Estadísticas', { testId: 'nav-stats' }),
    item('gamesSettings', 'Settings', 'Ajustes', { testId: 'nav-settings' }),
  ],
  time: [
    item('time', 'Time Budget', 'Time Budget', { target: '[data-menu-panel="plan"]' }),
    item('time', 'Countdowns', 'Cuentas atrás', { target: '[data-menu-panel="countdowns"]' }),
    item('time', 'Settings', 'Ajustes', { target: '[data-menu-panel="settings"]' }),
  ],
  piano: [
    item('piano', 'Course', 'Curso', { matches: ['pianoLearn'] }),
    item('pianoLibrary', 'Library', 'Biblioteca', { matches: ['pianoExercise', 'pianoReference'] }),
  ],
  reader: [item('reader', 'Reader Picker', 'Selector de Reader'), item('review', 'Daily Review', 'Repaso diario')],
  whatsapp: [item('whatsapp', 'Compose', 'Redactar', { target: '#composer' }), item('whatsapp', 'Draft backup', 'Copia del borrador', { target: '.whatsapp-backup' })],
};

export function activeSection(entry, route) {
  return entry.page === route.page || entry.matches?.includes(route.page);
}
