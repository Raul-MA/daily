import { baseline, hashFor } from '../paths.mjs';
import { browser, errors, baseURL, screenshotDirectory } from './core.mjs';
import { libraryPaths } from './library.mjs';
import { checkIntro } from './mobile-intro.mjs';
import { checkRoute } from './mobile-route.mjs';
import { checkLessons } from './mobile-lessons.mjs';
import { checkSwipe } from './mobile-swipe.mjs';
for (const width of [320, 360, 390]) {
    const mobileContext = await browser.newContext({ viewport: { width, height: 740 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
    const mobilePage = await mobileContext.newPage();
    mobilePage.on('pageerror', error => errors.push(error.message));
    mobilePage.on('console', message => { if (message.type() === 'error')
        errors.push(message.text()); });
    await mobilePage.route('**/favicon.ico', route => route.fulfill({ status: 204 }));
    let visit = 0;
    const mobileRoute = async (path, ready) => {
        const query = baseline ? `?mobile=${width}-${visit++}` : '';
        await mobilePage.goto(`${baseURL}/${query}${hashFor(path)}`);
        if (!baseline) await mobilePage.reload();
        await mobilePage.locator(ready).waitFor();
    };
    const state = { mobilePage, mobileRoute, mobileContext, width };
    try {
        await checkIntro(state);
        for (const path of libraryPaths)
            await checkRoute(state, path);
        await checkLessons(state);
        if (width === 360)
            await checkSwipe(state);
    }
    catch (error) {
        console.error('Touch failure:', width, mobilePage.url(), errors);
        if (screenshotDirectory)
            await mobilePage.screenshot({ path: `${screenshotDirectory}/touch-${width}-failure.png`, fullPage: true, animations: 'disabled' });
        throw error;
    }
    finally {
        await mobileContext.close();
    }
}
