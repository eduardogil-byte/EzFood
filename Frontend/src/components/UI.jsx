import { useEffect } from 'react';
import {
  AlertTriangle, Check, CheckCircle2, ChevronRight, Inbox, Loader2,
  X, Plus, Search, Pencil, Trash2
} from 'lucide-react';
import { initials, STATUS } from '../lib/format';

export function Avatar({ name, size = 'md', color = 'peach' }) {
  const sizes = { sm: 'h-9 w-9 text-xs', md: 'h-11 w-11 text-sm', lg: 'h-13 w-13 text-base' };
  const colors = {
    peach: 'bg-[#FFEDD5] text-[#C2410C]', mint: 'bg-[#e9f6ef] text-[#32936a]',
    violet: 'bg-[#F5F3FF] text-[#8968cd]', yellow: 'bg-[#fff4da] text-[#c89735]',
  };
  return <div className={`shrink-0 rounded-[12px] grid place-items-center font-extrabold ${sizes[size]} ${colors[color]}`}>
    {initials(name)}
  </div>;
}

export function StatusBadge({ status }) {
  const item = STATUS[status] || { label: status || '—', tone: 'gray' };
  const styles = {
    blue: 'bg-[#edf3ff] text-[#5682cb]', amber: 'bg-[#fff3d9] text-[#b87b24]',
    purple: 'bg-[#f0eaff] text-[#886cc8]', green: 'bg-[#e8f7ed] text-[#32935f]',
    red: 'bg-[#ffeded] text-[#da6262]', gray: 'bg-gray-100 text-gray-500',
  };
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-[11px] font-extrabold whitespace-nowrap ${styles[item.tone]}`}>
    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />{item.label}
  </span>;
}

export function FlagBadge({ good, yes = 'Aberto', no = 'Fechado' }) {
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-[11px] font-bold ${good ? 'bg-[#e8f7ed] text-[#32935f]' : 'bg-[#F5EBE0] text-[#858b8c]'}`}>
    <span className="w-1.5 h-1.5 rounded-full bg-current" />{good ? yes : no}
  </span>;
}

export function PageTitle({ eyebrow, title, subtitle, action }) {
  return <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-7">
    <div>
      {eyebrow && <p className="text-xs font-extrabold uppercase tracking-[.14em] text-[#C2410C] mb-2">{eyebrow}</p>}
      <h1 className="font-display font-extrabold text-[26px] sm:text-[30px] tracking-[-.065em] text-[#111827] leading-tight">{title}</h1>
      {subtitle && <p className="text-sm text-[#989da1] mt-2">{subtitle}</p>}
    </div>
    {action}
  </div>;
}

export function Button({ children, variant = 'main', icon: Icon, busy, className = '', ...props }) {
  return <button className={`${variant === 'main' ? 'btn-main' : variant === 'danger' ? 'btn-main btn-danger' : 'btn-ghost'} ${className}`} {...props} disabled={Boolean(busy || props.disabled)}>
    {busy ? <Loader2 size={16} className="animate-spin" /> : Icon && <Icon size={16} strokeWidth={2.4} />}{children}
  </button>;
}

export function IconActions({ onEdit, onDelete, editTitle = 'Editar', deleteTitle = 'Excluir' }) {
  return <div className="flex gap-1.5 justify-end">
    {onEdit && <button onClick={onEdit} aria-label={editTitle} title={editTitle} className="mini-icon"><Pencil size={15}/></button>}
    {onDelete && <button onClick={onDelete} aria-label={deleteTitle} title={deleteTitle} className="mini-icon hover:!text-red-600 hover:!border-red-200 hover:!bg-red-50"><Trash2 size={15}/></button>}
  </div>;
}

export function SearchField({ value, onChange, placeholder = 'Pesquisar...' }) {
  return <div className="relative w-full sm:max-w-[320px]">
    <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a3a8aa]"/>
    <input className="input-base !pl-10" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder}/>
  </div>;
}

export function EmptyState({ title = 'Nenhum resultado', description, action }) {
  return <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="h-15 w-15 rounded-2xl bg-[#FFEDD5] text-[#C2410C] grid place-items-center mb-4"><Inbox size={26}/></div>
    <h3 className="font-display font-bold text-[16px]">{title}</h3>
    <p className="text-sm text-[#92999c] mt-1 max-w-xs">{description || 'Os registros aparecerão aqui quando estiverem disponíveis.'}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>;
}

export function LoadingState({ compact = false }) {
  return <div className={`flex flex-col items-center justify-center ${compact ? 'py-12' : 'py-28'} text-[#a0a5a8]`}>
    <Loader2 className="animate-spin text-[#F97316]" size={26}/><span className="text-sm mt-3 font-medium">Carregando dados...</span>
  </div>;
}

export function Modal({ title, subtitle, children, onClose, size = 'md' }) {
  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handleKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleKey); document.body.style.overflow = previous; };
  }, [onClose]);

  return <div role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} className="fixed inset-0 z-60 bg-[#151a20]/55 backdrop-blur-[3px] grid place-items-center p-4 fade-in">
    <section role="dialog" aria-modal="true" aria-label={title} className={`w-full ${size === 'lg' ? 'max-w-[640px]' : 'max-w-[500px]'} bg-white rounded-[22px] shadow-2xl max-h-[92vh] overflow-y-auto scrollbar-thin`}>
      <div className="p-6 sm:p-7 pb-4 flex items-start justify-between gap-5">
        <div><h2 className="font-display text-xl font-extrabold tracking-tight">{title}</h2>{subtitle && <p className="text-[#969da0] text-sm mt-1">{subtitle}</p>}</div>
        <button className="mini-icon shrink-0" aria-label="Fechar" onClick={onClose}><X size={18}/></button>
      </div>
      <div className="px-6 sm:px-7 pb-7">{children}</div>
    </section>
  </div>;
}

export function FormField({ label, hint, children }) {
  return <label className="block"><span className="field-label">{label}</span>{children}{hint && <span className="text-xs text-[#a3a7aa] mt-1.5 block">{hint}</span>}</label>;
}

export function ModalActions({ onCancel, saving, submitLabel }) {
  return <div className="flex justify-end gap-2.5 pt-5 mt-6 border-t border-[#F1E5D8]">
    <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
    <Button type="submit" busy={saving} icon={Check}>{submitLabel || 'Salvar alterações'}</Button>
  </div>;
}

export function ConfirmDialog({ title, description, onCancel, onConfirm, busy, destructive = false }) {
  return <Modal title={title} subtitle={description} onClose={onCancel}>
    <div className={`rounded-xl p-4 flex gap-3 text-sm ${destructive ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'}`}>
      <AlertTriangle size={18} className="shrink-0 mt-0.5" />
      <span>{destructive ? 'Essa operação não poderá ser desfeita. Registros associados podem impedir a exclusão.' : 'A API verificará se esta alteração é permitida pelas regras de negócio.'}</span>
    </div>
    <div className="flex justify-end gap-2.5 mt-6">
      <Button variant="ghost" onClick={onCancel}>Voltar</Button>
      <Button variant={destructive ? 'danger' : 'main'} busy={busy} onClick={onConfirm}>{destructive ? 'Sim, excluir' : 'Confirmar'}</Button>
    </div>
  </Modal>;
}

export function Toast({ toast, dismiss }) {
  if (!toast) return null;
  const ok = toast.type !== 'error';
  return <div role="status" className={`fixed bottom-5 right-5 z-70 max-w-[min(420px,calc(100vw-40px))] flex gap-3 items-start p-4 rounded-xl shadow-xl border fade-in ${ok ? 'bg-white border-[#dceee2]' : 'bg-white border-[#ffd9d9]'}`}>
    {ok ? <CheckCircle2 className="shrink-0 text-[#359b64]" size={20}/> : <AlertTriangle className="shrink-0 text-[#df6262]" size={20}/>}
    <div className="min-w-0"><strong className="block text-sm">{ok ? 'Tudo certo!' : 'Não foi possível concluir'}</strong><p className="text-xs text-[#7f8589] mt-1 leading-relaxed">{toast.message}</p></div>
    <button aria-label="Fechar aviso" onClick={dismiss} className="text-[#a8adb0] hover:text-[#444] ml-2"><X size={16}/></button>
  </div>;
}

export function SectionHeading({ title, subtitle, action }) {
  return <div className="flex items-center justify-between gap-4 mb-5">
    <div><h2 className="font-display text-[16px] font-extrabold tracking-[-.035em]">{title}</h2>{subtitle && <p className="text-xs text-[#a4a9ad] mt-1">{subtitle}</p>}</div>
    {action && <div className="shrink-0">{action}</div>}
  </div>;
}

export function InlineLink({ children, onClick }) {
  return <button onClick={onClick} className="inline-flex items-center gap-1 text-[#C2410C] hover:text-[#d65938] font-extrabold text-xs">{children}<ChevronRight size={15}/></button>;
}
