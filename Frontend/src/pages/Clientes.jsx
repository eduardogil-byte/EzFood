import { Plus, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Avatar, Button, EmptyState, FlagBadge, IconActions, PageTitle, SearchField } from '../components/UI';
import { dateOnly } from '../lib/format';

export default function Clientes({ clientes, pedidos, onAdd, onEdit, onDelete }) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => clientes.filter(c => `${c.nome} ${c.email}`.toLowerCase().includes(search.toLowerCase().trim())), [clientes, search]);

  return <>
    <PageTitle eyebrow="Pessoas" title="Clientes" subtitle="Gerencie os clientes cadastrados na plataforma." action={<Button icon={Plus} onClick={onAdd}>Novo cliente</Button>}/>
    <section className="grid sm:grid-cols-3 gap-4 mb-6">
      <div className="surface-card p-5"><p className="text-[12px] text-[#9da3a6] font-semibold">Clientes cadastrados</p><p className="font-display text-[28px] font-extrabold tracking-tight mt-2">{clientes.length}</p></div>
      <div className="surface-card p-5"><p className="text-[12px] text-[#9da3a6] font-semibold">Clientes ativos</p><p className="font-display text-[28px] font-extrabold tracking-tight mt-2">{clientes.filter(c=>c.ativo).length}</p></div>
      <div className="surface-card p-5"><p className="text-[12px] text-[#9da3a6] font-semibold">Clientes com pedidos</p><p className="font-display text-[28px] font-extrabold tracking-tight mt-2">{new Set(pedidos.map(p => p.clienteId)).size}</p></div>
    </section>
    <section className="surface-card overflow-hidden">
      <div className="flex flex-wrap justify-between gap-4 items-center p-5 sm:p-6"><div><h2 className="font-display text-[16px] font-extrabold">Lista de clientes</h2><p className="text-xs text-[#a4a9ad] mt-1">{filtered.length} registros encontrados</p></div><SearchField value={search} onChange={setSearch} placeholder="Buscar nome ou e-mail..."/></div>
      {filtered.length ? <div className="overflow-x-auto scrollbar-thin"><table className="table-base"><thead><tr><th>Cliente</th><th>Cadastro</th><th>Pedidos</th><th>Situação</th><th className="!text-right">Ações</th></tr></thead><tbody>
        {filtered.map((c, i) => <tr key={c.id}>
          <td><div className="flex items-center gap-3"><Avatar name={c.nome} size="sm" color={['peach','mint','violet','yellow'][i%4]}/><div><div className="font-bold text-sm text-[#111827]">{c.nome}</div><div className="text-[11px] text-[#a1a7aa] mt-0.5">{c.email}</div></div></div></td>
          <td className="text-[#767e82] whitespace-nowrap">{dateOnly(c.dataCadastro)}</td>
          <td className="font-extrabold text-[#5c6266]">{pedidos.filter(p=>p.clienteId===c.id).length}</td>
          <td><FlagBadge good={c.ativo} yes="Ativo" no="Inativo"/></td>
          <td><IconActions onEdit={()=>onEdit(c)} onDelete={()=>onDelete(c)}/></td>
        </tr>)}
      </tbody></table></div> : <EmptyState title={search ? 'Nenhum cliente encontrado' : 'Sua lista está vazia'} description={search ? 'Tente pesquisar por outro nome ou e-mail.' : 'Cadastre seu primeiro cliente para começar.'} action={!search && <Button icon={Plus} onClick={onAdd}>Cadastrar cliente</Button>}/>}
    </section>
    <p className="text-xs text-[#b1b6b8] mt-4">A situação ativo/inativo é definida pelo backend e não pode ser alterada pelo DTO atual.</p>
  </>;
}
