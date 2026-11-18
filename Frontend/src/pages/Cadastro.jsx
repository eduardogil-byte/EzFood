import { Pencil, Trash2 } from 'lucide-react';
import { dateTime } from '../lib/format';
import { Avatar, Button, FlagBadge, PageTitle } from '../components/UI';

export default function Cadastro({ type, profile, onEdit, onDelete, disabled }) {
  const restaurant = type === 'restaurante';
  const fields = restaurant ? [
    ['CNPJ', profile.cnpj], ['Categoria', profile.categoria], ['Endereço de retirada', profile.enderecoRetirada],
  ] : [['Telefone', profile.telefone], ['E-mail', profile.email], ['Disponibilidade', profile.disponivel ? 'Disponível' : 'Indisponível'], ['Data de cadastro', dateTime(profile.dataCadastro)]];
  return <>
    <PageTitle title="Meu cadastro" subtitle="Mantenha seus dados atualizados." action={<Button icon={Pencil} onClick={onEdit} disabled={disabled}>Editar cadastro</Button>}/>
    <section className="surface-card p-5 sm:p-8 max-w-3xl">
      <div className="flex flex-wrap items-center gap-4 mb-7"><Avatar name={profile.nome} size="lg"/><div className="min-w-0 flex-1"><h2 className="font-display font-bold text-xl break-words">{profile.nome}</h2><p className="text-sm text-slate-600 mt-1">{restaurant ? 'Restaurante' : 'Motoboy'} · ID {profile.id}</p></div><FlagBadge good={profile.ativo} yes="Ativo" no="Inativo"/></div>
      <dl className="space-y-5">{fields.map(([label, value]) => <div key={label}><dt className="text-xs font-semibold text-slate-500 mb-1">{label}</dt><dd className="text-sm font-semibold break-words">{value}</dd></div>)}</dl>
      {restaurant && <div className="border-t border-[#F0E3D6] mt-7 pt-5"><p className="text-sm text-slate-600 mb-3">Restaurantes com entregas vinculadas podem ser desativados, mas não excluídos.</p><Button icon={Trash2} variant="ghost" disabled={disabled} onClick={onDelete}>Excluir cadastro</Button></div>}
    </section>
  </>;
}
