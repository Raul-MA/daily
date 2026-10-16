const KEY = 'daily:readwise:account-epoch:v1';

export function guardAccount(credentials, storage) {
  let expected = credentials.accountId() || storage?.getItem(KEY) || null;
  const current = () => { const saved = storage?.getItem(KEY) ?? null; return saved === null || saved === expected; };
  function advance() {
    const next = crypto.randomUUID();
    storage?.setItem(KEY, next);
    expected = next;
  }
  return {
    ...credentials,
    token: () => current() ? credentials.token() : '',
    accountId: () => current() ? credentials.accountId() : '',
    set: (token, mode) => credentials.set(token, mode, expected),
    advance,
  };
}
