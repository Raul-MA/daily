import { checkLayout } from './mobile-checks.mjs';
export async function checkFilters(state, path) {
    const { mobilePage } = state;
    await mobilePage.locator('.filter-btn').tap();
    await checkLayout(state, `${path} filter open`);
    const select = mobilePage.locator('.filter-popover select');
    const value = await select.locator('option').first().getAttribute('value');
    await select.selectOption(value);
    await checkLayout(state, `${path} filter selected`);
    await mobilePage.locator('.filter-btn').tap();
}
