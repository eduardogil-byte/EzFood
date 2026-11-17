import { useMemo, useState } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { Button, FormField, Modal, ModalActions } from './UI';
import { currency } from '../lib/format';

function initialValues(type, entity) {
  if (type === 'cliente') return { nome: entity?.nome || '', email: entity?.email || '' };
  if (type === 'restaurante') return {
    nome: entity?.nome || '', cnpj: entity?.cnpj || '', categoria: entity?.categoria || '',
    taxaEntrega: entity?.taxaEntrega?.toString() || '0', aberto: entity?.aberto ?? true,
  };
  return { clienteId: '', restauranteId: '', valorProdutos: '' };
}

export default function EntityModal({ type, mode, entity, clientes, restaurantes, onSave, onClose }) {
  const [form, setForm] = useState(() => initialValues(type, entity));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isEdit = mode === 'edit';
  const names = { cliente: 'cliente', restaurante: 'restaurante', pedido: 'pedido' };
  const restaurant = restaurantes.find((r) => String(r.id) === form.restauranteId);
  const total = Number(form.valorProdutos || 0) + Number(restaurant?.taxaEntrega || 0);
  const openRestaurants = restaurantes.filter((r) => r.aberto);
  const activeClients = clientes.filter((c) => c.ativo);
  const canCreatePedido = openRestaurants.length > 0 && activeClients.length > 0;
  const set = (key, value) => setForm((old) => ({ ...old, [key]: value }));

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    let payload;
    try {
      if (type === 'cliente') payload = { nome: form.nome.trim(), email: form.email.trim() };
      if (type === 'restaurante') payload = {
        nome: form.nome.trim(), cnpj: form.cnpj.trim(), categoria: form.categoria.trim(),
        aberto: form.aberto, taxaEntrega: Number(form.taxaEntrega),
      };
      if (type === 'pedido') payload = {
        clienteId: Number(form.clienteId), restauranteId: Number(form.restauranteId),
        valorProdutos: Number(form.valorProdutos),
      };
      await onSave(type, mode, payload, entity);
    } catch (err) {
      setError(err.message || 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  }

  return <Modal title={`${isEdit ? 'Editar' : 'Novo'} ${names[type]}`} subtitle={isEdit ? 'Atualize os dados abaixo.' : `Preencha as informações para cadastrar ${type === 'cliente' ? 'um cliente' : type === 'restaurante' ? 'um restaurante' : 'um pedido'}.`} onClose={onClose}>
    <form className="space-y-4" onSubmit={submit}>
      {type === 'cliente' && <>
        <FormField label="Nome completo"><input className="input-base" value={form.nome} onChange={(e)=>set('nome',e.target.value)} placeholder="Ex.: Maria Santos" required minLength={2} maxLength={150} autoFocus/></FormField>
        <FormField label="E-mail"><input className="input-base" type="email" value={form.email} onChange={(e)=>set('email',e.target.value)} placeholder="Ex.: maria@email.com" required maxLength={255}/></FormField>
        {isEdit && <div className="rounded-lg bg-[#FFF7ED] p-3 text-xs text-[#93999d]">A situação do cliente e sua data de cadastro são administradas pelo backend.</div>}
      </>}
      {type === 'restaurante' && <>
        <FormField label="Nome do restaurante"><input className="input-base" value={form.nome} onChange={(e)=>set('nome',e.target.value)} placeholder="Ex.: Sabor da Casa" required minLength={2} maxLength={150} autoFocus/></FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="CNPJ"><input className="input-base" value={form.cnpj} onChange={(e)=>set('cnpj',e.target.value)} placeholder="Somente números" required maxLength={30}/></FormField>
          <FormField label="Categoria"><input className="input-base" value={form.categoria} onChange={(e)=>set('categoria',e.target.value)} placeholder="Ex.: Hamburgueria" required maxLength={100}/></FormField>
        </div>
        <FormField label="Taxa de entrega (R$)"><input className="input-base" type="number" min="0" step="0.01" value={form.taxaEntrega} onChange={(e)=>set('taxaEntrega',e.target.value)} required /></FormField>
        <label className="flex items-center justify-between rounded-xl border border-[#E6D9CD] p-4 cursor-pointer">
          <div><span className="text-sm font-bold">Restaurante aberto</span><p className="text-xs text-[#a0a5a8] mt-1">Permitir novos pedidos para este restaurante</p></div>
          <input type="checkbox" checked={form.aberto} onChange={(e)=>set('aberto',e.target.checked)} className="h-4.5 w-4.5 accent-[#F97316]"/>
        </label>
      </>}
      {type === 'pedido' && <>
        {!canCreatePedido && <div className="p-3 bg-[#fff7e8] text-[#b28236] text-xs rounded-xl flex items-start gap-2"><AlertTriangle size={17} className="shrink-0"/><span>Para criar pedidos, cadastre pelo menos um cliente ativo e um restaurante aberto.</span></div>}
        <FormField label="Cliente"><select className="input-base" required value={form.clienteId} onChange={(e)=>set('clienteId',e.target.value)}>
          <option value="">Selecione um cliente</option>
          {activeClients.map(c=><option value={c.id} key={c.id}>{c.nome} · #{c.id}</option>)}
        </select></FormField>
        <FormField label="Restaurante"><select className="input-base" required value={form.restauranteId} onChange={(e)=>set('restauranteId',e.target.value)}>
          <option value="">Selecione um restaurante aberto</option>
          {openRestaurants.map(r=><option value={r.id} key={r.id}>{r.nome}</option>)}
        </select></FormField>
        <FormField label="Valor dos produtos (R$)"><input className="input-base" type="number" min="0.01" step="0.01" required value={form.valorProdutos} onChange={(e)=>set('valorProdutos',e.target.value)} placeholder="Ex.: 39.90"/></FormField>
        <div className="bg-[#FFF7ED] rounded-xl p-4 space-y-2.5">
          <div className="flex justify-between text-[12px] text-[#848b8f]"><span>Valor dos produtos</span><span>{currency(form.valorProdutos)}</span></div>
          <div className="flex justify-between text-[12px] text-[#848b8f]"><span>Taxa de entrega</span><span>{currency(restaurant?.taxaEntrega)}</span></div>
          <div className="h-px bg-[#E6D9CD]"/>
          <div className="flex items-center justify-between"><span className="font-extrabold text-sm">Total estimado</span><span className="font-display font-extrabold text-xl text-[#C2410C]">{currency(total)}</span></div>
          <div className="flex gap-1.5 items-start text-[11px] text-[#a4aaac]"><Info size={13} className="shrink-0 mt-[1px]"/>O valor final é recalculado no servidor.</div>
        </div>
      </>}
      {error && <div role="alert" className="rounded-lg border border-red-100 bg-red-50 text-red-700 text-xs p-3 flex gap-2"><AlertTriangle size={16} className="shrink-0"/>{error}</div>}
      <div className="flex justify-end gap-2.5 pt-5 mt-6 border-t border-[#F1E5D8]">
        <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
        <Button busy={saving} disabled={type==='pedido' && !canCreatePedido} type="submit">{isEdit ? 'Salvar alterações' : `Cadastrar ${names[type]}`}</Button>
      </div>
    </form>
  </Modal>;
}
