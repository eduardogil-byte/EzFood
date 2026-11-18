import { Bike, CheckCircle2, Clock3, Package, Plus } from 'lucide-react';
import { Button, EmptyState, InlineLink, PageTitle, StatusBadge } from '../components/UI';
import { dateTime, isActive, newestFirst, number } from '../lib/format';

function Metric({ label, value, icon: Icon }) {
  return <div className="surface-card p-4 sm:p-5">
    <Icon size={23} className="text-[#111827] mb-4"/>
    <p className="text-xs sm:text-sm font-semibold text-slate-600">{label}</p>
    <p className="font-display font-extrabold text-[30px] tracking-tight mt-2">{number(value)}</p>
  </div>;
}

export default function Dashboard({ entregas, profile, onNew, onDetails, onNavigate, disabled }) {
  const recent = newestFirst(entregas).slice(0, 5);
  return <>
    <PageTitle title="Visão geral" subtitle="Acompanhe suas solicitações de entrega." action={<Button icon={Plus} onClick={onNew} disabled={disabled || !profile.ativo}>Nova entrega</Button>}/>
    {!profile.ativo && <div className="notice mb-6" role="status">Restaurante inativo. Ative seu cadastro em “Meu cadastro” para solicitar entregas.</div>}
    <section aria-label="Resumo das entregas" className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5 mb-7">
      <Metric label="Total de entregas" value={entregas.length} icon={Package}/>
      <Metric label="Disponíveis" value={entregas.filter((e) => e.status === 'DISPONIVEL').length} icon={Clock3}/>
      <Metric label="Em andamento" value={entregas.filter(isActive).length} icon={Bike}/>
      <Metric label="Concluídas" value={entregas.filter((e) => e.status === 'ENTREGUE').length} icon={CheckCircle2}/>
    </section>
    <section className="surface-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-6"><h2 className="section-title">Entregas recentes</h2>{recent.length > 0 && <InlineLink onClick={() => onNavigate('entregas')}>Ver todas</InlineLink>}</div>
      {recent.length ? <>
        <div className="hidden md:block overflow-auto"><table className="table-base"><thead><tr><th>Entrega</th><th>Destinatário / destino</th><th>Motoboy</th><th>Status</th></tr></thead><tbody>
          {recent.map((e) => <tr key={e.id}><td><button className="text-[#C2410C] font-bold min-h-11" onClick={() => onDetails(e.id)}>#{e.id}</button><p className="text-xs text-slate-500">{dateTime(e.dataCriacao)}</p></td><td><p className="font-semibold">{e.nomeDestinatario}</p><p className="text-xs text-slate-600 mt-1 max-w-64 break-words">{e.enderecoEntrega}</p></td><td>{e.motoboyNome || 'Aguardando aceitação'}</td><td><StatusBadge status={e.status}/></td></tr>)}
        </tbody></table></div>
        <div className="md:hidden divide-y divide-[#F0E3D6]">{recent.map((e) => <button key={e.id} className="w-full text-left p-5 space-y-2" onClick={() => onDetails(e.id)}><div className="flex justify-between gap-3"><strong className="text-sm">Entrega #{e.id}</strong><StatusBadge status={e.status}/></div><p className="text-sm font-semibold break-words">{e.nomeDestinatario}</p><p className="text-sm text-slate-600 break-words">{e.enderecoEntrega}</p><p className="text-xs text-slate-500">{e.motoboyNome || 'Aguardando aceitação'}</p></button>)}</div>
      </> : <EmptyState title="Nenhuma entrega por aqui" description="Crie sua primeira solicitação para começar." action={<Button icon={Plus} onClick={onNew} disabled={disabled || !profile.ativo}>Nova entrega</Button>}/>}
    </section>
  </>;
}
