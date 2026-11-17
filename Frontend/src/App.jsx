import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { api } from './lib/api';
import { NEXT_STATUS, STATUS } from './lib/format';
import { Shell } from './components/Shell';
import { Button, ConfirmDialog, LoadingState, Toast } from './components/UI';
import EntityModal from './components/EntityModal';
import PedidoDetalhes from './components/PedidoDetalhes';
import Dashboard from './pages/Dashboard';
import Pedidos from './pages/Pedidos';
import Clientes from './pages/Clientes';
import Restaurantes from './pages/Restaurantes';

export default function App() {
  const [view, setView] = useState('dashboard');
  const [clientes, setClientes] = useState([]);
  const [restaurantes, setRestaurantes] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [modal, setModal] = useState(null);
  const [pedidoDetalheId, setPedidoDetalheId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = (message, type = 'success') => setToast({ message, type, key: Date.now() });

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 5500);
    return () => clearTimeout(timeout);
  }, [toast]);

  const refresh = useCallback(async () => {
    setLoading(true);
    const results = await Promise.allSettled([api.getClientes(), api.getRestaurantes(), api.getPedidos()]);
    const setters = [setClientes, setRestaurantes, setPedidos];
    results.forEach((result, i) => {
      if (result.status === 'fulfilled') setters[i](Array.isArray(result.value) ? result.value : []);
    });
    const failures = results.filter(r=>r.status === 'rejected');
    setApiError(failures.length ? (failures[0].reason?.message || 'Não foi possível carregar todos os dados.') : '');
    setLoading(false);
    return failures.length === 0;
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const openModal = (type, mode = 'create', entity = null) => setModal({ type, mode, entity });

  async function saveEntity(type, mode, payload, entity) {
    if (type === 'cliente') {
      if (mode === 'edit') await api.updateCliente(entity.id, payload);
      else await api.createCliente(payload);
    } else if (type === 'restaurante') {
      if (mode === 'edit') await api.updateRestaurante(entity.id, payload);
      else await api.createRestaurante(payload);
    } else if (type === 'pedido') {
      await api.createPedido(payload);
    }
    setModal(null);
    notify(`${type === 'cliente' ? 'Cliente' : type === 'restaurante' ? 'Restaurante' : 'Pedido'} ${mode === 'edit' ? 'atualizado' : 'cadastrado'} com sucesso.`);
    await refresh();
  }

  async function handleConfirm() {
    if (!confirm) return;
    setConfirmBusy(true);
    try {
      const { type, entity } = confirm;
      if (type === 'deleteCliente') await api.deleteCliente(entity.id);
      else if (type === 'deleteRestaurante') await api.deleteRestaurante(entity.id);
      else if (type === 'cancelPedido') await api.updatePedidoStatus(entity.id, 'CANCELADO');
      setConfirm(null);
      notify(type === 'cancelPedido' ? `Pedido #${entity.id} cancelado.` : 'Registro excluído com sucesso.');
      await refresh();
    } catch (err) { notify(err.message, 'error'); }
    finally { setConfirmBusy(false); }
  }

  async function handleAdvance(order) {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setUpdatingId(order.id);
    try {
      await api.updatePedidoStatus(order.id, next);
      notify(`Pedido #${order.id}: ${STATUS[next].label}.`);
      await refresh();
    } catch (err) { notify(err.message, 'error'); }
    finally { setUpdatingId(null); }
  }

  async function toggleRestaurante(entity) {
    setTogglingId(entity.id);
    try {
      await api.updateRestaurante(entity.id, {
        nome: entity.nome, cnpj: entity.cnpj, categoria: entity.categoria,
        taxaEntrega: Number(entity.taxaEntrega), aberto: !entity.aberto,
      });
      notify(`Restaurante ${entity.aberto ? 'fechado' : 'aberto'} com sucesso.`);
      await refresh();
    } catch (err) { notify(err.message, 'error'); }
    finally { setTogglingId(null); }
  }

  let content;
  if (view === 'dashboard') content = <Dashboard clientes={clientes} restaurantes={restaurantes} pedidos={pedidos} navigate={setView} onNewPedido={() => openModal('pedido')} onViewPedido={setPedidoDetalheId} />;
  else if (view === 'pedidos') content = <Pedidos pedidos={pedidos} onAdd={() => openModal('pedido')} onAdvance={handleAdvance} onCancel={entity => setConfirm({ type: 'cancelPedido', entity })} updatingId={updatingId} onViewPedido={setPedidoDetalheId}/>;
  else if (view === 'clientes') content = <Clientes clientes={clientes} pedidos={pedidos} onAdd={() => openModal('cliente')} onEdit={entity => openModal('cliente','edit',entity)} onDelete={entity => setConfirm({type:'deleteCliente',entity})}/>;
  else content = <Restaurantes restaurantes={restaurantes} pedidos={pedidos} onAdd={() => openModal('restaurante')} onEdit={entity => openModal('restaurante','edit',entity)} onDelete={entity => setConfirm({type:'deleteRestaurante',entity})} onToggle={toggleRestaurante} togglingId={togglingId}/>;

  return <>
    <Shell current={view} onNavigate={setView} onNewPedido={() => openModal('pedido')} onRefresh={refresh} loading={loading} apiError={apiError}>
      {apiError && <div role="alert" className="mb-7 rounded-[14px] p-4 sm:p-5 bg-[#FFF7ED] border border-[#FED7AA] flex flex-wrap items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-white text-[#C2410C] grid place-items-center"><AlertTriangle size={21}/></div>
        <div className="flex-1 min-w-[180px]"><p className="font-extrabold text-sm text-[#994e32]">Não foi possível carregar a API por completo</p><p className="text-xs text-[#b97a60] mt-1">{apiError}</p></div>
        <Button variant="ghost" icon={RefreshCcw} onClick={refresh}>Tentar novamente</Button>
      </div>}
      {loading && !clientes.length && !restaurantes.length && !pedidos.length ? <LoadingState/> : content}
    </Shell>
    {pedidoDetalheId !== null && <PedidoDetalhes key={pedidoDetalheId} pedidoId={pedidoDetalheId} onClose={() => setPedidoDetalheId(null)}/>}
    {modal && <EntityModal key={`${modal.type}-${modal.mode}-${modal.entity?.id || 'new'}`} type={modal.type} mode={modal.mode} entity={modal.entity} clientes={clientes} restaurantes={restaurantes} onSave={saveEntity} onClose={() => setModal(null)}/>}
    {confirm && <ConfirmDialog title={confirm.type === 'cancelPedido' ? `Cancelar pedido #${confirm.entity.id}?` : `Excluir ${confirm.type === 'deleteCliente' ? 'cliente' : 'restaurante'}?`} description={confirm.type === 'cancelPedido' ? 'O pedido só pode ser cancelado em até 10 minutos e enquanto estiver CRIADO.' : `Você está prestes a excluir ${confirm.entity.nome}.`} destructive={confirm.type !== 'cancelPedido'} onCancel={() => setConfirm(null)} onConfirm={handleConfirm} busy={confirmBusy}/>}
    <Toast toast={toast} dismiss={() => setToast(null)}/>
  </>;
}
