import { Clock3, Package, UserRound } from 'lucide-react';
import { dateTime } from '../lib/format';
import { Button, LoadingState, Modal, StatusBadge } from './UI';
import { DeliveryRoute } from './EntregaCard';

const STEPS = ['DISPONIVEL', 'ACEITA', 'RETIRADA', 'EM_ROTA', 'ENTREGUE'];

export default function EntregaDetalhes({ id, entrega, error, onClose }) {
  return <Modal title={`Detalhes da entrega #${id}`} onClose={onClose} size="lg">
    {error && <div role="alert" className="notice notice-error mb-4">{error}</div>}
    {!entrega && !error && <LoadingState compact/>}
    {entrega && <div className="space-y-6">
      <div className="flex justify-between gap-3 items-center"><strong>Entrega #{entrega.id}</strong><StatusBadge status={entrega.status}/></div>
      <DeliveryRoute entrega={entrega}/>
      <div className="detail-grid">
        <div><p><Package size={16}/>Conteúdo</p><strong>{entrega.descricaoConteudo}</strong></div>
        <div><p><UserRound size={16}/>Destinatário</p><strong>{entrega.nomeDestinatario}</strong></div>
        <div><p>Restaurante</p><strong>{entrega.restauranteNome}</strong></div>
        <div><p>Motoboy responsável</p><strong>{entrega.motoboyNome || 'Aguardando aceitação'}</strong></div>
      </div>
      {entrega.referenciaEntrega && <div className="text-sm break-words"><strong>Referência</strong><p className="mt-1 text-slate-600">{entrega.referenciaEntrega}</p></div>}
      {entrega.observacoes && <div className="text-sm break-words"><strong>Observações</strong><p className="mt-1 text-slate-600 whitespace-pre-wrap">{entrega.observacoes}</p></div>}
      <section aria-label="Andamento da entrega">
        <h3 className="text-sm font-bold mb-3">Andamento</h3>
        {entrega.status === 'CANCELADA' ? <p className="text-sm text-slate-600">Solicitação cancelada antes da aceitação.</p>
          : <ol className="delivery-steps">{STEPS.map((status, index) => <li key={status} aria-current={entrega.status === status ? 'step' : undefined} className={index <= STEPS.indexOf(entrega.status) ? 'done' : ''}><span>{index + 1}</span>{({ DISPONIVEL: 'Disponível', ACEITA: 'Aceita', RETIRADA: 'Retirada', EM_ROTA: 'Em rota', ENTREGUE: 'Entregue' })[status]}</li>)}</ol>}
      </section>
      <div className="text-xs text-slate-600 space-y-2 border-t border-[#F0E3D6] pt-4">
        <p className="flex items-center gap-2"><Clock3 size={15}/>Criação: {dateTime(entrega.dataCriacao)}</p>
        <p>Aceitação: {dateTime(entrega.dataAceitacao)}</p>
        <p>Conclusão: {dateTime(entrega.dataConclusao)}</p>
      </div>
    </div>}
    <div className="flex justify-end mt-6"><Button variant="ghost" onClick={onClose}>Fechar</Button></div>
  </Modal>;
}
