package com.example.ezfood.service;

import com.example.ezfood.dto.*;
import com.example.ezfood.entity.*;
import com.example.ezfood.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class PedidoService {
    private static final List<StatusEntrega> STATUS_ATIVOS =
            List.of(StatusEntrega.ACEITA, StatusEntrega.RETIRADA, StatusEntrega.EM_ROTA);

    private final PedidoRepository pedidos;
    private final MotoboyRepository motoboys;
    private final RestauranteRepository restaurantes;
    private final Clock clock;

    public PedidoService(PedidoRepository pedidos, MotoboyRepository motoboys,
                         RestauranteRepository restaurantes, Clock clock) {
        this.pedidos = pedidos;
        this.motoboys = motoboys;
        this.restaurantes = restaurantes;
        this.clock = clock;
    }

    @Transactional
    public EntregaResponseDTO cadastrar(EntregaRequestDTO dados) {
        Restaurante restaurante = restaurantes.findByIdForUpdate(dados.restauranteId())
                .orElseThrow(() -> new NoSuchElementException("Restaurante não encontrado."));
        if (!restaurante.isAtivo()) throw new IllegalStateException("Restaurante inativo.");
        Pedido pedido = new Pedido();
        pedido.setRestaurante(restaurante);
        pedido.setEnderecoRetirada(restaurante.getEnderecoRetirada());
        pedido.setDescricaoConteudo(dados.descricaoConteudo());
        pedido.setNomeDestinatario(dados.nomeDestinatario());
        pedido.setEnderecoEntrega(dados.enderecoEntrega());
        pedido.setReferenciaEntrega(dados.referenciaEntrega());
        pedido.setObservacoes(dados.observacoes());
        pedido.setDataCriacao(LocalDateTime.now(clock));
        pedido.setStatus(StatusEntrega.DISPONIVEL);
        return converter(pedidos.save(pedido));
    }

    public List<EntregaResponseDTO> listarTodos() {
        return converterLista(pedidos.findAll());
    }

    public List<EntregaResponseDTO> listarDisponiveis() {
        return converterLista(pedidos.findByStatus(StatusEntrega.DISPONIVEL));
    }

    public EntregaResponseDTO buscarPorId(Long id) {
        return converter(pedidos.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Entrega não encontrada.")));
    }

    public List<EntregaResponseDTO> listarPorRestaurante(Long id) {
        if (!restaurantes.existsById(id)) throw new NoSuchElementException("Restaurante não encontrado.");
        return converterLista(pedidos.findByRestauranteId(id));
    }

    public List<EntregaResponseDTO> listarPorMotoboy(Long id) {
        if (!motoboys.existsById(id)) throw new NoSuchElementException("Motoboy não encontrado.");
        return converterLista(pedidos.findByMotoboyId(id));
    }

    @Transactional
    public EntregaResponseDTO aceitar(Long id, AceitarEntregaRequestDTO dados) {
        // Ordem fixa: entrega, depois motoboy. Ambos ficam bloqueados até o commit.
        Pedido pedido = buscarParaAtualizar(id);
        if (pedido.getStatus() != StatusEntrega.DISPONIVEL) {
            throw new IllegalStateException("Entrega não está disponível.");
        }
        Motoboy motoboy = motoboys.findByIdForUpdate(dados.motoboyId())
                .orElseThrow(() -> new NoSuchElementException("Motoboy não encontrado."));
        if (!motoboy.isAtivo() || !motoboy.isDisponivel()) {
            throw new IllegalStateException("Motoboy deve estar ativo e disponível.");
        }
        // O bloqueio do motoboy serializa aceitações até de entregas diferentes.
        if (pedidos.existsByMotoboyIdAndStatusIn(motoboy.getId(), STATUS_ATIVOS)) {
            throw new IllegalStateException("Motoboy já possui uma entrega ativa.");
        }
        pedido.setMotoboy(motoboy);
        pedido.setStatus(StatusEntrega.ACEITA);
        pedido.setDataAceitacao(LocalDateTime.now(clock));
        return converter(pedido);
    }

    @Transactional
    public EntregaResponseDTO atualizarStatus(Long id, StatusEntregaRequestDTO dados) {
        Pedido pedido = buscarParaAtualizar(id);
        StatusEntrega novo = dados.status();
        boolean valida = switch (pedido.getStatus()) {
            case DISPONIVEL -> novo == StatusEntrega.CANCELADA;
            case ACEITA -> novo == StatusEntrega.RETIRADA;
            case RETIRADA -> novo == StatusEntrega.EM_ROTA;
            case EM_ROTA -> novo == StatusEntrega.ENTREGUE;
            case ENTREGUE, CANCELADA -> false;
        };
        if (!valida) throw new IllegalStateException("Transição de status não permitida.");
        pedido.setStatus(novo);
        if (novo == StatusEntrega.ENTREGUE) pedido.setDataConclusao(LocalDateTime.now(clock));
        return converter(pedido);
    }

    private Pedido buscarParaAtualizar(Long id) {
        return pedidos.findByIdForUpdate(id)
                .orElseThrow(() -> new NoSuchElementException("Entrega não encontrada."));
    }

    private List<EntregaResponseDTO> converterLista(List<Pedido> lista) {
        return lista.stream().map(this::converter).toList();
    }

    private EntregaResponseDTO converter(Pedido p) {
        Motoboy m = p.getMotoboy();
        return new EntregaResponseDTO(p.getId(), p.getRestaurante().getId(),
                p.getRestaurante().getNome(), m == null ? null : m.getId(),
                m == null ? null : m.getNome(), p.getDescricaoConteudo(), p.getNomeDestinatario(),
                p.getEnderecoRetirada(), p.getEnderecoEntrega(), p.getReferenciaEntrega(),
                p.getObservacoes(), p.getDataCriacao(), p.getDataAceitacao(),
                p.getDataConclusao(), p.getStatus());
    }
}
