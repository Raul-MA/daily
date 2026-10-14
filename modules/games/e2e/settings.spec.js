import { expect, test } from "@playwright/test";
import { openApp, testIds } from "./helpers.js";
test("persists theme and language settings", async ({ page }) => {
    await openApp(page);
    await page.getByTestId(testIds.navSettings).first().click();
    await page.getByTestId(testIds.settingsTheme).selectOption("dark");
    await page.getByTestId(testIds.settingsLanguage).selectOption("en");
    await page.reload();
    await page.getByTestId(testIds.navSettings).first().click();
    await expect(page.getByTestId(testIds.settingsTheme)).toHaveValue("dark");
    await expect(page.getByTestId(testIds.settingsLanguage)).toHaveValue("en");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
test("shows backup reminder before a successful export", async ({ page }) => {
    await openApp(page);
    await expect(page.getByTestId(testIds.appToast)).toContainText("Create a backup to protect your local data.");
    await expect(page.getByTestId(testIds.appToast)).toContainText("Last export: never.");
    await page.getByTestId(testIds.appToast).click();
    await expect(page).toHaveURL(/#\/settings$/);
    await expect(page.getByTestId(testIds.exportButton)).toBeFocused();
    await expect(page.getByTestId(testIds.backupReminder)).toBeVisible();
});
test("shows backup reminder age when the last export is stale", async ({ page }) => {
    await openApp(page);
    await page.evaluate(() => {
        const key = "board-game-score-tracker:data";
        const now = new Date().toISOString();
        const lastExportedAt = new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString();
        localStorage.setItem(key, JSON.stringify({
            appId: "board-game-score-tracker",
            appSlug: "board-game-score-tracker",
            schemaVersion: "1.0",
            settings: {
                theme: "system",
                language: "en",
                lastExportedAt,
                backupReminderDays: 7,
                defaultRoundCount: 5,
                defaultTargetScore: 100,
                confirmBeforeFinishingSession: true,
                showArchived: false,
                historyPageSize: 25
            },
            players: [],
            games: [],
            sessions: [],
            metadata: {
                createdAt: now,
                updatedAt: now
            }
        }));
    });
    await page.reload();
    await expect(page.getByTestId(testIds.appToast)).toContainText("Last export:");
    await expect(page.getByTestId(testIds.appToast)).toContainText("9 days ago");
    await page.getByTestId(testIds.navSettings).first().click();
    await expect(page.getByTestId(testIds.backupReminder)).toContainText("9 days ago");
});
