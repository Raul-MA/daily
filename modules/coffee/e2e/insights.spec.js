import { expect, test } from "@playwright/test";
import { bean, emptyData, entry, gotoApp, testIds } from "./helpers.js";
test("shows empty insights and updates metrics from stored drinks", async ({ page }) => {
    await gotoApp(page);
    await page.getByTestId(testIds.navInsights).click();
    await expect(page.getByTestId(testIds.insightGrid)).toContainText("Logged drinks0");
    await expect(page.getByTestId(testIds.bestCup)).toContainText("No scored drinks yet");
    const house = bean();
    const guest = bean({ id: "bean-guest", brand: "Guest", blend: "Natural", roastOrigin: "Ethiopia" });
    await gotoApp(page, emptyData({
        beanPresets: [house, guest],
        entries: [
            entry({ id: "entry-plain", meta: { beanPresetId: house.id }, taste: { overallScore: null }, brew: { ratio: 2 } }),
            entry({ id: "entry-best", meta: { beanPresetId: guest.id }, taste: { overallScore: 9 }, brew: { ratio: 2.4 } }),
            entry({ id: "entry-good", meta: { beanPresetId: house.id }, taste: { overallScore: 8 }, brew: { ratio: 2.2 } })
        ]
    }));
    await page.getByTestId(testIds.navInsights).click();
    await expect(page.getByTestId(testIds.insightGrid)).toContainText("Logged drinks3");
    await expect(page.getByTestId(testIds.insightGrid)).toContainText("Scored drinks2");
    await expect(page.getByTestId(testIds.insightGrid)).toContainText("8+ scores2");
    await expect(page.getByTestId(testIds.insightGrid)).toContainText("Top ratio avg1:2.3");
    await expect(page.getByTestId(testIds.bestCup)).toContainText("Guest / Natural");
    await expect(page.getByTestId(testIds.bestCup)).toContainText("Score 9");
});
