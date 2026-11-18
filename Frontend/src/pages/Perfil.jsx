import { useEffect, useState } from 'react';
import { ArrowRight, Bike, Plus, Store } from 'lucide-react';
import { api } from '../lib/api';
import { Brand } from '../components/Shell';
import { Button, EmptyState, FormField, LoadingState } from '../components/UI';
import EntityModal from '../components/EntityModal';

export default function Perfil({ onSelect, notice }) {
  const [type, setType] = useState('restaurante');
  const [records, setRecords] = useState(null);
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setRecords(null);
    setError('');
    setSelected('');
    const load = type === 'restaurante' ? api.getRestaurantes : api.getMotoboys;
    load(controller.signal).then((data) => {
      if (!controller.signal.aborted) setRecords(data);
    }).catch((err) => {
      if (!controller.signal.aborted) setError(err.message);
    });
    return () => controller.abort();
  }, [type, reload]);

  async function create(kind, payload) {
    const record = await (kind === 'restaurante' ? api.createRestaurante(payload) : api.createMotoboy(payload));
    onSelect({ type: kind, id: record.id });
  }

  return <main className="profile-page">
    <div className="w-full max-w-[600px]">
      <div className="mb-10"><Brand /></div>
      <h1 className="font-display text-[30px] sm:text-[36px] font-extrabold tracking-tight leading-tight">Como você quer continuar?</h1>
      <p className="text-slate-600 mt-3 mb-8">Escolha um perfil para gerenciar suas entregas.</p>
      {notice && <div className="notice mb-5" role="status">{notice}</div>}
      <section className="surface-card p-5 sm:p-8">
        <div className="grid grid-cols-2 gap-3 mb-7" role="group" aria-label="Tipo de perfil">
          {[['restaurante', 'Restaurante', Store], ['motoboy', 'Motoboy', Bike]].map(([key, label, Icon]) =>
            <button key={key} className={`profile-choice ${type === key ? 'active' : ''}`} aria-pressed={type === key} onClick={() => setType(key)}><Icon size={29}/><span>Entrar como {label}</span></button>)}
        </div>
        {error ? <div className="notice notice-error mb-5" role="alert"><span>{error}</span><button onClick={() => setReload((v) => v + 1)} className="underline shrink-0">Tentar novamente</button></div>
          : records === null ? <LoadingState compact />
          : records.length ? <form onSubmit={(e) => { e.preventDefault(); if (selected) onSelect({ type, id: Number(selected) }); }}>
            <FormField label="Selecione seu cadastro"><select className="input-base" required value={selected} onChange={(e) => setSelected(e.target.value)}>
              <option value="">Selecione seu cadastro</option>
              {records.map((r) => <option key={r.id} value={r.id}>{r.nome} · {type === 'restaurante' ? r.cnpj : r.email}{!r.ativo ? ' · Inativo' : ''}</option>)}
            </select></FormField>
            <Button type="submit" icon={ArrowRight} disabled={!selected} className="w-full mt-5">Continuar</Button>
          </form> : <EmptyState title="Nenhum cadastro encontrado" description={`Crie seu cadastro de ${type} para começar.`}/>}
        <Button variant="ghost" icon={Plus} className="w-full mt-3" onClick={() => setCreating(true)}>Criar cadastro</Button>
      </section>
      <p className="text-sm text-slate-600 mt-6 leading-relaxed"><strong className="text-[#111827]">Modo de demonstração.</strong> A seleção de perfil não é um login seguro.</p>
    </div>
    {creating && <EntityModal type={type} onSave={create} onClose={() => setCreating(false)}/>}
  </main>;
}
