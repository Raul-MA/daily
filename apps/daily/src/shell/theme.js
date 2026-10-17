const defaults = {
    background: '#f2f2f7', color: '#1c1c1e', muted: '#68686e', surface: '#ffffff',
    line: '#e3e3e8', link: '#0067d8', font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

function token(styles, names, fallback) {
    return names.map(name => styles.getPropertyValue(name).trim()).find(Boolean) || fallback;
}

function presentation(module) {
    if (!module) return defaults;
    const styles = getComputedStyle(module);
    return {
        background: styles.backgroundColor, color: styles.color, font: styles.fontFamily, link: styles.color,
        muted: token(styles, ['--muted', '--text-muted', '--color-muted', '--ink-soft'], styles.color),
        surface: token(styles, ['--surface', '--color-paper-alt', '--background', '--bg'], styles.backgroundColor),
        line: token(styles, ['--line', '--border', '--color-rule'], defaults.line),
    };
}

export function watchShellTheme(root) {
    const themeObserver = new MutationObserver(sync);
    function sync() {
        const module = root.querySelector('.shell-main > [data-module]');
        themeObserver.disconnect();
        if (module) themeObserver.observe(module, { attributes: true, attributeFilter: ['data-theme'] });
        for (const [name, value] of Object.entries(presentation(module))) {
            document.documentElement.style.setProperty(`--shell-${name}`, value);
        }
    }
    const observer = new MutationObserver(sync);
    observer.observe(root, { childList: true });
    const scheme = matchMedia('(prefers-color-scheme: dark)');
    scheme.addEventListener('change', sync);
    sync();
    return () => {
        observer.disconnect();
        themeObserver.disconnect();
        scheme.removeEventListener('change', sync);
        for (const name of Object.keys(defaults)) document.documentElement.style.removeProperty(`--shell-${name}`);
    };
}
