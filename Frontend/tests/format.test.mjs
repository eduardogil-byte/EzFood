import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTIVE_STATUSES, NEXT_STATUS, STATUS, canCancel, currency } from '../src/lib/format.js';

test('formata valores como moeda brasileira', () => {
  assert.match(currency(46.4), /46,40/);
});

test('status usados no frontend correspondem aos enums da API', () => {
  assert.deepEqual(Object.keys(STATUS), [
    'CRIADO', 'PREPARANDO', 'SAIU_PARA_ENTREGA', 'ENTREGUE', 'CANCELADO',
  ]);
  assert.deepEqual(ACTIVE_STATUSES, ['CRIADO', 'PREPARANDO', 'SAIU_PARA_ENTREGA']);
});

test('somente transições válidas são oferecidas pela interface', () => {
  assert.equal(NEXT_STATUS.CRIADO, 'PREPARANDO');
  assert.equal(NEXT_STATUS.PREPARANDO, 'SAIU_PARA_ENTREGA');
  assert.equal(NEXT_STATUS.SAIU_PARA_ENTREGA, 'ENTREGUE');
  assert.equal(NEXT_STATUS.ENTREGUE, undefined);
  assert.equal(NEXT_STATUS.CANCELADO, undefined);
});

test('cancelamento visual somente para pedido CRIADO dentro do prazo', () => {
  const agora = new Date().toISOString();
  const antigo = new Date(Date.now() - 11 * 60 * 1000).toISOString();
  assert.equal(canCancel({ status: 'CRIADO', dataPedido: agora }), true);
  assert.equal(canCancel({ status: 'CRIADO', dataPedido: antigo }), false);
  assert.equal(canCancel({ status: 'ENTREGUE', dataPedido: agora }), false);
});
