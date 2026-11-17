import { useMemo, useState } from 'react';
import { MapPin, Plus, Store, Truck, UtensilsCrossed } from 'lucide-react';
import { Avatar, Button, EmptyState, FlagBadge, IconActions, PageTitle, SearchField } from '../components/UI';
import { currency } from '../lib/format';

export default function Restaurantes({ restaurantes, pedidos, onAdd, onEdit, onDelete, onToggle, togglingId }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');
  const filtered = useMemo(() => restaurantes.filter(r => {
    const matchesSearch = `${r.nome} ${r.categoria} ${r.cnpj}`.toLowerCase().includes(search.trim().toLowerCase());
    return matchesSearch && (filter === 'todos' || (filter === 'abertos' ? r.aberto : !r.aberto));
  }), [restaurantes, search, filter]);

  return <>
    <PageTitle eyebrow="Parceiros" title="Restaurantes" subtitle="Gerencie estabelecimentos, disponibilidade e taxas de entrega." action={<Button icon={Plus} onClick={onAdd}>Novo restaurante</Button>}/>
    <section className="surface-card mb-6 flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
      <div className="flex gap-1 bg-[#FFEDD5] p-1 rounded-xl">
        {[['todos','Todos'],['abertos','Abertos'],['fechados','Fechados']].map(([id,label]) => <button key={id} className={`pill-tab ${filter===id ? 'active' : ''}`} onClick={() => setFilter(id)}>{label}</button>)}
      </div>
      <SearchField value={search} onChange={setSearch} placeholder="Buscar restaurantes..."/>
    </section>
    {filtered.length ? <section className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
      {filtered.map((r,i) => <article key={r.id} className="surface-card p-5 sm:p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="h-14 w-14 rounded-[15px] bg-[#FFEDD5] text-[#C2410C] grid place-items-center"><UtensilsCrossed size={25}/></div>
          <FlagBadge good={r.aberto}/>
        </div>
        <h3 className="font-display font-extrabold text-[18px] tracking-[-.035em] leading-tight truncate">{r.nome}</h3>
        <p className="text-xs text-[#9ca3a6] mt-1">{r.categoria}</p>
        <div className="border-t border-[#F1E5D8] my-5"/>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div><span className="text-[11px] text-[#a1a7aa] flex items-center gap-1.5"><Truck size={13}/> Taxa de entrega</span><p className="font-extrabold mt-1.5 text-sm">{currency(r.taxaEntrega)}</p></div>
          <div><span className="text-[11px] text-[#a1a7aa] flex items-center gap-1.5"><Store size={13}/> Pedidos</span><p className="font-extrabold mt-1.5 text-sm">{pedidos.filter(p=>p.restauranteId===r.id).length}</p></div>
        </div>
        <p className="text-[11px] text-[#aab0b1] mb-5">CNPJ: {r.cnpj}</p>
        <div className="flex gap-2 items-center justify-between">
          <button onClick={() => onToggle(r)} disabled={togglingId===r.id} className={`rounded-[9px] px-3.5 py-2 text-xs font-extrabold transition-colors disabled:opacity-50 ${r.aberto ? 'bg-[#FFEDD5] text-[#C2410C] hover:bg-[#FED7AA]' : 'bg-[#e9f7ef] text-[#359861] hover:bg-[#d7f0e2]'}`}>
            {togglingId===r.id ? 'Atualizando...' : r.aberto ? 'Fechar restaurante' : 'Abrir restaurante'}
          </button>
          <IconActions onEdit={() => onEdit(r)} onDelete={() => onDelete(r)}/>
        </div>
      </article>)}
    </section> : <section className="surface-card"><EmptyState title="Nenhum restaurante encontrado" description={search || filter !== 'todos' ? 'Ajuste sua pesquisa ou filtro.' : 'Adicione seu primeiro estabelecimento.'} action={!search && filter==='todos' && <Button icon={Plus} onClick={onAdd}>Cadastrar restaurante</Button>}/></section>}
  </>;
}
