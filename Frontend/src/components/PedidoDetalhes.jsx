import { useEffect, useState } from 'react';
import { AlertCircle, CalendarClock, ReceiptText, Store, UserRound } from 'lucide-react';
import { api } from '../lib/api';
import { currency, dateTime } from '../lib/format';
import { Button, LoadingState, Modal, StatusBadge } from './UI';

export default function PedidoDetalhes({ pedidoId, onClose }) {
  const [pedido, setPedido] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api.getPedido(pedidoId)
      .then((result) => { if (!cancelled) setPedido(result); })
      .catch((err) => { if (!cancelled) setError(err.message || 'Não foi possível consultar o pedido.'); });
    return () => { cancelled = true; };
  }, [pedidoId]);

  const taxaEntrega = pedido ? Number(pedido.valorTotal) - Number(pedido.valorProdutos) : 0;

  return (
    <Modal title={`Detalhes do pedido #${pedidoId}`} subtitle="Informações atualizadas diretamente pela API" onClose={onClose}>
      {!pedido && !error && <LoadingState compact />}
      {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700 flex gap-3"><AlertCircle size={19} className="shrink-0" />{error}</div>}
      {pedido && <div className="space-y-5">
        <div className="rounded-2xl bg-[#FFF7ED] p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#FFEDD5] p-2.5 text-[#C2410C]"><ReceiptText size={21}/></div>
            <div><p className="text-xs text-slate-500">Identificador</p><p className="font-display text-xl font-extrabold text-[#111827]">#{String(pedido.id).padStart(4, '0')}</p></div>
          </div>
          <StatusBadge status={pedido.status} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-[#F0E3D6] p-4"><div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2"><UserRound size={15}/> Cliente</div><p className="font-bold text-sm break-words">{pedido.clienteNome}</p><p className="text-xs text-slate-500 mt-1">ID {pedido.clienteId}</p></div>
          <div className="rounded-xl border border-[#F0E3D6] p-4"><div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2"><Store size={15}/> Restaurante</div><p className="font-bold text-sm break-words">{pedido.restauranteNome}</p><p className="text-xs text-slate-500 mt-1">ID {pedido.restauranteId}</p></div>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600"><CalendarClock size={17} className="text-[#C2410C]"/> Criado em {dateTime(pedido.dataPedido)}</div>
        <div className="rounded-xl border border-[#F0E3D6] p-4 space-y-3">
          <div className="flex justify-between gap-3 text-sm text-slate-600"><span>Valor dos produtos</span><span>{currency(pedido.valorProdutos)}</span></div>
          <div className="flex justify-between gap-3 text-sm text-slate-600"><span>Taxa de entrega</span><span>{currency(taxaEntrega)}</span></div>
          <div className="border-t border-[#F0E3D6] pt-3 flex justify-between items-baseline gap-3"><strong className="text-sm">Total</strong><strong className="font-display text-2xl text-[#C2410C]">{currency(pedido.valorTotal)}</strong></div>
        </div>
        <div className="flex justify-end"><Button variant="ghost" onClick={onClose}>Fechar</Button></div>
      </div>}
    </Modal>
  );
}
