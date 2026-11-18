import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, EmptyState, PageTitle, SearchField, StatusBadge } from '../components/UI';
import EntregaCard from '../components/EntregaCard';
import { canCancel, dateTime, isActive, newestFirst } from '../lib/format';

export default function Entregas({ entregas, profile, onNew, onDetails, onCancel, busy, disabled }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todas');
  const filtered = newestFirst(entregas).filter((e) => {
    const matches = `${e.id} ${e.nomeDestinatario} ${e.enderecoEntrega} ${e.motoboyNome || ''}`.toLowerCase().includes(search.trim().toLowerCase());
    return matches && (filter === 'todas' || (filter === 'ativas' ? isActive(e) : e.status === filter));
  });
  return <>
    <PageTitle title="Minhas entregas" subtitle="Da solicitação até a entrega no destino." action={<Button icon={Plus} disabled={disabled || !profile.ativo} onClick={onNew}>Nova entrega</Button>}/>
    {!profile.ativo && <div className="notice mb-5" role="status">Restaurante inativo. Atualize seu cadastro para solicitar entregas.</div>}
    <section className="surface-card overflow-hidden">
      <div className="flex flex-wrap gap-4 items-center justify-between p-5">
        <div className="flex gap-1 flex-wrap" role="group" aria-label="Filtrar entregas">{[['todas', 'Todas'], ['DISPONIVEL', 'Disponíveis'], ['ativas', 'Em andamento'], ['ENTREGUE', 'Entregues'], ['CANCELADA', 'Canceladas']].map(([id, label]) => <button key={id} className={`pill-tab ${filter === id ? 'active' : ''}`} aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>)}</div>
        <SearchField value={search} onChange={setSearch} placeholder="Buscar entrega ou destinatário..."/>
      </div>
      {!filtered.length ? <EmptyState title="Nenhuma entrega encontrada" description="As solicitações do seu restaurante aparecerão aqui. Ajuste os filtros se necessário."/>
        : <><div className="hidden xl:block overflow-auto"><table className="table-base"><thead><tr><th>Entrega</th><th>Destinatário / destino</th><th>Motoboy</th><th>Status</th><th>Ações</th></tr></thead><tbody>
          {filtered.map((e) => <tr key={e.id}><td className="whitespace-nowrap"><strong>#{e.id}</strong><p className="text-xs text-slate-500 mt-1">{dateTime(e.dataCriacao)}</p></td><td className="max-w-64 break-words"><strong>{e.nomeDestinatario}</strong><p className="text-xs text-slate-600 mt-1">{e.enderecoEntrega}</p></td><td>{e.motoboyNome || 'Aguardando aceitação'}</td><td><StatusBadge status={e.status}/></td><td><div className="flex flex-wrap gap-2"><Button variant="ghost" onClick={() => onDetails(e.id)}>Detalhes</Button>{canCancel(e) && <Button variant="ghost" disabled={disabled || Boolean(busy)} onClick={() => onCancel(e)}>Cancelar entrega</Button>}</div></td></tr>)}
        </tbody></table></div>
        <div className="xl:hidden p-4 pt-0 space-y-4">{filtered.map((e) => <div key={e.id}><EntregaCard entrega={e} onDetails={onDetails}/>{canCancel(e) && <Button className="mt-2 w-full" variant="ghost" disabled={disabled || Boolean(busy)} onClick={() => onCancel(e)}>Cancelar entrega #{e.id}</Button>}</div>)}</div></>}
    </section>
  </>;
}
