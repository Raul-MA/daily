import { checkLayout } from './mobile-checks.mjs';
export async function checkIntro(state) {
    const { mobilePage, mobileRoute } = state;
    await mobileRoute('/', '.course-lessons');
    await checkLayout(state, 'course');
    await mobilePage.locator('.nav-link[href="#/library"]').tap();
    await mobilePage.locator('.library-grid').waitFor();
    await checkLayout(state, 'library');
    await mobilePage.locator('.search-input').fill('intervals');
    await checkLayout(state, 'open search');
    await mobilePage.locator('.search-result-item[href="#/intervals/theory"]').tap();
    await mobilePage.waitForFunction(() => location.hash === '#/intervals/theory' && document.activeElement?.tagName === 'H1');
}
