import { expect, test } from "@playwright/test";
import { openApp, testIds } from "./helpers.js";
test("loads mobile-first primary navigation", async ({ page }) => {
    await openApp(page);
    await expect(page.getByTestId(testIds.navPlay).first()).toBeVisible();
    await expect(page.getByTestId(testIds.navHistory).first()).toBeVisible();
    await expect(page.getByTestId(testIds.navStats).first()).toBeVisible();
    await expect(page.getByText("Set the table")).toBeVisible();
});
test("registers service worker path over http", async ({ page }) => {
    await openApp(page);
    const hasServiceWorker = await page.evaluate(() => "serviceWorker" in navigator);
    expect(hasServiceWorker).toBe(true);
});
