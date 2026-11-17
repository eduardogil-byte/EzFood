export const currency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));

export const dateTime = (value) => value
  ? new Date(value).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '—';

export const dateOnly = (value) => value
  ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR')
  : '—';

export const initials = (value = '') => value.trim().split(/\s+/).slice(0, 2).map((v) => v[0] || '').join('').toUpperCase() || 'EF';

export const number = (value) => new Intl.NumberFormat('pt-BR').format(value || 0);

export const STATUS = {
  CRIADO: { label: 'Criado', tone: 'blue' },
  PREPARANDO: { label: 'Preparando', tone: 'amber' },
  SAIU_PARA_ENTREGA: { label: 'Em entrega', tone: 'purple' },
  ENTREGUE: { label: 'Entregue', tone: 'green' },
  CANCELADO: { label: 'Cancelado', tone: 'red' },
};

export const NEXT_STATUS = {
  CRIADO: 'PREPARANDO',
  PREPARANDO: 'SAIU_PARA_ENTREGA',
  SAIU_PARA_ENTREGA: 'ENTREGUE',
};

export const ACTIVE_STATUSES = ['CRIADO', 'PREPARANDO', 'SAIU_PARA_ENTREGA'];

export const canCancel = (pedido) => pedido.status === 'CRIADO' &&
  Date.now() <= new Date(pedido.dataPedido).getTime() + 10 * 60 * 1000;
