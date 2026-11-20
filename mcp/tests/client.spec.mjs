// The client's one retry: a connect-phase failure for any call, a stale keep-alive socket
// only for a call that is safe to repeat, never more than once, never after a timeout.
import assert from 'node:assert/strict';
import { createServer } from 'node:net';
import test from 'node:test';
import { createClient, NorthstarApiError, shouldRetry } from '../client.mjs';
import { tools } from '../tools.mjs';

const fetchFailed = (code) => Object.assign(new TypeError('fetch failed'), { cause: Object.assign(new Error(code), { code }) });
const ok = (data) => new Response(JSON.stringify(data), { status: 200, headers: { 'content-type': 'application/json' } });

function stubFetch(...outcomes) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url: String(url), method: init.method, body: init.body });
    const next = outcomes.shift();
    if (next instanceof Error) throw next;
    return next;
  };
  return { fetchImpl, calls };
}

test('a stale keep-alive socket on a read is retried once and succeeds', async () => {
  const { fetchImpl, calls } = stubFetch(fetchFailed('UND_ERR_SOCKET'), ok({ teams: [] }));
  const api = createClient({ baseUrl: 'http://127.0.0.1:1', fetchImpl });
  assert.deepEqual(await api.request('GET', '/api/teams'), { teams: [] });
  assert.equal(calls.length, 2);
});

test('a keyed upsert marked idempotent is retried on a stale socket, with the same body', async () => {
  const { fetchImpl, calls } = stubFetch(fetchFailed('UND_ERR_SOCKET'), ok({ id: 7 }));
  const api = createClient({ baseUrl: 'http://127.0.0.1:1', fetchImpl });
  await api.request('PUT', '/api/projects/upsert', { query: { key: 'projectId' }, body: { name: 'a' }, idempotent: true });
  assert.equal(calls.length, 2);
  assert.equal(calls[0].body, calls[1].body);
});

test('a write that is not safe to repeat is not retried on a stale socket', async () => {
  for (const [method, path] of [['POST', '/api/kanban/cards/3/notes'], ['PUT', '/api/projects/3']]) {
    const { fetchImpl, calls } = stubFetch(fetchFailed('UND_ERR_SOCKET'), ok({}));
    const api = createClient({ baseUrl: 'http://127.0.0.1:1', fetchImpl });
    await assert.rejects(api.request(method, path, { body: { body: 'n' } }),
      (error) => error instanceof NorthstarApiError && error.status === 0 && /UND_ERR_SOCKET/.test(error.message));
    assert.equal(calls.length, 1, `${method} ${path}`);
  }
});

test('a connect-phase failure is retried for any call: the request was never sent', async () => {
  const { fetchImpl, calls } = stubFetch(fetchFailed('ECONNREFUSED'), ok({ id: 1 }));
  const api = createClient({ baseUrl: 'http://127.0.0.1:1', fetchImpl });
  assert.deepEqual(await api.request('POST', '/api/kanban/cards/3/notes', { body: { body: 'n' } }), { id: 1 });
  assert.equal(calls.length, 2);
});

test('there is one retry at most, and the second failure is reported without the token', async () => {
  const { fetchImpl, calls } = stubFetch(fetchFailed('UND_ERR_SOCKET'), fetchFailed('UND_ERR_SOCKET'), ok({}));
  const api = createClient({ baseUrl: 'http://127.0.0.1:1', token: 'sekrit-token', fetchImpl });
  await assert.rejects(api.request('GET', '/api/teams'), (error) => !error.message.includes('sekrit-token'));
  assert.equal(calls.length, 2);
});

test('a timeout or an abort is never retried', async () => {
  for (const name of ['TimeoutError', 'AbortError']) {
    const { fetchImpl, calls } = stubFetch(Object.assign(new Error('stop'), { name }), ok({}));
    const api = createClient({ baseUrl: 'http://127.0.0.1:1', fetchImpl });
    await assert.rejects(api.request('GET', '/api/teams'), NorthstarApiError);
    assert.equal(calls.length, 1, name);
  }
  assert.equal(shouldRetry(fetchFailed('UND_ERR_SOCKET'), false), false);
  assert.equal(shouldRetry(fetchFailed('ECONNRESET'), true), true);
});

// A server that answers the first request on a connection, then drops the connection when a
// second request arrives on it: the stale keep-alive socket, made deterministic.
// let the finished connection go back to the client's keep-alive pool
const pooled = () => new Promise((resolve) => setTimeout(resolve, 50));

async function staleSocketServer(t) {
  const seen = { requests: 0, dropped: 0 };
  const server = createServer((socket) => {
    let answered = false;
    socket.on('data', () => {
      seen.requests += 1;
      if (answered) { seen.dropped += 1; socket.destroy(); return; }
      answered = true;
      const body = '{"ok":true}';
      socket.write(`HTTP/1.1 200 OK\r\ncontent-type: application/json\r\ncontent-length: ${body.length}\r\nconnection: keep-alive\r\n\r\n${body}`);
    });
    socket.on('error', () => {});
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  return { baseUrl: `http://127.0.0.1:${server.address().port}`, seen };
}

test('over a real socket: a read that meets a dropped keep-alive connection succeeds on a new one', async (t) => {
  const { baseUrl, seen } = await staleSocketServer(t);
  const api = createClient({ baseUrl });
  assert.deepEqual(await api.request('GET', '/api/teams'), { ok: true });
  await pooled();
  assert.deepEqual(await api.request('GET', '/api/teams'), { ok: true });   // reuses, is dropped, retries
  assert.equal(seen.dropped, 1);
});

test('over a real socket: a note that meets a dropped connection is reported, not sent twice', async (t) => {
  const { baseUrl, seen } = await staleSocketServer(t);
  const api = createClient({ baseUrl });
  await api.request('GET', '/api/teams');
  await pooled();
  await assert.rejects(api.request('POST', '/api/kanban/cards/1/notes', { body: { body: 'n' } }),
    (error) => error instanceof NorthstarApiError && error.status === 0);
  assert.equal(seen.requests, 2);
});

test('the tools mark exactly their keyed upserts as safe to repeat', async () => {
  const marked = new Map();
  const api = {
    async request(method, path, options = {}) {
      if (method !== 'GET') marked.set(`${method} ${path.replace(/\d+/g, ':n')}`, options.idempotent === true);
      return method === 'GET' ? [] : {};
    },
  };
  const run = (name, args) => tools.find((tool) => tool.name === name).run(api, args);
  await run('upsert_project', { key: 'projectId', project: { name: 'a' } });
  await run('upsert_card', { card: { externalUrl: 'https://x' } });
  await run('upsert_constraint', { name: 'c' });
  await run('define_metric', { key: 'k', label: 'K' });
  await run('remove_metric', { key: 'k' });
  await run('upsert_report', { date: '2026-11-20', markdown: 'm' });
  await run('add_card_note', { cardId: 3, body: 'n' });
  await run('move_project', { id: 3, impact: 5, urgency: 5 });
  assert.deepEqual(Object.fromEntries(marked), {
    'PUT /api/projects/upsert': true,
    'PUT /api/kanban/cards/upsert': true,
    'PUT /api/constraints/upsert': true,
    'PUT /api/progress/metric-defs/k': true,
    'DELETE /api/progress/metric-defs/k': true,
    'PUT /api/progress/reports/:n-:n-:n': true,
    'POST /api/kanban/cards/:n/notes': false,
    'PUT /api/projects/:n': false,
  });
});
