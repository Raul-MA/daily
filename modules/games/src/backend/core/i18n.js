export const dictionaries = {
  en: {
    appTitle: "Board Game Score Tracker",
    play: "Play",
    activeSession: "Session",
    history: "History",
    games: "Games",
    players: "Players",
    stats: "Stats",
    settings: "Settings",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    archive: "Archive",
    delete: "Delete",
    finish: "Finish",
    startGame: "Start game",
    resume: "Resume",
    addPlayer: "Add player",
    addGame: "Add game",
    addRound: "Add round",
    save: "Save",
    name: "Name",
    notes: "Notes",
    emptyPlayers: "No players yet.",
    emptyGames: "No games yet.",
    emptyHistory: "No completed sessions yet.",
    theme: "Theme",
    language: "Language",
    exportData: "Export data",
    importData: "Import data",
    backupReminder: "Create a backup to protect your local data.",
    system: "System",
    light: "Light",
    dark: "Dark"
  }
};

export function getAvailableLanguages() {
  return Object.keys(dictionaries);
}

export function t(language, key) {
  return dictionaries[language]?.[key] || dictionaries.en[key] || key;
}
