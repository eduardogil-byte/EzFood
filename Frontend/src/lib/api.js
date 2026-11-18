const API_BASE = (import.meta.env?.VITE_API_BASE || '/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function request(path, { method = 'GET', body, signal, headers, ...options } = {}) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  signal?.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(abort, 12000);
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options, method, signal: controller.signal,
      headers: { Accept: 'application/json', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    if (response.status === 204) return null;
    const text = await response.text();
    let result = null;
    try { result = text ? JSON.parse(text) : null; } catch { /* Non-JSON server/proxy errors use a safe fallback below. */ }
    if (!response.ok) {
      throw new ApiError(result?.mensagem || result?.message || result?.error || `Erro na requisição (HTTP ${response.status}).`, response.status);
    }
    return result;
  } catch (error) {
    if (error instanceof ApiError || signal?.aborted) throw error;
    throw new ApiError(controller.signal.aborted
      ? 'A API demorou para responder. Atualize os dados antes de tentar novamente.'
      : 'Não foi possível conectar à API. Verifique a conexão e se o backend está em execução.');
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}

const get = (path, signal) => request(path, { signal });
export const api = {
  getRestaurantes: (signal) => get('/restaurantes', signal),
  buscarRestaurantes: (nome, signal) => get(`/restaurantes/busca?nome=${encodeURIComponent(nome)}`, signal),
  getRestaurante: (id, signal) => get(`/restaurantes/${id}`, signal),
  createRestaurante: (body) => request('/restaurantes', { method: 'POST', body }),
  updateRestaurante: (id, body) => request(`/restaurantes/${id}`, { method: 'PUT', body }),
  deleteRestaurante: (id) => request(`/restaurantes/${id}`, { method: 'DELETE' }),
  getEntregasRestaurante: (id, signal) => get(`/restaurantes/${id}/entregas`, signal),
  getMotoboys: (signal) => get('/motoboys', signal),
  getMotoboy: (id, signal) => get(`/motoboys/${id}`, signal),
  createMotoboy: (body) => request('/motoboys', { method: 'POST', body }),
  updateMotoboy: (id, body) => request(`/motoboys/${id}`, { method: 'PUT', body }),
  updateDisponibilidade: (id, disponivel) => request(`/motoboys/${id}/disponibilidade`, { method: 'PATCH', body: { disponivel } }),
  getEntregasMotoboy: (id, signal) => get(`/motoboys/${id}/entregas`, signal),
  getEntregas: (signal) => get('/entregas', signal),
  getEntrega: (id, signal) => get(`/entregas/${id}`, signal),
  getDisponiveis: (signal) => get('/entregas/disponiveis', signal),
  createEntrega: (body) => request('/entregas', { method: 'POST', body }),
  aceitarEntrega: (id, motoboyId) => request(`/entregas/${id}/aceitar`, { method: 'PATCH', body: { motoboyId } }),
  updateEntregaStatus: (id, status) => request(`/entregas/${id}/status`, { method: 'PATCH', body: { status } }),
};
