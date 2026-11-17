import { ArrowDownRight, ArrowRight, ArrowUpRight, ChevronRight, ClipboardList, Plus, ShoppingBag, Store, TrendingUp, UsersRound, Utensils, Wallet } from 'lucide-react';
import { Button, EmptyState, FlagBadge, InlineLink, PageTitle, SectionHeading, StatusBadge, Avatar } from '../components/UI';
import { ACTIVE_STATUSES, currency, dateTime, number, STATUS } from '../lib/format';

function Metric({ label, value, icon: Icon, note, dark, tint }) {
  return <div className={`surface-card p-5 sm:p-[22px] flex flex-col gap-4 ${dark ? '!bg-[#111827] !border-[#111827] text-white' : ''}`}>
    <div className="flex items-start justify-between gap-3">
      <span className={`text-[12px] font-bold ${dark ? 'text-[#abb7b9]' : 'text-[#939a9d]'}`}>{label}</span>
      <div className={`w-10 h-10 rounded-[11px] grid place-items-center ${dark ? 'bg-[#3e484a] text-[#FDBA74]' : tint}`}><Icon size={19}/></div>
    </div>
    <div>
      <div className="font-display text-[28px] sm:text-[31px] font-extrabold tracking-[-.07em] leading-none">{value}</div>
      <p className={`text-[11px] mt-2.5 ${dark ? 'text-[#a4b0b2]' : 'text-[#afb3b5]'}`}>{note}</p>
    </div>
  </div>;
}

export default function Dashboard({ clientes, restaurantes, pedidos, navigate, onNewPedido, onViewPedido }) {
  const pedidosAtivos = pedidos.filter((p) => ACTIVE_STATUSES.includes(p.status));
  const totalEntregue = pedidos.filter((p) => p.status === 'ENTREGUE').reduce((sum, p) => sum + Number(p.valorTotal), 0);
  const recent = [...pedidos].sort((a, b) => new Date(b.dataPedido) - new Date(a.dataPedido)).slice(0, 5);
  const openRestaurants = restaurantes.filter((r) => r.aberto);
  const statusData = Object.entries(STATUS).map(([status, info]) => ({ status, ...info, count: pedidos.filter((p) => p.status === status).length }));
  const maxCount = Math.max(1, ...statusData.map((item) => item.count));

  return <>
    <PageTitle eyebrow="Visão geral" title="Seu negócio, em movimento." subtitle="Acompanhe os números e gerencie seu fluxo de pedidos." action={<Button icon={Plus} onClick={onNewPedido}>Novo pedido</Button>}/>
    <section className="relative rounded-[22px] overflow-hidden bg-[#C2410C] mb-6 flex min-h-[175px] items-center">
      <div className="absolute right-[5%] top-[-100px] w-66 h-66 rounded-full border-[35px] border-white/10 pointer-events-none"/>
      <div className="absolute right-[18%] bottom-[-185px] w-76 h-76 rounded-full border-[40px] border-white/10 pointer-events-none"/>
      <div className="absolute right-[-15px] bottom-[-25px] rotate-[-16deg] opacity-20 pointer-events-none"><Utensils size={175} strokeWidth={1.1}/></div>
      <div className="relative px-6 sm:px-9 py-8 text-white max-w-[620px]">
        <div className="text-[10px] uppercase tracking-[.17em] text-white/75 font-extrabold mb-3">Resumo da operação</div>
        <h2 className="font-display font-extrabold text-2xl sm:text-[30px] tracking-[-.05em] leading-[1.2]">Tudo pronto para novos pedidos?</h2>
        <p className="text-white/85 mt-2 text-sm">Organize clientes, restaurantes e acompanhe cada entrega.</p>
        <button onClick={() => navigate('pedidos')} className="mt-5 inline-flex items-center gap-2 bg-white text-[#C2410C] rounded-[9px] text-xs font-extrabold px-4 py-2.5 hover:bg-[#FFF7ED]">Ver pedidos <ArrowRight size={15}/></button>
      </div>
    </section>
    <section className="grid grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-5 mb-7">
      <Metric label="Pedidos ativos" value={number(pedidosAtivos.length)} icon={ShoppingBag} note="Aguardando ou em andamento" tint="bg-[#FFF7ED] text-[#EA580C]"/>
      <Metric label="Clientes cadastrados" value={number(clientes.length)} icon={UsersRound} note="Base de clientes" tint="bg-[#f0ecff] text-[#9b83d0]"/>
      <Metric label="Restaurantes abertos" value={`${openRestaurants.length}/${restaurantes.length}`} icon={Store} note="Disponíveis para pedidos" tint="bg-[#eaf6ed] text-[#4fa978]"/>
      <Metric label="Total entregue" value={currency(totalEntregue)} icon={Wallet} note="Soma de pedidos entregues" dark/>
    </section>

    <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1.75fr)_minmax(300px,1fr)] gap-6 mb-6">
      <section className="surface-card overflow-hidden">
        <div className="px-6 pt-6 flex items-start justify-between gap-3 mb-5">
          <SectionHeading title="Pedidos recentes" subtitle="Últimas movimentações da operação"/>
          <InlineLink onClick={() => navigate('pedidos')}>Ver todos</InlineLink>
        </div>
        {recent.length ? <div className="overflow-x-auto scrollbar-thin"><table className="table-base"><thead><tr><th>Pedido</th><th>Cliente</th><th>Valor</th><th>Status</th></tr></thead><tbody>
          {recent.map((p) => <tr key={p.id}><td><button onClick={() => onViewPedido(p.id)} className="font-extrabold text-[#111827] hover:text-[#C2410C] hover:underline">#{String(p.id).padStart(4, '0')}</button><div className="text-[11px] text-[#b1b6b8] mt-1">{dateTime(p.dataPedido)}</div></td>
            <td><div className="text-[13px] font-bold">{p.clienteNome}</div><div className="text-[11px] text-[#a4a9ac] mt-1">{p.restauranteNome}</div></td>
            <td className="font-extrabold text-[#363b3d]">{currency(p.valorTotal)}</td><td><StatusBadge status={p.status}/></td>
          </tr>)}
        </tbody></table></div> : <EmptyState title="Nenhum pedido ainda" description="Assim que você registrar pedidos, eles aparecerão aqui." action={<Button icon={Plus} onClick={onNewPedido}>Criar primeiro pedido</Button>}/>}
      </section>
      <section className="surface-card px-6 pt-6 pb-5">
        <SectionHeading title="Distribuição dos pedidos" subtitle="Pedidos por situação"/>
        <div className="flex flex-col gap-[22px] mt-7">
          {statusData.map(({ status, label, count }, i) => <div key={status}>
            <div className="flex items-center justify-between mb-2.5 text-[12px]"><span className="text-[#656d71] font-semibold">{label}</span><span className="font-extrabold">{count}</span></div>
            <div className="h-2.5 rounded-full bg-[#F5EDE4] overflow-hidden"><div className={`h-full rounded-full ${['bg-[#789bdf]','bg-[#eeb961]','bg-[#a38bdb]','bg-[#6fba8d]','bg-[#e99090]'][i]}`} style={{width:`${count/maxCount*100}%`}}/></div>
          </div>)}
        </div>
        <div className="rounded-xl bg-[#FFF7ED] mt-8 px-4 py-3 flex justify-between items-center"><div><div className="font-extrabold text-lg">{pedidos.length}</div><p className="text-[11px] text-[#92989a]">Pedidos no total</p></div><div className="w-9 h-9 rounded-xl bg-white grid place-items-center text-[#C2410C]"><ClipboardList size={19}/></div></div>
      </section>
    </div>
    <section className="surface-card p-6">
      <div className="flex items-start justify-between gap-3"><SectionHeading title="Restaurantes parceiros" subtitle="Estabelecimentos cadastrados na plataforma"/><InlineLink onClick={() => navigate('restaurantes')}>Ver todos</InlineLink></div>
      {restaurantes.length ? <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {restaurantes.slice(0, 3).map((r, i) => <div key={r.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-[#eef0ed]"><Avatar name={r.nome} color={['peach','mint','violet'][i%3]}/><div className="min-w-0 flex-1"><p className="font-extrabold text-sm truncate">{r.nome}</p><p className="text-xs text-[#a6aaae] mt-0.5 truncate">{r.categoria}</p></div><FlagBadge good={r.aberto}/></div>)}
      </div> : <EmptyState title="Nenhum restaurante cadastrado" description="Cadastre um restaurante para começar a receber pedidos." action={<Button variant="ghost" onClick={() => navigate('restaurantes')}>Ir para restaurantes</Button>}/>}
    </section>
  </>;
}
