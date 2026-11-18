import { Bike, ClipboardList, History, Home, LogOut, Package, RefreshCcw, UserRound, UtensilsCrossed } from 'lucide-react';

export function Brand({ dark = false }) {
  return <div className="flex items-center gap-2.5">
    <UtensilsCrossed size={27} className="text-[#F97316]" strokeWidth={2} />
    <span className={`font-display text-[23px] font-extrabold tracking-tight ${dark ? 'text-white' : 'text-[#111827]'}`}>EzFood<span className="text-[#F97316]">.</span></span>
  </div>;
}

export function Shell({ type, profile, current, onNavigate, onRefresh, onSwitch, loading, apiError, children }) {
  const courier = type === 'motoboy';
  const nav = courier ? [
    { id: 'dashboard', name: 'Disponíveis', icon: Package },
    { id: 'ativa', name: 'Minha entrega', icon: Bike },
    { id: 'historico', name: 'Histórico', icon: History },
    { id: 'cadastro', name: 'Cadastro', icon: UserRound },
  ] : [
    { id: 'dashboard', name: 'Visão geral', icon: Home },
    { id: 'entregas', name: 'Minhas entregas', icon: ClipboardList },
    { id: 'cadastro', name: 'Meu cadastro', icon: UserRound },
  ];
  return <div className="min-h-screen bg-[#FFF7ED]">
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-[240px] bg-[#111827] z-30 flex-col p-5">
      <button onClick={() => onNavigate('dashboard')} aria-label="EzFood, início" className="text-left px-2 py-3 mb-9"><Brand dark /></button>
      <nav aria-label="Menu principal" className="space-y-2">
        {nav.map(({ id, name, icon: Icon }) => <button key={id} onClick={() => onNavigate(id)} aria-current={current === id ? 'page' : undefined} className={`sidebar-link ${current === id ? 'active' : ''}`}><Icon size={21}/>{name}</button>)}
      </nav>
      <div className="mt-auto border-t border-white/15 pt-5 space-y-4 text-sm">
        <p className="text-slate-300">Modo de demonstração</p>
        <p className="text-xs text-slate-400 leading-relaxed">A seleção de perfil não é um login seguro.</p>
        <button onClick={onSwitch} className="flex items-center gap-3 text-white min-h-11"><LogOut size={18}/>Trocar perfil</button>
      </div>
    </aside>
    <div className="lg:pl-[240px] min-h-screen">
      <header className="app-header">
        <div className="lg:hidden"><Brand /></div>
        <div className="hidden lg:block text-sm font-bold">Painel {courier ? 'do motoboy' : 'do restaurante'}</div>
        <div className="ml-auto flex items-center gap-2 sm:gap-4 min-w-0">
          <span className="hidden sm:block text-xs text-slate-600 max-w-52 truncate">{profile?.nome || 'Validando cadastro'}</span>
          <button onClick={onRefresh} aria-label="Atualizar dados" title="Atualizar dados" disabled={loading} className="mini-icon !w-11 !h-11"><RefreshCcw size={18} className={loading ? 'animate-spin' : ''}/></button>
          <div className="lg:hidden"><button onClick={onSwitch} className="mini-icon !w-11 !h-11" aria-label="Trocar perfil" title="Trocar perfil"><LogOut size={18}/></button></div>
        </div>
      </header>
      <main className="app-main">
        <p className="lg:hidden text-xs text-slate-600 mb-5">Modo de demonstração{profile && <> · <span className="font-semibold">{profile.nome}</span></>}</p>
        {apiError && <div className="notice notice-error mb-6" role="alert"><div><strong>Não foi possível atualizar os dados.</strong><p className="mt-1">{apiError}</p><p className="mt-1">Os dados exibidos podem estar desatualizados.</p></div><button className="underline font-bold shrink-0" onClick={onRefresh} disabled={loading}>Tentar novamente</button></div>}
        {children}
      </main>
      <nav className="mobile-nav lg:hidden" aria-label="Navegação móvel">
        {nav.map(({ id, name, icon: Icon }) => <button key={id} onClick={() => onNavigate(id)} aria-current={current === id ? 'page' : undefined} className={current === id ? 'active' : ''}><Icon size={22}/><span>{name}</span></button>)}
      </nav>
    </div>
  </div>;
}
