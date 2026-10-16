function deadline(signal, milliseconds) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  if (signal?.aborted) abort();
  const timer = setTimeout(abort, milliseconds);
  return { signal: controller.signal, stop: () => { clearTimeout(timer); signal?.removeEventListener('abort', abort); } };
}
function requestError(response, limiter) {
  if (response.status === 429) return limiter.throttle(response);
  const message = response.status === 401 ? 'The saved Readwise token is invalid. Open Settings and update it.' : `Readwise request failed (${response.status}).`;
  const error = new Error(message);
  error.status = response.status;
  return error;
}
export function createReaderRequest(options, limiter) {
  return async function request(url, config) {
    limiter.admit(config.token);
    const timeout = deadline(config.signal, options.timeoutMs ?? 20000);
    try {
      const response = await options.fetch(url, {
        headers: { Authorization: `Token ${config.token}` }, signal: timeout.signal, method: config.method ?? 'GET',
        cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer',
      });
      if (!response.ok) throw requestError(response, limiter);
      return await response.json();
    } finally { timeout.stop(); }
  };
}
