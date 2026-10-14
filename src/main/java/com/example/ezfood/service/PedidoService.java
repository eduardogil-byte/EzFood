
package com.example.ezfood.service;

import com.example.ezfood.dto.PedidoRequestDTO;
import com.example.ezfood.dto.PedidoResponseDTO;
import com.example.ezfood.dto.StatusPedidoRequestDTO;

import com.example.ezfood.entity.Cliente;
import com.example.ezfood.entity.Pedido;
import com.example.ezfood.entity.Restaurante;
import com.example.ezfood.entity.StatusPedido;

import com.example.ezfood.repository.ClienteRepository;
import com.example.ezfood.repository.PedidoRepository;
import com.example.ezfood.repository.RestauranteRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class PedidoService {

    private static final int LIMITE_PEDIDOS_ATIVOS = 3;
    private static final int PRAZO_CANCELAMENTO_MINUTOS = 10;

    private static final List<StatusPedido> STATUS_ATIVOS = List.of(
            StatusPedido.CRIADO,
            StatusPedido.PREPARANDO,
            StatusPedido.SAIU_PARA_ENTREGA
    );

    private final PedidoRepository pedidoRepository;
    private final ClienteRepository clienteRepository;
    private final RestauranteRepository restauranteRepository;

    public PedidoService(
            PedidoRepository pedidoRepository,
            ClienteRepository clienteRepository,
            RestauranteRepository restauranteRepository) {

        this.pedidoRepository = pedidoRepository;
        this.clienteRepository = clienteRepository;
        this.restauranteRepository = restauranteRepository;
    }

    // 1. Cadastrar pedido
    @Transactional
    public PedidoResponseDTO cadastrar(PedidoRequestDTO dados) {

        Cliente cliente = clienteRepository
                .findById(dados.clienteId())
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Cliente não encontrado."
                        )
                );

        Restaurante restaurante = restauranteRepository
                .findById(dados.restauranteId())
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Restaurante não encontrado."
                        )
                );

        // RN1 - Disponibilidade
        if (!cliente.isAtivo()) {
            throw new IllegalStateException(
                    "Cliente inativo não pode realizar pedidos."
            );
        }

        if (!restaurante.isAberto()) {
            throw new IllegalStateException(
                    "Restaurante fechado. Pedido não permitido."
            );
        }

        // RN2 - Limite de pedidos ativos
        long pedidosAtivos =
                pedidoRepository.countByClienteIdAndStatusIn(
                        cliente.getId(),
                        STATUS_ATIVOS
                );

        if (pedidosAtivos >= LIMITE_PEDIDOS_ATIVOS) {
            throw new IllegalStateException(
                    "Cliente atingiu o limite de 3 pedidos ativos."
            );
        }

        // Validação do valor dos produtos
        BigDecimal valorProdutos = dados.valorProdutos();

        if (valorProdutos == null ||
                valorProdutos.compareTo(BigDecimal.ZERO) <= 0) {

            throw new IllegalArgumentException(
                    "O valor dos produtos deve ser maior que zero."
            );
        }

        BigDecimal taxaEntrega = restaurante.getTaxaEntrega();

        if (taxaEntrega == null ||
                taxaEntrega.compareTo(BigDecimal.ZERO) < 0) {

            throw new IllegalStateException(
                    "Taxa de entrega do restaurante inválida."
            );
        }

        // RN3 - Cálculo automático
        BigDecimal valorTotal = valorProdutos.add(taxaEntrega);

        Pedido pedido = new Pedido();

        pedido.setCliente(cliente);
        pedido.setRestaurante(restaurante);
        pedido.setDataPedido(LocalDateTime.now());
        pedido.setValorProdutos(valorProdutos);
        pedido.setValorTotal(valorTotal);
        pedido.setStatus(StatusPedido.CRIADO);

        Pedido salvo = pedidoRepository.save(pedido);

        return converterParaDTO(salvo);
    }

    // 2. Listar todos os pedidos
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarTodos() {

        return pedidoRepository.findAll()
                .stream()
                .map(this::converterParaDTO)
                .toList();
    }

    // 3. Buscar pedido pelo ID
    @Transactional(readOnly = true)
    public PedidoResponseDTO buscarPorId(Long id) {

        Pedido pedido = buscarEntidadePorId(id);

        return converterParaDTO(pedido);
    }

    // 4. Listar pedidos de um cliente
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarPorCliente(Long clienteId) {

        return pedidoRepository.findByClienteId(clienteId)
                .stream()
                .map(this::converterParaDTO)
                .toList();
    }

    // 5. Listar pedidos de um restaurante
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarPorRestaurante(
            Long restauranteId) {

        return pedidoRepository.findByRestauranteId(restauranteId)
                .stream()
                .map(this::converterParaDTO)
                .toList();
    }

    // 6. Atualizar status do pedido
    @Transactional
    public PedidoResponseDTO atualizarStatus(
            Long id,
            StatusPedidoRequestDTO dados) {

        Pedido pedido = buscarEntidadePorId(id);

        StatusPedido statusAtual = pedido.getStatus();
        StatusPedido novoStatus = dados.status();

        if (novoStatus == null) {
            throw new IllegalArgumentException(
                    "O novo status é obrigatório."
            );
        }

        // RN4 - Cancelamento condicionado
        if (novoStatus == StatusPedido.CANCELADO) {

            if (statusAtual != StatusPedido.CRIADO) {
                throw new IllegalStateException(
                        "Somente pedidos CRIADOS podem ser cancelados."
                );
            }

            LocalDateTime prazoLimite = pedido.getDataPedido()
                    .plusMinutes(PRAZO_CANCELAMENTO_MINUTOS);

            if (LocalDateTime.now().isAfter(prazoLimite)) {
                throw new IllegalStateException(
                        "O prazo de 10 minutos para cancelamento expirou."
                );
            }

        } else {

            // Garante a ordem correta dos status
            boolean transicaoValida = switch (statusAtual) {
                case CRIADO ->
                        novoStatus == StatusPedido.PREPARANDO;

                case PREPARANDO ->
                        novoStatus == StatusPedido.SAIU_PARA_ENTREGA;

                case SAIU_PARA_ENTREGA ->
                        novoStatus == StatusPedido.ENTREGUE;

                case ENTREGUE, CANCELADO -> false;
            };

            if (!transicaoValida) {
                throw new IllegalStateException(
                        "Transição de status não permitida: "
                                + statusAtual + " para " + novoStatus
                );
            }
        }

        pedido.setStatus(novoStatus);

        Pedido atualizado = pedidoRepository.save(pedido);

        return converterParaDTO(atualizado);
    }

    // Método auxiliar: buscar entidade por ID
    private Pedido buscarEntidadePorId(Long id) {

        return pedidoRepository.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Pedido não encontrado."
                        )
                );
    }

    // Método auxiliar: converter entidade em DTO
    private PedidoResponseDTO converterParaDTO(Pedido pedido) {

        return new PedidoResponseDTO(
                pedido.getId(),
                pedido.getCliente().getId(),
                pedido.getCliente().getNome(),
                pedido.getRestaurante().getId(),
                pedido.getRestaurante().getNome(),
                pedido.getDataPedido(),
                pedido.getValorProdutos(),
                pedido.getValorTotal(),
                pedido.getStatus()
        );
    }
}
