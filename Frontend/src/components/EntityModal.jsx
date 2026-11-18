import { useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { FormField, Modal, ModalActions } from './UI';

function initialValues(type, entity) {
  if (type === 'restaurante') return {
    nome: entity?.nome || '', cnpj: entity?.cnpj || '', categoria: entity?.categoria || '',
    enderecoRetirada: entity?.enderecoRetirada || '', ativo: entity?.ativo ?? true,
  };
  if (type === 'motoboy') return {
    nome: entity?.nome || '', telefone: entity?.telefone || '', email: entity?.email || '',
    ativo: entity?.ativo ?? true, disponivel: entity?.disponivel ?? true,
  };
  return { descricaoConteudo: '', nomeDestinatario: '', enderecoEntrega: '', referenciaEntrega: '', observacoes: '' };
}

export default function EntityModal({ type, entity, profile, onSave, onClose }) {
  const [form, setForm] = useState(() => initialValues(type, entity));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const savingRef = useRef(false);
  const edit = Boolean(entity);
  const delivery = type === 'entrega';
  const title = delivery ? 'Nova entrega' : `${edit ? 'Editar' : 'Cadastrar'} ${type}`;
  const set = (key, value) => setForm((old) => ({ ...old, [key]: value }));
  const close = () => { if (!savingRef.current) onClose(); };

  async function submit(event) {
    event.preventDefault();
    if (savingRef.current) return;
    setError('');
    const payload = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]));
    const optional = ['referenciaEntrega', 'observacoes'];
    if (Object.entries(payload).some(([key, value]) => typeof value === 'string' && !optional.includes(key) && !value)) {
      setError('Preencha os campos obrigatórios sem usar apenas espaços.');
      return;
    }
    if (delivery) {
      if (!profile?.ativo) { setError('Restaurante inativo. Ative seu cadastro para solicitar uma entrega.'); return; }
      payload.restauranteId = profile.id;
      optional.forEach((key) => { payload[key] = payload[key] || null; });
    }
    savingRef.current = true;
    setSaving(true);
    try { await onSave(type, payload, entity); }
    catch (err) { setError(err.message || 'Não foi possível salvar.'); }
    finally { savingRef.current = false; setSaving(false); }
  }

  const input = (key, label, maxLength, options = {}) => <FormField label={label}>
    <input className="input-base" name={key} value={form[key]} onChange={(e) => set(key, key === 'cnpj' ? e.target.value.replace(/\D/g, '') : e.target.value)} required maxLength={maxLength} {...options}/>
  </FormField>;
  const toggle = (key, label) => <label className="toggle-row">
    <span className="font-semibold text-sm">{label}</span>
    <input className="switch" type="checkbox" checked={form[key]} onChange={(e) => set(key, e.target.checked)}/>
  </label>;
  return <Modal title={title} subtitle={delivery ? 'Preencha os dados para solicitar a retirada.' : 'Mantenha seus dados atualizados.'} onClose={close}>
    <form className="space-y-4" onSubmit={submit} aria-busy={saving}>
      <fieldset disabled={saving} className="space-y-4">
        {type === 'restaurante' && <>
          {input('nome', 'Nome do restaurante', 255, { autoComplete: 'organization', autoFocus: true })}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {input('cnpj', 'CNPJ', 14, { inputMode: 'numeric', pattern: '[0-9]{14}', title: 'Informe os 14 dígitos do CNPJ.' })}
            {input('categoria', 'Categoria', 255)}
          </div>
          <FormField label="Endereço de retirada"><textarea className="input-base" name="enderecoRetirada" value={form.enderecoRetirada} onChange={(e) => set('enderecoRetirada', e.target.value)} required maxLength={500} rows={3} autoComplete="street-address"/></FormField>
          {toggle('ativo', 'Restaurante ativo')}
        </>}
        {type === 'motoboy' && <>
          {input('nome', 'Nome completo', 255, { autoComplete: 'name', autoFocus: true })}
          {input('telefone', 'Telefone', 30, { type: 'tel', autoComplete: 'tel' })}
          {input('email', 'E-mail', 255, { type: 'email', autoComplete: 'email' })}
          {toggle('ativo', 'Cadastro ativo')}
          {toggle('disponivel', 'Disponível para entregas')}
        </>}
        {delivery && <>
          {input('descricaoConteudo', 'Descrição do conteúdo', 500, { autoFocus: true })}
          {input('nomeDestinatario', 'Nome do destinatário', 255)}
          <FormField label="Endereço de entrega"><textarea className="input-base" name="enderecoEntrega" value={form.enderecoEntrega} onChange={(e) => set('enderecoEntrega', e.target.value)} required maxLength={500} rows={3}/></FormField>
          <FormField label="Referência (opcional)"><input className="input-base" name="referenciaEntrega" value={form.referenciaEntrega} onChange={(e) => set('referenciaEntrega', e.target.value)} maxLength={500}/></FormField>
          <FormField label="Observações (opcional)"><textarea className="input-base" name="observacoes" value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} maxLength={1000} rows={3}/></FormField>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FFF7ED] text-sm"><MapPin size={18} className="shrink-0 text-[#C2410C] mt-0.5"/><div><strong>Retirada no restaurante</strong><p className="text-slate-600 break-words mt-1">{profile?.enderecoRetirada}</p></div></div>
        </>}
      </fieldset>
      {error && <div className="notice notice-error" role="alert">{error}</div>}
      <ModalActions onCancel={close} saving={saving} submitLabel={delivery ? 'Solicitar entrega' : edit ? 'Salvar alterações' : 'Criar cadastro'}/>
    </form>
  </Modal>;
}
