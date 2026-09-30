package com.example.ezfood.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record PedidoRequestDTO(

        @NotNull
        Long clienteId,

        @NotNull
        Long restauranteId,

        @NotNull
        @DecimalMin("0.01")
        BigDecimal valorProdutos

) {
}