import { confirmGameImport } from './shared-data.js';
import { expect, test } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import { createGame, createPlayer, openApp, testIds } from "./helpers.js";
test("exports full JSON and replace-import restores data", async ({ page }) => {
    await openApp(page);
    await createPlayer(page, "Ada");
    await createGame(page, "Azul", "highest_score_after_rounds", true);
    await page.getByTestId(testIds.navSettings).first().click();
    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId(testIds.exportButton).click();
    const download = await downloadPromise;
    const path = await download.path();
    expect(path).toBeTruthy();
    const exported = JSON.parse(await readFile(path, "utf8"));
    expect(exported.appSlug).toBe("board-game-score-tracker");
    expect(exported.schemaVersion).toBe("1.0");
    expect(exported.players).toHaveLength(1);
    expect(exported.games).toHaveLength(1);
    expect(exported.games[0].isCollaborative).toBe(true);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.getByText("Ada")).toHaveCount(0);
    if (process.env.DAILY_BASELINE_URL) page.once("dialog", (dialog) => dialog.accept());
    await page.getByTestId(testIds.navSettings).first().click();
    await page.getByTestId(testIds.importInput).setInputFiles(path);
    await confirmGameImport(page);
    await page.getByTestId(testIds.navPlayers).first().click();
    await expect(page.getByTestId(testIds.playerItem).filter({ hasText: "Ada" })).toBeVisible();
    await page.getByTestId(testIds.navGames).first().click();
    await expect(page.getByTestId(testIds.gameItem).filter({ hasText: "Azul" })).toContainText("Collaborative");
});
test("rejects malformed nested backup data without replacing local data", async ({ page }, testInfo) => {
    await openApp(page);
    await createPlayer(page, "Ada");
    const malformedPath = testInfo.outputPath("malformed-backup.json");
    await writeFile(malformedPath, JSON.stringify({
        appSlug: "board-game-score-tracker",
        schemaVersion: "1.0",
        settings: {},
        players: [
            {
                id: "player-valid",
                name: "Grace",
                archived: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ],
        games: [null],
        sessions: []
    }));
    if (process.env.DAILY_BASELINE_URL) page.once("dialog", (dialog) => dialog.accept());
    await page.getByTestId(testIds.navSettings).first().click();
    await page.getByTestId(testIds.importInput).setInputFiles(malformedPath);
    await expect(page.getByTestId(testIds.appToast)).toContainText("Backup game 1 must be an object.");
    await page.getByTestId(testIds.navPlayers).first().click();
    await expect(page.getByTestId(testIds.playerItem).filter({ hasText: "Ada" })).toBeVisible();
    await expect(page.getByTestId(testIds.playerItem).filter({ hasText: "Grace" })).toHaveCount(0);
});
