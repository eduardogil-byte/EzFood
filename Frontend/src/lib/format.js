export const dateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};
export const initials = (value = '') => value.trim().split(/\s+/).slice(0, 2).map((v) => v[0] || '').join('').toUpperCase() || 'EF';
export const number = (value) => new Intl.NumberFormat('pt-BR').format(value || 0);
export const STATUS = {
  DISPONIVEL: { label: 'Disponível', tone: 'amber' },
  ACEITA: { label: 'Aceita', tone: 'blue' },
  RETIRADA: { label: 'Retirada', tone: 'purple' },
  EM_ROTA: { label: 'Em rota', tone: 'purple' },
  ENTREGUE: { label: 'Entregue', tone: 'green' },
  CANCELADA: { label: 'Cancelada', tone: 'gray' },
};
export const NEXT_STATUS = { ACEITA: 'RETIRADA', RETIRADA: 'EM_ROTA', EM_ROTA: 'ENTREGUE' };
export const NEXT_LABEL = { ACEITA: 'Confirmar retirada', RETIRADA: 'Iniciar rota', EM_ROTA: 'Concluir entrega' };
export const ACTIVE_STATUSES = ['ACEITA', 'RETIRADA', 'EM_ROTA'];
export const isActive = (entrega) => ACTIVE_STATUSES.includes(entrega.status);
export const canCancel = (entrega) => entrega.status === 'DISPONIVEL';
export const canAccept = (profile, entregas) => Boolean(profile?.ativo && profile?.disponivel && !entregas.some(isActive));
export const newestFirst = (entregas) => [...entregas].sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao) || b.id - a.id);
