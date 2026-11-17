import { useState } from 'react';
import {
  BellRing, ChevronDown, ChefHat, CircleHelp, ClipboardList, LayoutDashboard,
  Menu, Plus, RefreshCcw, Settings2, Store, UsersRound, UtensilsCrossed, X
} from 'lucide-react';
import { Button } from './UI';

const NAV = [
  { id: 'dashboard', name: 'Visão geral', icon: LayoutDashboard },
  { id: 'pedidos', name: 'Pedidos', icon: ClipboardList },
  { id: 'clientes', name: 'Clientes', icon: UsersRound },
  { id: 'restaurantes', name: 'Restaurantes', icon: Store },
];

export function Shell({ current, onNavigate, onNewPedido, onRefresh, loading, apiError, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = (id) => { onNavigate(id); setMobileOpen(false); };

  const sidebar = <div className="flex flex-col h-full px-[17px] py-7">
    <button onClick={() => nav('dashboard')} className="flex items-center gap-3 px-3 mb-13 text-left" aria-label="Ir para visão geral">
      <span className="w-[43px] h-[43px] bg-[#F97316] rounded-[13px] grid place-items-center shadow-[0_10px_20px_#F973163A]"><UtensilsCrossed className="text-white" size={23}/></span>
      <span className="font-display text-white font-extrabold text-[22px] tracking-[-.08em]">EzFood<span className="text-[#F97316]">.</span></span>
    </button>

    <div className="px-4 text-[10px] text-[#69737d] uppercase tracking-[.16em] font-bold mb-4">Principal</div>
    <nav className="space-y-1.5" aria-label="Menu principal">
      {NAV.map(({ id, name, icon: Icon }) => <button key={id} className={`sidebar-link ${current === id ? 'active' : ''}`} onClick={() => nav(id)}>
        <Icon size={19} strokeWidth={2.1}/><span className="flex-1">{name}</span>
        {current === id && <span className="w-1.5 h-1.5 rounded-full bg-white/90" />}
      </button>)}
    </nav>

    <div className="mt-auto pt-12">
      <div className="mx-1 rounded-[17px] bg-[#1F2937] p-4 relative overflow-hidden">
        <div className="absolute w-22 h-22 rounded-full bg-[#F97316]/12 -right-9 -top-9" />
        <ChefHat size={21} className="text-[#FDBA74] mb-3" />
        <div className="text-white text-[13px] font-bold leading-5">Seu restaurante, organizado.</div>
        <p className="text-[11px] leading-[1.6] text-[#a0a9ad] mt-1 mb-4">Pedidos e clientes em um só lugar.</p>
        <button onClick={() => { onNewPedido(); setMobileOpen(false); }} className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-bold text-xs w-full py-2.5"><Plus size={15}/> Novo pedido</button>
      </div>
      <div className="flex items-center gap-2 px-4 mt-6 text-[11px] font-semibold text-[#9fa9ae]">
        <span className={`w-2 h-2 rounded-full ${apiError ? 'bg-[#EA580C]' : loading ? 'bg-[#f5bc61]' : 'bg-[#53be8a]'}`} />
        {apiError ? 'Problema com a API' : loading ? 'Sincronizando...' : 'API conectada'}
      </div>
      <div className="text-[10px] text-[#69737d] px-4 mt-1">EzFood · Painel administrativo</div>
    </div>
  </div>;

  return <div className="min-h-screen bg-[#FFF7ED]">
    <aside className="hidden lg:block fixed inset-y-0 left-0 w-[254px] bg-[#111827] text-white z-30">{sidebar}</aside>
    {mobileOpen && <div className="fixed inset-0 z-40 lg:hidden bg-[#12181a]/50" onMouseDown={() => setMobileOpen(false)}>
      <aside onMouseDown={(e) => e.stopPropagation()} className="w-[260px] h-full bg-[#111827] relative">
        <button aria-label="Fechar menu" onClick={() => setMobileOpen(false)} className="absolute right-3 top-5 text-white/60"><X size={22}/></button>{sidebar}
      </aside>
    </div>}
    <div className="lg:pl-[254px] min-h-screen">
      <header className="h-[78px] flex items-center px-5 sm:px-8 lg:px-10 border-b border-[#F0E3D6] bg-[#fff]/80 sticky top-0 z-20 backdrop-blur-lg">
        <button className="lg:hidden mr-4 text-[#1F2937]" onClick={() => setMobileOpen(true)} aria-label="Abrir menu"><Menu size={23}/></button>
        <div className="hidden sm:block">
          <div className="text-[10px] uppercase tracking-[.13em] text-[#b0b4b5] font-extrabold">Painel de controle</div>
          <div className="text-[13px] text-[#53595c] font-bold mt-0.5">Bem-vindo ao EzFood <span className="inline-block ml-0.5">👋</span></div>
        </div>
        <div className="sm:hidden font-display font-extrabold">EzFood<span className="text-[#F97316]">.</span></div>
        <div className="ml-auto flex items-center gap-3 sm:gap-5">
          <button title="Atualizar dados" aria-label="Atualizar dados" onClick={onRefresh} disabled={loading} className="w-9 h-9 rounded-lg bg-[#FFEDD5] hover:bg-[#eceeed] text-[#7e8487] grid place-items-center disabled:opacity-50"><RefreshCcw size={17} className={loading ? 'animate-spin' : ''}/></button>
          <span className="w-px h-7 bg-[#E6D9CD]"/>
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-[11px] bg-[#1F2937] grid place-items-center text-white text-xs font-bold">EF</span>
            <div className="hidden md:block leading-[1.3]"><p className="font-extrabold text-[12px]">Administrador</p><p className="text-[11px] text-[#a7acae]">Gerenciamento</p></div>
          </div>
        </div>
      </header>
      <main className="px-5 sm:px-8 lg:px-10 pt-8 pb-14 max-w-[1680px] mx-auto fade-in" key={current}>
        {children}
      </main>
    </div>
  </div>;
}
