import { appURL } from '../../../tests/support/app-url.mjs';
import { fixtureData } from './fixture-data.js';
import { expect, test } from "@playwright/test";
import { STORAGE_KEY } from "./storage-key.js";
import { testIds } from "./helpers.js";
test("tracks session duration and game duration analytics", async ({ page }) => {
    const now = "2026-07-07T18:00:00.000Z";
    const data = fixtureData('gameplay-1.json', now);
    await page.addInitScript(({ key, data }) => {
        localStorage.setItem(key, JSON.stringify(data));
    }, { key: STORAGE_KEY, data });
    await page.goto(appURL("games", "history"));
    const latest = page.getByTestId(testIds.historyItem).filter({ hasText: "Dutch Blitz" }).first();
    await expect(latest.getByTestId(testIds.historyDuration)).toContainText("10 min");
    page.once("dialog", (dialog) => dialog.accept());
    await latest.getByRole("button", { name: "Edit" }).click();
    await page.getByTestId(testIds.sessionDurationOverride).fill("12");
    await page.getByTestId(testIds.sessionDurationOverride).blur();
    await expect(page.getByTestId(testIds.sessionDuration)).toContainText("12 min");
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByTestId(testIds.finishSession).click();
    await page.getByTestId(testIds.navStats).first().click();
    const dutchStats = page.getByTestId(testIds.gameStatsView).locator(".stat-card").filter({ hasText: "Dutch Blitz" });
    await expect(dutchStats).toContainText("Average duration");
    await expect(dutchStats).toContainText("16 min");
    await expect(dutchStats).toContainText("Last time");
    await expect(dutchStats).toContainText("12 min");
    await expect(dutchStats).toContainText("2 players");
    await expect(dutchStats).toContainText("15 min");
    await expect(dutchStats).toContainText("3 players");
    await expect(dutchStats).toContainText("18 min");
});
test("shows player average scores by game instead of blending scoring systems", async ({ page }) => {
    const now = new Date().toISOString();
    const data = fixtureData('gameplay-2.json', now);
    await page.addInitScript(({ key, data }) => {
        localStorage.setItem(key, JSON.stringify(data));
    }, { key: STORAGE_KEY, data });
    await page.goto(appURL("games", "stats"));
    const adaCard = page.locator(".stat-card").filter({ hasText: "Ada" }).first();
    await expect(adaCard).toContainText("Azul");
    await expect(adaCard).toContainText("75");
    await expect(adaCard).toContainText("Dutch Blitz");
    await expect(adaCard).toContainText("500");
    await expect(adaCard).not.toContainText("288");
    await expect(adaCard).not.toContainText("Chess");
});
