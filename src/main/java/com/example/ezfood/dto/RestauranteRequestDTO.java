package com.example.ezfood.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record RestauranteRequestDTO(

        @NotBlank
        String nome,

        @NotBlank
        String cnpj,

        @NotBlank
        String categoria,

        boolean aberto,

        @NotNull
        @DecimalMin("0.0")
        BigDecimal taxaEntrega

) {
}