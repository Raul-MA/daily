export const apps = [
    { key: 'plants', page: 'plants', pages: ['plants', 'plant', 'plantNew', 'plantEdit', 'plantSettings'] },
    { key: 'coffee', page: 'coffee', pages: ['coffee', 'coffeeNew', 'coffeeHistory', 'coffeeInsights', 'coffeeSettings', 'coffeeEntry', 'coffeeEntryEdit'] },
    { key: 'games', page: 'games', pages: ['games', 'gameNew', 'gameSession', 'gamesSession', 'gamesHistory', 'gameDetail', 'gamesCatalog', 'gamesPlayers', 'gamesStats', 'gamesSettings'] },
    { key: 'time', page: 'time', pages: ['time'] },
    { key: 'piano', page: 'piano', pages: ['piano', 'pianoExercise', 'pianoLearn', 'pianoLibrary', 'pianoReference'] },
    { key: 'reader', page: 'reader', pages: ['reader', 'review'] },
    { key: 'whatsapp', page: 'whatsapp', pages: ['whatsapp'] },
];
export const quickActions = {
    coffee: { label: 'logCoffee', page: 'coffeeNew' },
    games: { label: 'startGame', page: 'gameNew' },
    countdown: { label: 'countdown', page: 'time', query: { new: 'countdown' } },
    budget: { label: 'budget', page: 'time', query: { new: 'budget' } },
};
export const widgets = {
    plants: { note: 'plantsNote', label: 'openPlants', page: 'plants' },
    activities: { note: 'activitiesNote', label: 'openTime', page: 'time' },
    review: { note: 'reviewNote', label: 'openReview', page: 'review' },
    reader: { note: 'readerNote', label: 'openReader', page: 'reader' },
    piano: { note: 'pianoNote', label: 'openPiano', page: 'piano' },
};
