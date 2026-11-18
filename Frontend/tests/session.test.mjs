import test from 'node:test';
import assert from 'node:assert/strict';
import { readSession, saveSession, SESSION_KEY } from '../src/lib/session.js';

function memory() {
  const entries = new Map();
  return { getItem: (key) => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value), removeItem: (key) => entries.delete(key) };
}

test('preserva tipo e ID real selecionado, sem criar perfil padrão', () => {
  const storage = memory();
  assert.equal(readSession(storage), null);
  assert.equal(saveSession({ type: 'motoboy', id: 89 }, storage), true);
  assert.deepEqual(readSession(storage), { type: 'motoboy', id: 89 });
  saveSession(null, storage);
  assert.equal(readSession(storage), null);
});

test('ignora seleção corrompida ou fora do contrato', () => {
  const storage = memory();
  for (const value of ['inválido', 'null', '{}', '{"type":"motoboy","id":0}', '{"type":"motoboy","id":"89"}', '{"type":"outro","id":89}']) {
    storage.setItem(SESSION_KEY, value);
    assert.equal(readSession(storage), null);
  }
});

test('bloqueio do armazenamento não impede usar a aplicação', () => {
  const storage = { getItem() { throw new Error('Bloqueado'); }, setItem() { throw new Error('Bloqueado'); }, removeItem() { throw new Error('Bloqueado'); } };
  assert.equal(readSession(storage), null);
  assert.equal(saveSession({ type: 'restaurante', id: 37 }, storage), false);
  assert.equal(saveSession(null, storage), false);
});
