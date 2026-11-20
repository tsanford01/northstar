// A small HTTP client for the Northstar API. It never logs or returns request headers, and
// scrubs the token from anything it reports, so a failure cannot leak the credential.

export class NorthstarApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

// A request that failed before it reached the server: it was never sent, so any method may
// go again.
const CONNECT_CODES = new Set(['ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN', 'EHOSTUNREACH', 'ENETUNREACH',
  'UND_ERR_CONNECT_TIMEOUT']);
// A pooled keep-alive socket the server had already closed (undici's "other side closed").
// The request may or may not have reached the server, so only an idempotent call goes again.
const STALE_SOCKET_CODES = new Set(['UND_ERR_SOCKET', 'ECONNRESET']);

const errorCode = (error) => error?.cause?.code || error?.code;

// One retry at most, and only when going again cannot change the outcome: a connect-phase
// failure for any call, a stale socket for a call that is safe to repeat. A timeout or an
// abort never goes again.
export function shouldRetry(error, idempotent) {
  if (error?.name === 'TimeoutError' || error?.name === 'AbortError') return false;
  const code = errorCode(error);
  return CONNECT_CODES.has(code) || (idempotent && STALE_SOCKET_CODES.has(code));
}

export function parseBaseUrl(value = 'http://127.0.0.1:3000') {
  let url;
  try { url = new URL(value); } catch { throw new Error('NORTHSTAR_URL must be a valid URL.'); }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('NORTHSTAR_URL must use http or https.');
  if (url.username || url.password) throw new Error('NORTHSTAR_URL must not contain credentials; use NORTHSTAR_TOKEN.');
  return url.origin;
}

export function createClient({ baseUrl, token, fetchImpl = globalThis.fetch }) {
  const redact = (text) => (token ? String(text).split(token).join('[redacted]') : String(text));

  // `idempotent`: repeating the call cannot change the outcome (a read, or a keyed upsert
  // whose repeat changes nothing). Defaults to true for GET and HEAD only.
  async function request(method, path, { query, body, idempotent = method === 'GET' || method === 'HEAD' } = {}) {
    const url = new URL(path, baseUrl);
    for (const [name, value] of Object.entries(query || {})) {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(name, String(value));
    }
    const send = () => fetchImpl(url, {
      method,
      redirect: 'error',
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    });
    let response;
    try {
      try {
        response = await send();
      } catch (error) {
        if (!shouldRetry(error, idempotent)) throw error;
        response = await send();
      }
    } catch (error) {
      throw new NorthstarApiError(0, redact(`Northstar is unreachable at ${baseUrl}: ${errorCode(error) || error?.name || 'network error'}`));
    }
    const text = await response.text();
    const isJson = (response.headers.get('content-type') || '').includes('application/json');
    let data = text;
    if (isJson && text) {
      try { data = JSON.parse(text); } catch { data = text; }
    }
    if (!response.ok) {
      const message = typeof data === 'object' && data?.error ? data.error : `Request failed with HTTP ${response.status}.`;
      throw new NorthstarApiError(response.status, redact(message));
    }
    return response.status === 204 ? null : data;
  }

  return { request, redact };
}
