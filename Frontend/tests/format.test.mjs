import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ACTIVE_STATUSES, NEXT_STATUS, STATUS, canCancel, canAccept, dateTime, newestFirst } from '../src/lib/format.js';

test('enum da interface corresponde ao enum real do backend', async () => {
  const source = await readFile(new URL('../../src/main/java/com/example/ezfood/entity/StatusEntrega.java', import.meta.url), 'utf8');
  const statuses = source.match(/\b(?:DISPONIVEL|ACEITA|RETIRADA|EM_ROTA|ENTREGUE|CANCELADA)\b/g);
  assert.deepEqual(Object.keys(STATUS), statuses);
  assert.deepEqual(ACTIVE_STATUSES, ['ACEITA', 'RETIRADA', 'EM_ROTA']);
});

test('interface oferece somente as três transições de andamento', () => {
  assert.deepEqual(NEXT_STATUS, { ACEITA: 'RETIRADA', RETIRADA: 'EM_ROTA', EM_ROTA: 'ENTREGUE' });
  assert.equal(NEXT_STATUS.DISPONIVEL, undefined); // Acceptance must identify the courier using /aceitar.
  assert.equal(NEXT_STATUS.ENTREGUE, undefined);
  assert.equal(NEXT_STATUS.CANCELADA, undefined);
});

test('cancelamento depende somente do estado disponível, sem prazo', () => {
  assert.equal(canCancel({ status: 'DISPONIVEL', dataCriacao: '2000-01-01T00:00:00' }), true);
  for (const status of ['ACEITA', 'RETIRADA', 'EM_ROTA', 'ENTREGUE', 'CANCELADA']) assert.equal(canCancel({ status }), false);
});

test('somente motoboy ativo, disponível e sem entrega ativa pode aceitar', () => {
  assert.equal(canAccept({ ativo: true, disponivel: true }, []), true);
  assert.equal(canAccept({ ativo: true, disponivel: true }, [{ status: 'ENTREGUE' }]), true);
  assert.equal(canAccept({ ativo: false, disponivel: true }, []), false);
  assert.equal(canAccept({ ativo: true, disponivel: false }, []), false);
  for (const status of ACTIVE_STATUSES) assert.equal(canAccept({ ativo: true, disponivel: true }, [{ status }]), false);
});

test('dataCadastro e demais datas são formatadas como data e hora', () => {
  assert.notEqual(dateTime('2026-11-17T15:00:00'), '—');
  assert.match(dateTime('2026-11-17T15:00:00'), /15:00/);
  assert.equal(dateTime(null), '—');
  assert.equal(dateTime('inválido'), '—');
});

test('ordena por criação sem modificar os dados recebidos da API', () => {
  const entries = [{ id: 12, dataCriacao: '2026-11-16T15:00:00' }, { id: 45, dataCriacao: '2026-11-17T15:00:00' }];
  assert.deepEqual(newestFirst(entries).map((e) => e.id), [45, 12]);
  assert.deepEqual(entries.map((e) => e.id), [12, 45]);
});
