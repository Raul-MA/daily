function calendarKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}:${date.getTimezoneOffset()}`;
}

export function watchCalendar(browser, onChange, clock = () => new Date()) {
  let key = calendarKey(clock());
  let timeout;
  function schedule() {
    browser.clearTimeout(timeout);
    const now = clock();
    const next = new Date(now);
    next.setHours(24, 0, 1, 0);
    timeout = browser.setTimeout(refresh, Math.max(1, next.getTime() - now.getTime()));
  }
  function refresh() {
    const nextKey = calendarKey(clock());
    if (nextKey !== key) { key = nextKey; onChange(); }
    schedule();
  }
  const visible = () => { if (browser.document.visibilityState === 'visible') refresh(); };
  browser.document.addEventListener('visibilitychange', visible);
  browser.addEventListener('focus', refresh);
  schedule();
  return () => {
    browser.clearTimeout(timeout);
    browser.document.removeEventListener('visibilitychange', visible);
    browser.removeEventListener('focus', refresh);
  };
}
