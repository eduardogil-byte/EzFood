package com.example.ezfood.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Digits;

import java.math.BigDecimal;

public record PedidoRequestDTO(

        @NotNull
        @Positive
        Long clienteId,

        @NotNull
        @Positive
        Long restauranteId,

        @NotNull
        @DecimalMin("0.01")
        @Digits(integer = 10, fraction = 2)
        BigDecimal valorProdutos

) {
}
