import { ArrowRight, MapPin, Package, UserRound } from 'lucide-react';
import { Button, StatusBadge } from './UI';
import { NEXT_LABEL, NEXT_STATUS, dateTime } from '../lib/format';

export function DeliveryRoute({ entrega }) {
  return <div className="delivery-route">
    <div><span className="route-marker"/><div><p className="route-label">Retirada · {entrega.restauranteNome}</p><p className="break-words">{entrega.enderecoRetirada}</p></div></div>
    <div><MapPin size={17} className="text-[#C2410C] shrink-0 mt-1"/><div><p className="route-label">Destino</p><p className="break-words">{entrega.enderecoEntrega}</p></div></div>
  </div>;
}

export default function EntregaCard({ entrega, onDetails, onAccept, onAdvance, acceptDisabled, actionDisabled, busy }) {
  return <article className="surface-card p-5 sm:p-6">
    <div className="flex items-center justify-between gap-3 mb-4">
      <span className="text-sm font-bold">Entrega #{entrega.id}</span><StatusBadge status={entrega.status}/>
    </div>
    <DeliveryRoute entrega={entrega}/>
    <div className="mt-4 space-y-2 text-sm text-slate-600">
      <p className="flex items-start gap-2"><Package size={17} className="shrink-0 mt-0.5"/><span className="break-words">{entrega.descricaoConteudo}</span></p>
      <p className="flex items-start gap-2"><UserRound size={17} className="shrink-0 mt-0.5"/><span className="break-words">{entrega.nomeDestinatario}</span></p>
      {entrega.referenciaEntrega && <p className="break-words"><strong>Referência:</strong> {entrega.referenciaEntrega}</p>}
      {entrega.observacoes && <p className="break-words"><strong>Observações:</strong> {entrega.observacoes}</p>}
    </div>
    <p className="text-xs text-slate-500 mt-4">{dateTime(entrega.dataCriacao)}</p>
    <div className="flex flex-wrap gap-2 mt-5">
      <Button variant="ghost" className="flex-1" onClick={() => onDetails(entrega.id)}>Ver detalhes</Button>
      {onAccept && entrega.status === 'DISPONIVEL' && <Button className="flex-1" disabled={acceptDisabled} busy={busy} onClick={() => onAccept(entrega)}>Aceitar entrega</Button>}
      {onAdvance && NEXT_STATUS[entrega.status] && <Button icon={ArrowRight} className="grow" busy={busy} disabled={actionDisabled} onClick={() => onAdvance(entrega)}>{NEXT_LABEL[entrega.status]}</Button>}
    </div>
  </article>;
}
