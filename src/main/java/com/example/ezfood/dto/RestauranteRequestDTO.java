package com.example.ezfood.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Digits;

import java.math.BigDecimal;

public record RestauranteRequestDTO(

        @NotBlank
        @Size(max = 255)
        String nome,

        @NotBlank
        @Size(max = 255)
        String cnpj,

        @NotBlank
        @Size(max = 255)
        String categoria,

        @NotNull
        Boolean aberto,

        @NotNull
        @DecimalMin("0.0")
        @Digits(integer = 10, fraction = 2)
        BigDecimal taxaEntrega

) {
    public RestauranteRequestDTO {
        nome = nome == null ? null : nome.strip();
        cnpj = cnpj == null ? null : cnpj.strip()
                .replace(".", "").replace("/", "").replace("-", "");
        categoria = categoria == null ? null : categoria.strip();
    }
}
