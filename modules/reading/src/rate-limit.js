export class ReaderRateLimitError extends Error {
  constructor(seconds) {
    super(`Readwise rate limit reached. Try again in ${seconds} seconds.`);
    this.retryAfterSeconds = seconds;
  }
}
function retrySeconds(response, now) {
  const value = response.headers?.get('Retry-After');
  const numeric = Number(value);
  if (value && Number.isFinite(numeric)) return Math.max(1, Math.ceil(numeric));
  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(1, Math.ceil((date - now) / 1000)) : 60;
}
export function createRateLimit(now) {
  let token = '';
  let calls = [];
  let blockedUntil = 0;
  function reset() { token = ''; calls = []; blockedUntil = 0; }
  function admit(nextToken) {
    if (nextToken !== token) { reset(); token = nextToken; }
    const time = now();
    calls = calls.filter(value => time - value < 60000);
    const rolling = calls.length >= 20 ? calls[0] + 60000 : 0;
    const remaining = Math.max(rolling, blockedUntil) - time;
    if (remaining > 0) throw new ReaderRateLimitError(Math.ceil(remaining / 1000));
    calls.push(time);
  }
  function throttle(response) {
    const seconds = retrySeconds(response, now());
    blockedUntil = now() + seconds * 1000;
    return new ReaderRateLimitError(seconds);
  }
  return { admit, throttle, reset };
}
