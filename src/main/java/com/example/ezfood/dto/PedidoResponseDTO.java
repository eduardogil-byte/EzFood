package com.example.ezfood.dto;

import com.example.ezfood.entity.StatusPedido;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PedidoResponseDTO(
        Long id,
        Long clienteId,
        String clienteNome,
        Long restauranteId,
        String restauranteNome,
        LocalDateTime dataPedido,
        BigDecimal valorProdutos,
        BigDecimal valorTotal,
        StatusPedido status
) {
}