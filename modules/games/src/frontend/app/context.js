export const gameUI = {};
export function createGameUI() { return {
  editingPlayerId: null,
  editingGameId: null,
  gameFormMode: "",
  gameFormDraft: null,
  historyFiltersOpen: false,
  backupToastShown: false,
  focusExportOnRender: false,
  selectedPlayers: new Set(),
  history: {
    gameId: "",
    playerId: "",
    winnerId: "",
    dateFrom: "",
    dateTo: "",
    search: "",
    sort: "newest"
  },
  headToHeadA: "",
  headToHeadB: "",
  toast: null
}; }
