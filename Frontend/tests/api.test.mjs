import test from 'node:test';
import assert from 'node:assert/strict';
import { api, request, ApiError } from '../src/lib/api.js';

test('aceitação envia o ID real ao endpoint exclusivo e não repete após 409', async (t) => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, options });
    return new Response(JSON.stringify({ mensagem: 'Entrega não está disponível.' }), { status: 409 });
  });
  await assert.rejects(api.aceitarEntrega(567, 89), (error) => error instanceof ApiError
    && error.status === 409 && error.message === 'Entrega não está disponível.');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, '/api/entregas/567/aceitar');
  assert.equal(calls[0].options.method, 'PATCH');
  assert.deepEqual(JSON.parse(calls[0].options.body), { motoboyId: 89 });
});

test('204 é retornado sem tentativa de leitura do corpo', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({ status: 204, text() { throw new Error('O corpo não deve ser lido'); } }));
  assert.equal(await api.deleteRestaurante(37), null);
});

test('disponibilidade false é serializada como booleano e preserva headers', async (t) => {
  let call;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    call = { url, options };
    return Response.json({ id: 89, disponivel: false });
  });
  assert.equal((await api.updateDisponibilidade(89, false)).disponivel, false);
  assert.equal(call.url, '/api/motoboys/89/disponibilidade');
  assert.deepEqual(JSON.parse(call.options.body), { disponivel: false });
  assert.equal(call.options.headers['Content-Type'], 'application/json');
});

test('status usa somente o payload de andamento', async (t) => {
  let call;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    call = { url, options };
    return Response.json({ status: 'RETIRADA' });
  });
  await api.updateEntregaStatus(567, 'RETIRADA');
  assert.equal(call.url, '/api/entregas/567/status');
  assert.deepEqual(JSON.parse(call.options.body), { status: 'RETIRADA' });
});

test('erros HTTP 400 e 404 preservam mensagem e código', async (t) => {
  for (const status of [400, 404]) {
    t.mock.method(globalThis, 'fetch', async () => Response.json({ mensagem: 'Mensagem do backend' }, { status }));
    await assert.rejects(api.getEntrega(567), (error) => error.status === status && error.message === 'Mensagem do backend');
    t.mock.restoreAll();
  }
});

test('falha de rede fornece mensagem utilizável pela interface', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => { throw new TypeError('Failed to fetch'); });
  await assert.rejects(api.getDisponiveis(), (error) => error instanceof ApiError && error.status === 0 && /conectar/.test(error.message));
});

test('erro não JSON do proxy não exibe HTML como mensagem', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('<html>Bad Gateway</html>', { status: 502 }));
  await assert.rejects(request('/entregas'), (error) => error.status === 502 && !error.message.includes('<html>'));
});

test('cancelamento de requisição não é transformado em falha de conexão', async (t) => {
  const controller = new AbortController();
  controller.abort();
  t.mock.method(globalThis, 'fetch', async (_url, { signal }) => { signal.throwIfAborted(); });
  await assert.rejects(api.getDisponiveis(controller.signal), (error) => error.name === 'AbortError');
});

test('busca por nome é codificada e GET não envia corpo', async (t) => {
  let call;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    call = { url, options };
    return Response.json([]);
  });
  assert.deepEqual(await api.buscarRestaurantes('Café & Pão'), []);
  assert.equal(call.url, '/api/restaurantes/busca?nome=Caf%C3%A9%20%26%20P%C3%A3o');
  assert.equal(call.options.body, undefined);
});
