export const SESSION_KEY = 'ezfood.perfil';

export function readSession(storage) {
  try {
    storage ??= globalThis.localStorage;
    const value = JSON.parse(storage.getItem(SESSION_KEY));
    return value && ['restaurante', 'motoboy'].includes(value.type)
      && Number.isSafeInteger(value.id) && value.id > 0
      ? { type: value.type, id: value.id } : null;
  } catch { return null; }
}

export function saveSession(session, storage) {
  try {
    storage ??= globalThis.localStorage;
    if (session) storage.setItem(SESSION_KEY, JSON.stringify(session));
    else storage.removeItem(SESSION_KEY);
    return true;
  } catch { return false; }
}
