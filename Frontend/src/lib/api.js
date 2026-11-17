const API_BASE = (import.meta.env.VITE_API_BASE || '/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(path, options = {}) {
  const { method = 'GET', body, ...rest } = options;
  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...rest.headers,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      ...rest,
    });
  } catch {
    throw new ApiError('Não foi possível conectar à API. Verifique se o Spring Boot está em execução na porta 8080.');
  }

  if (response.status === 204) return null;

  const text = await response.text();
  let result = null;
  try { result = text ? JSON.parse(text) : null; } catch { result = text; }

  if (!response.ok) {
    const details = typeof result === 'object' && result
      ? result.mensagem || result.message || result.error
      : null;
    throw new ApiError(details || `Erro na requisição (HTTP ${response.status}).`, response.status);
  }
  return result;
}

export const api = {
  getClientes: () => request('/clientes'),
  getCliente: (id) => request(`/clientes/${id}`),
  buscarClientes: (nome) => request(`/clientes/busca?nome=${encodeURIComponent(nome)}`),
  getPedidosCliente: (id) => request(`/clientes/${id}/pedidos`),
  createCliente: (data) => request('/clientes', { method: 'POST', body: data }),
  updateCliente: (id, data) => request(`/clientes/${id}`, { method: 'PUT', body: data }),
  deleteCliente: (id) => request(`/clientes/${id}`, { method: 'DELETE' }),
  getRestaurantes: () => request('/restaurantes'),
  getRestaurante: (id) => request(`/restaurantes/${id}`),
  buscarRestaurantes: (nome) => request(`/restaurantes/busca?nome=${encodeURIComponent(nome)}`),
  getPedidosRestaurante: (id) => request(`/restaurantes/${id}/pedidos`),
  createRestaurante: (data) => request('/restaurantes', { method: 'POST', body: data }),
  updateRestaurante: (id, data) => request(`/restaurantes/${id}`, { method: 'PUT', body: data }),
  deleteRestaurante: (id) => request(`/restaurantes/${id}`, { method: 'DELETE' }),
  getPedidos: () => request('/pedidos'),
  getPedido: (id) => request(`/pedidos/${id}`),
  createPedido: (data) => request('/pedidos', { method: 'POST', body: data }),
  updatePedidoStatus: (id, status) => request(`/pedidos/${id}/status`, { method: 'PATCH', body: { status } }),
};
