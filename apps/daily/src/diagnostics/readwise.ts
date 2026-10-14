export type Outcome = 'available' | 'no-review' | 'unauthorized' | 'rate-limited' | 'unavailable' | 'unexpected' | 'network-or-cors' | 'timeout';
type Endpoint = { id: string; url: string; expected: number };
export type Check = { id: string; status: number | null; outcome: Outcome };
type Options = { fetch?: typeof fetch; origin?: string; timeoutMs?: number };

const endpoints: Endpoint[] = [
  { id: 'auth', url: 'https://readwise.io/api/v2/auth/', expected: 204 },
  { id: 'reader', url: 'https://readwise.io/api/v3/list/?limit=1', expected: 200 },
  { id: 'review', url: 'https://readwise.io/api/v2/review/', expected: 200 },
];

function outcome(endpoint: Endpoint, status: number): Outcome {
  if (status === endpoint.expected) return 'available';
  if (status === 401 || status === 403) return 'unauthorized';
  if (status === 429) return 'rate-limited';
  if (status >= 500) return 'unavailable';
  if (endpoint.id === 'review' && status === 404) return 'no-review';
  return 'unexpected';
}

async function check(endpoint: Endpoint, token: string, request: typeof fetch, timeoutMs: number): Promise<Check> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await request(endpoint.url, {
      method: 'GET', headers: { Authorization: `Token ${token}` },
      cache: 'no-store', credentials: 'omit', redirect: 'error',
      referrerPolicy: 'no-referrer', signal: controller.signal,
    });
    void response.body?.cancel().catch(() => undefined);
    return { id: endpoint.id, status: response.status, outcome: outcome(endpoint, response.status) };
  } catch {
    return { id: endpoint.id, status: null, outcome: controller.signal.aborted ? 'timeout' : 'network-or-cors' };
  } finally {
    clearTimeout(timeout);
  }
}

function validate(token: string, timeoutMs: number) {
  if (!token.trim() || /[\r\n]/.test(token)) throw new Error('Enter a valid token.');
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || timeoutMs > 30000) throw new Error('Invalid request timeout.');
}

export async function checkReadwise(token: string, options: Options = {}) {
  const timeoutMs = options.timeoutMs ?? 15000;
  validate(token, timeoutMs);
  const origin = options.origin ?? '';
  const checks: Check[] = [];
  for (const endpoint of endpoints) {
    checks.push(await check(endpoint, token.trim(), options.fetch ?? fetch, timeoutMs));
  }
  return { origin, targetOrigin: origin === 'https://raul-ma.github.io', checks };
}
