import { appURL } from '../../../tests/support/app-url.mjs';
import { expect } from "@playwright/test";
export const testIds = {
    navPlay: "nav-play",
    navSession: "nav-session",
    navHistory: "nav-history",
    navGames: "nav-games",
    navPlayers: "nav-players",
    navStats: "nav-stats",
    navSettings: "nav-settings",
    playGameSelect: "play-game-select",
    playPlayerToggle: "play-player-toggle",
    playStart: "play-start",
    appToast: "app-toast",
    activeSession: "active-session",
    scoreInput: "score-input",
    scorePreview: "score-preview",
    sessionTotal: "session-total",
    sessionStartedAt: "session-started-at",
    sessionCompletedAt: "session-completed-at",
    sessionDuration: "session-duration",
    sessionDurationOverride: "session-duration-override",
    addRound: "add-round",
    finishSession: "finish-session",
    outcomeSelect: "outcome-select",
    collaborativeOutcome: "collaborative-outcome",
    historyItem: "history-item",
    historyDuration: "history-duration",
    historyFilterToggle: "history-filter-toggle",
    historyFilterSummary: "history-filter-summary",
    historyGameFilter: "history-game-filter",
    historyPlayerFilter: "history-player-filter",
    historyWinnerFilter: "history-winner-filter",
    historyDateFrom: "history-date-from",
    historyDateTo: "history-date-to",
    historySort: "history-sort",
    historySearch: "history-search",
    gameDetail: "game-detail",
    gameDetailRound: "game-detail-round",
    gameDetailScore: "game-detail-score",
    gameDetailOutcome: "game-detail-outcome",
    gameForm: "game-form",
    gameName: "game-name",
    gameMode: "game-mode",
    gameCollaborative: "game-collaborative",
    gameRoundCount: "game-round-count",
    gameTargetScore: "game-target-score",
    gameSave: "game-save",
    gameItem: "game-item",
    playerForm: "player-form",
    playerName: "player-name",
    playerSave: "player-save",
    playerItem: "player-item",
    statsView: "stats-view",
    gameStatsView: "game-stats-view",
    headToHeadSection: "head-to-head-section",
    settingsTheme: "settings-theme",
    settingsLanguage: "settings-language",
    exportButton: "export-button",
    importInput: "import-input",
    backupReminder: "backup-reminder"
};
export async function openApp(page) {
    await page.goto(appURL("games"));
    await page.evaluate(() => localStorage.clear());
    await page.goto(appURL("games"));
    await expect(page.getByTestId(testIds.navPlay).first()).toBeVisible();
}
export async function createPlayer(page, name) {
    await page.getByTestId(testIds.navPlayers).first().click();
    await page.getByTestId(testIds.playerName).fill(name);
    await page.getByTestId(testIds.playerSave).click();
    await expect(page.getByTestId(testIds.playerItem).filter({ hasText: name })).toBeVisible();
}
export async function createGame(page, name, mode = "highest_score_after_rounds", isCollaborative = false) {
    await page.getByTestId(testIds.navGames).first().click();
    await page.getByTestId(testIds.gameName).fill(name);
    await page.getByTestId(testIds.gameMode).selectOption(mode);
    if (isCollaborative)
        await page.getByTestId(testIds.gameCollaborative).check();
    await page.getByTestId(testIds.gameSave).click();
    await expect(page.getByTestId(testIds.gameItem).filter({ hasText: name })).toBeVisible();
}
export async function seedScoreGame(page) {
    await createPlayer(page, "Ada");
    await createPlayer(page, "Grace");
    await createGame(page, "Azul", "highest_score_after_rounds");
}
export async function startScoreSession(page) {
    await page.getByTestId(testIds.navPlay).first().click();
    await page.getByTestId(testIds.playGameSelect).selectOption({ label: "Azul" });
    await page.getByTestId(testIds.playPlayerToggle).nth(0).check();
    await page.getByTestId(testIds.playPlayerToggle).nth(1).check();
    await page.getByTestId(testIds.playStart).click();
    await expect(page.getByTestId(testIds.activeSession)).toBeVisible();
}
