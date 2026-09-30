package com.example.ezfood.dto;

import java.time.LocalDate;

public record ClienteResponseDTO(
        Long id,
        String nome,
        String email,
        LocalDate dataCadastro,
        boolean ativo
) {
}