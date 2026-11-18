import { Bike, RefreshCcw } from 'lucide-react';
import EntregaCard from '../components/EntregaCard';
import { Button, EmptyState, PageTitle } from '../components/UI';
import { canAccept, isActive, newestFirst } from '../lib/format';

export default function Motoboy({ view, profile, entregas, disponiveis, onAccept, onAdvance, onDetails, onAvailability, onRefresh, busy, disabled }) {
  const active = entregas.find(isActive);
  const accepting = canAccept(profile, entregas) && !disabled && !busy;
  const reason = !profile.ativo ? 'Cadastro inativo. Ative seu cadastro para aceitar entregas.'
    : active ? 'Você já tem uma entrega ativa. Conclua antes de aceitar outra.'
    : !profile.disponivel ? 'Você está indisponível. Ative sua disponibilidade para aceitar entregas.' : null;
  const history = newestFirst(entregas.filter((e) => !isActive(e)));
  return <>
    <PageTitle title={view === 'historico' ? 'Histórico de entregas' : view === 'ativa' ? 'Minha entrega' : 'Suas entregas, em movimento.'} subtitle={view === 'historico' ? 'Suas entregas concluídas.' : undefined}/>
    {view !== 'historico' && <>
      <section className="surface-card p-5 mb-5 flex items-center justify-between gap-3">
        <div><h2 className="text-sm font-bold">Disponibilidade</h2><p className="text-xs text-slate-600 mt-1">{profile.disponivel ? 'Disponível' : 'Indisponível'}</p></div>
        <button className="availability-switch" role="switch" aria-label="Disponibilidade para entregas" aria-checked={profile.disponivel} disabled={Boolean(busy) || disabled} onClick={() => onAvailability(!profile.disponivel)}><span className={profile.disponivel ? 'on' : ''}/></button>
      </section>
      {reason && <div className="notice mb-6" role="status">{reason}</div>}
      <section className="mb-7">
        <h2 className="section-title mb-4">Entrega ativa</h2>
        {active ? <EntregaCard entrega={active} onDetails={onDetails} onAdvance={onAdvance} actionDisabled={disabled || Boolean(busy)} busy={busy === 'status'}/>
          : <div className="surface-card p-6 sm:p-8 text-center"><Bike size={32} className="mx-auto text-slate-500 mb-3"/><p className="text-sm font-semibold">Você não tem entrega ativa.</p></div>}
      </section>
    </>}
    {view === 'dashboard' && <section>
      <div className="flex items-center justify-between gap-3 mb-4"><h2 className="section-title">Entregas disponíveis</h2><Button variant="ghost" icon={RefreshCcw} onClick={onRefresh} disabled={disabled}>Atualizar</Button></div>
      {disponiveis.length ? <div className="grid gap-4 xl:grid-cols-2">{newestFirst(disponiveis).map((e) => <EntregaCard key={e.id} entrega={e} onDetails={onDetails} onAccept={onAccept} acceptDisabled={!accepting} busy={busy === `aceitar-${e.id}`}/>)}</div>
        : <section className="surface-card"><EmptyState title="Nenhuma entrega disponível" description="Novas solicitações aparecerão aqui."/></section>}
    </section>}
    {view === 'historico' && (history.length ? <div className="grid gap-4 xl:grid-cols-2">{history.map((e) => <EntregaCard key={e.id} entrega={e} onDetails={onDetails}/>)}</div>
      : <section className="surface-card"><EmptyState title="Seu histórico começa aqui" description="As entregas concluídas aparecerão nesta lista."/></section>)}
  </>;
}
