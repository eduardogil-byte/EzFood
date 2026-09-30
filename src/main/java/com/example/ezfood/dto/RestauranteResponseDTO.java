package com.example.ezfood.dto;

import java.math.BigDecimal;

public record RestauranteResponseDTO(
        Long id,
        String nome,
        String cnpj,
        String categoria,
        boolean aberto,
        BigDecimal taxaEntrega
) {
}