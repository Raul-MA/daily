export function readingCredentials(context) {
  function clearRuntime() { context.cancel(); context.domain.clearCache(); context.review.clear(); }
  function clearAccount() {
    clearRuntime();
    const data = context.read();
    if (data.picks || data.lastItem) context.save({ ...data, picks: null, lastItem: null });
  }
  function setToken(token, mode = 'memory') {
    if (token.trim() !== context.credentials.token()) { context.credentials.advance(); clearAccount(); }
    context.credentials.set(token, mode);
    context.emit();
  }
  function forgetToken() { context.credentials.forget(); context.credentials.advance(); clearAccount(); context.emit(); }
  function releaseCredentials() { context.credentials.forget(); context.credentials.advance(); clearRuntime(); context.emit(); }
  return { setToken, forgetToken, releaseCredentials };
}
