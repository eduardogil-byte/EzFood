import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Clock3, Plus, ShoppingBag, XCircle } from 'lucide-react';
import { Button, EmptyState, PageTitle, SearchField, StatusBadge } from '../components/UI';
import { ACTIVE_STATUSES, canCancel, currency, dateTime, NEXT_STATUS, STATUS } from '../lib/format';

export default function Pedidos({ pedidos, onAdd, onAdvance, onCancel, updatingId, onViewPedido }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');
  const filtered = useMemo(() => [...pedidos].sort((a,b)=>new Date(b.dataPedido)-new Date(a.dataPedido)).filter(p => {
    const matches = `${p.id} ${p.clienteNome} ${p.restauranteNome}`.toLowerCase().includes(search.trim().toLowerCase());
    return matches && (filter === 'todos' || (filter === 'ativos' && ACTIVE_STATUSES.includes(p.status)) || (filter === 'entregues' && p.status === 'ENTREGUE') || (filter === 'cancelados' && p.status === 'CANCELADO'));
  }), [pedidos, search, filter]);

  return <>
    <PageTitle eyebrow="Operação" title="Pedidos" subtitle="Acompanhe o andamento dos pedidos em tempo real, atualizando quando necessário." action={<Button icon={Plus} onClick={onAdd}>Novo pedido</Button>}/>
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[
        {label:'Todos os pedidos',value:pedidos.length, icon:ShoppingBag, color:'text-[#C2410C]',bg:'bg-[#FFEDD5]'},
        {label:'Em andamento',value:pedidos.filter(p=>ACTIVE_STATUSES.includes(p.status)).length,icon:Clock3,color:'text-[#8b78d6]',bg:'bg-[#f2edff]'},
        {label:'Entregues',value:pedidos.filter(p=>p.status==='ENTREGUE').length,icon:CheckCircle2,color:'text-[#46a878]',bg:'bg-[#eaf7ee]'},
        {label:'Cancelados',value:pedidos.filter(p=>p.status==='CANCELADO').length,icon:XCircle,color:'text-[#dd7373]',bg:'bg-[#fff0f0]'},
      ].map(({label,value,icon:Icon,color,bg}) => <div key={label} className="surface-card p-4 sm:p-5 flex items-center gap-3.5"><div className={`h-10 w-10 rounded-[11px] grid place-items-center shrink-0 ${bg} ${color}`}><Icon size={19}/></div><div><p className="text-[11px] text-[#999fa1] font-semibold">{label}</p><p className="font-display font-extrabold text-[23px] mt-0.5 leading-tight">{value}</p></div></div>)}
    </section>
    <section className="surface-card overflow-hidden">
      <div className="p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1 flex-wrap bg-[#FFEDD5] p-1 rounded-xl">
          {[['todos','Todos'],['ativos','Em andamento'],['entregues','Entregues'],['cancelados','Cancelados']].map(([id,label])=><button key={id} className={`pill-tab ${filter===id?'active':''}`} onClick={()=>setFilter(id)}>{label}</button>)}
        </div>
        <SearchField value={search} onChange={setSearch} placeholder="Buscar pedido, cliente ou restaurante..."/>
      </div>
      {filtered.length ? <div className="overflow-x-auto scrollbar-thin"><table className="table-base"><thead><tr><th>Pedido</th><th>Cliente / Restaurante</th><th>Valor total</th><th>Status</th><th className="!text-right">Ações</th></tr></thead><tbody>
        {filtered.map(p => <tr key={p.id}>
          <td><button onClick={() => onViewPedido(p.id)} className="font-extrabold text-sm text-[#111827] hover:text-[#C2410C] hover:underline">#{String(p.id).padStart(4,'0')}</button><div className="text-[11px] text-[#abb0b2] mt-1">{dateTime(p.dataPedido)}</div></td>
          <td><p className="font-bold text-[#44494c]">{p.clienteNome}</p><p className="text-[11px] text-[#acb1b2] mt-1">{p.restauranteNome}</p></td>
          <td className="font-extrabold whitespace-nowrap">{currency(p.valorTotal)}</td>
          <td><StatusBadge status={p.status}/></td>
          <td><div className="flex items-center justify-end gap-2 min-w-[138px]">
            <button onClick={() => onViewPedido(p.id)} className="mini-icon" aria-label={`Ver detalhes do pedido ${p.id}`} title="Ver detalhes"><ArrowRight size={15}/></button>
            {NEXT_STATUS[p.status] && <button disabled={updatingId===p.id} onClick={()=>onAdvance(p)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#FFEDD5] text-[#C2410C] hover:bg-[#FED7AA] disabled:opacity-50 font-extrabold text-[11px] px-3 py-2 whitespace-nowrap">{updatingId===p.id ? 'Salvando...' : NEXT_STATUS[p.status]==='ENTREGUE' ? 'Entregar' : 'Avançar'}<ArrowRight size={13}/></button>}
            {canCancel(p) && <button title="Cancelar pedido" aria-label={`Cancelar pedido ${p.id}`} disabled={updatingId===p.id} onClick={()=>onCancel(p)} className="mini-icon hover:!text-red-600 hover:!bg-red-50"><XCircle size={15}/></button>}
            {!NEXT_STATUS[p.status] && !canCancel(p) && <span className="text-[11px] text-[#adb3b6]">Finalizado</span>}
          </div></td>
        </tr>)}
      </tbody></table></div> : <EmptyState title={search || filter !== 'todos' ? 'Nenhum pedido encontrado' : 'Nenhum pedido cadastrado'} description={search || filter !== 'todos' ? 'Altere os filtros para visualizar outros pedidos.' : 'Registre um pedido para começar a acompanhar as entregas.'} action={!search && filter==='todos' && <Button icon={Plus} onClick={onAdd}>Criar pedido</Button>}/>}
    </section>
    <div className="text-xs text-[#a5aaad] mt-4 leading-relaxed">O cancelamento está disponível somente para pedidos criados há até 10 minutos. O backend valida todas as mudanças de status.</div>
  </>;
}
