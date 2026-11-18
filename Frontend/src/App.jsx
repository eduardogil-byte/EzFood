import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './lib/api';
import { readSession, saveSession } from './lib/session';
import { NEXT_STATUS } from './lib/format';
import { usePolling } from './hooks/usePolling';
import { Shell } from './components/Shell';
import { Button, ConfirmDialog, LoadingState, Toast } from './components/UI';
import EntityModal from './components/EntityModal';
import EntregaDetalhes from './components/EntregaDetalhes';
import Perfil from './pages/Perfil';
import Dashboard from './pages/Dashboard';
import Entregas from './pages/Entregas';
import Motoboy from './pages/Motoboy';
import Cadastro from './pages/Cadastro';

function Workspace({ session, onSwitch, onMissing, notify }) {
  const [view, setView] = useState('dashboard');
  const [modal, setModal] = useState(null);
  const [detailsId, setDetailsId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState('');
  const actionLock = useRef(false);
  const restaurant = session.type === 'restaurante';

  const load = useCallback(async (signal) => {
    let profile;
    try {
      profile = await (session.type === 'restaurante' ? api.getRestaurante(session.id, signal) : api.getMotoboy(session.id, signal));
    } catch (error) {
      if (error.status === 404) error.profileMissing = true;
      throw error;
    }
    const [entregas, disponiveis, detail] = await Promise.all([
      session.type === 'restaurante' ? api.getEntregasRestaurante(session.id, signal) : api.getEntregasMotoboy(session.id, signal),
      session.type === 'motoboy' ? api.getDisponiveis(signal) : [],
      detailsId ? api.getEntrega(detailsId, signal).then((entrega) => ({ entrega })).catch((error) => {
        if (signal.aborted) throw error;
        return { error: error.message };
      }) : null,
    ]);
    return { profile, entregas, disponiveis, detail, detailsId };
  }, [session.type, session.id, detailsId]);
  const { data, error, loading, refresh } = usePolling(load);

  useEffect(() => { if (error?.profileMissing) onMissing(); }, [error, onMissing]);
  const disabled = Boolean(error) || Boolean(busy);

  async function runAction(key, operation, success, propagate = false) {
    if (actionLock.current) {
      if (propagate) throw new Error('Aguarde a operação atual terminar.');
      return;
    }
    actionLock.current = true;
    setBusy(key);
    try {
      const result = await operation();
      notify(success);
      setConfirm(null);
      return result;
    } catch (err) {
      notify(err.message || 'Não foi possível concluir a operação.', 'error');
      if (propagate) throw err;
    } finally {
      await refresh();
      actionLock.current = false;
      setBusy('');
    }
  }

  async function saveEntity(type, payload, entity) {
    await runAction('salvar', () => {
      if (type === 'entrega') return api.createEntrega(payload);
      if (type === 'restaurante') return api.updateRestaurante(entity.id, payload);
      return api.updateMotoboy(entity.id, payload);
    }, type === 'entrega' ? 'Solicitação de entrega criada.' : 'Cadastro atualizado.', true);
    setModal(null);
  }

  function advance(entrega) {
    const next = NEXT_STATUS[entrega.status];
    if (!next) return;
    if (next === 'ENTREGUE') setConfirm({ kind: 'concluir', entrega });
    else runAction('status', () => api.updateEntregaStatus(entrega.id, next), next === 'RETIRADA' ? 'Retirada confirmada.' : 'Entrega em rota.');
  }

  function confirmAction() {
    if (confirm.kind === 'excluir') {
      runAction('excluir', async () => {
        await api.deleteRestaurante(session.id);
        onSwitch();
      }, 'Cadastro excluído.');
    } else {
      const status = confirm.kind === 'cancelar' ? 'CANCELADA' : 'ENTREGUE';
      runAction('status', () => api.updateEntregaStatus(confirm.entrega.id, status), status === 'ENTREGUE' ? 'Entrega concluída. Você pode aceitar outra solicitação.' : 'Entrega cancelada.');
    }
  }

  const onDetails = (id) => setDetailsId(id);
  const profile = data?.profile;
  let content;
  if (!data) content = error
    ? <div className="surface-card p-7"><h1 className="section-title mb-3">Não foi possível carregar seu perfil</h1><p className="text-sm text-slate-600 mb-5">Verifique a conexão e tente novamente.</p><Button onClick={refresh} disabled={loading}>Tentar novamente</Button></div>
    : <LoadingState/>;
  else if (view === 'cadastro') content = <Cadastro type={session.type} profile={profile} onEdit={() => setModal(session.type)} onDelete={() => setConfirm({ kind: 'excluir' })} disabled={disabled}/>;
  else if (restaurant && view === 'dashboard') content = <Dashboard profile={profile} entregas={data.entregas} onNew={() => setModal('entrega')} onDetails={onDetails} onNavigate={setView} disabled={disabled}/>;
  else if (restaurant) content = <Entregas profile={profile} entregas={data.entregas} onNew={() => setModal('entrega')} onDetails={onDetails} onCancel={(entrega) => setConfirm({ kind: 'cancelar', entrega })} busy={busy} disabled={disabled}/>;
  else content = <Motoboy view={view} profile={profile} entregas={data.entregas} disponiveis={data.disponiveis} onDetails={onDetails} onRefresh={refresh} busy={busy} disabled={Boolean(error)}
    onAvailability={(value) => runAction('disponibilidade', () => api.updateDisponibilidade(session.id, value), value ? 'Você está disponível para entregas.' : 'Disponibilidade desativada.')}
    onAccept={(entrega) => runAction(`aceitar-${entrega.id}`, () => api.aceitarEntrega(entrega.id, session.id), 'Entrega aceita. Ela já está na sua entrega ativa.')}
    onAdvance={advance}/>;

  return <Shell type={session.type} profile={profile} current={view} onNavigate={(next) => { setView(next); setDetailsId(null); }} onRefresh={refresh} onSwitch={() => { if (!actionLock.current) onSwitch(); }} loading={loading} apiError={error?.message}>
    {content}
    {modal && profile && <EntityModal key={modal} type={modal} entity={modal === 'entrega' ? null : profile} profile={profile} onSave={saveEntity} onClose={() => setModal(null)}/>}
    {detailsId && <EntregaDetalhes id={detailsId} entrega={data?.detail?.entrega?.id === detailsId ? data.detail.entrega : null} error={(data?.detailsId === detailsId ? data?.detail?.error : null) || error?.message} onClose={() => setDetailsId(null)}/>}
    {confirm && <ConfirmDialog title={confirm.kind === 'excluir' ? 'Excluir cadastro?' : confirm.kind === 'cancelar' ? `Cancelar entrega #${confirm.entrega.id}?` : `Concluir entrega #${confirm.entrega.id}?`}
      description={confirm.kind === 'excluir' ? 'A exclusão só é permitida se não houver entregas vinculadas.' : confirm.kind === 'cancelar' ? 'A solicitação deixará de aparecer para os motoboys.' : 'Confirme que a entrega chegou ao destinatário.'}
      destructive={confirm.kind === 'excluir'} busy={Boolean(busy)} onCancel={() => { if (!actionLock.current) setConfirm(null); }} onConfirm={confirmAction}/>}
  </Shell>;
}

export default function App() {
  const [session, setSession] = useState(() => readSession());
  const [notice, setNotice] = useState('');
  const [toast, setToast] = useState(null);
  const notify = useCallback((message, type = 'success') => setToast({ message, type, key: Date.now() }), []);
  const switchProfile = useCallback(() => {
    saveSession(null);
    setSession(null);
    setNotice('');
  }, []);
  const missing = useCallback(() => {
    saveSession(null);
    setSession(null);
    setNotice('Cadastro não encontrado. O banco pode ter sido reiniciado. Selecione outro cadastro ou crie um novo.');
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 6500);
    return () => clearTimeout(timer);
  }, [toast]);

  function selectProfile(selected) {
    if (!saveSession(selected)) notify('Perfil selecionado. O navegador não permitiu salvar a seleção para o próximo acesso.', 'error');
    setSession(selected);
    setNotice('');
  }

  return <>
    {session ? <Workspace key={`${session.type}-${session.id}`} session={session} onSwitch={switchProfile} onMissing={missing} notify={notify}/>
      : <Perfil onSelect={selectProfile} notice={notice}/>}
    <Toast toast={toast} dismiss={() => setToast(null)}/>
  </>;
}
