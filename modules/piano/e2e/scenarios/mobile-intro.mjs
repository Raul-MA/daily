import { hashFor, hrefFor, baseline } from '../paths.mjs';
import { checkLayout } from './mobile-checks.mjs';
export async function checkIntro(state) {
    const { mobilePage, mobileRoute } = state;
    await mobileRoute('/', '.course-lessons');
    await checkLayout(state, 'course');
    if (!baseline) await mobilePage.getByRole('button', { name: 'Apps', exact: true }).tap();
    await mobilePage.locator(`.nav-link[href="${hrefFor('/library')}"]`).tap();
    await mobilePage.locator('.library-grid').waitFor();
    await checkLayout(state, 'library');
    await mobilePage.locator('.search-input').fill('intervals');
    await checkLayout(state, 'open search');
    await mobilePage.locator(`.search-result-item[href="${hrefFor('/intervals/theory')}"]`).tap();
    await mobilePage.waitForFunction(hash => location.hash === hash && document.activeElement?.tagName === 'H1', hashFor('/intervals/theory'));
}
