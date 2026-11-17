package com.example.ezfood.dto;

import jakarta.validation.constraints.*;

public record RestauranteRequestDTO(
        @NotBlank @Size(max = 255) String nome,
        @NotBlank @Pattern(regexp = "[0-9]{14}") String cnpj,
        @NotBlank @Size(max = 255) String categoria,
        @NotBlank @Size(max = 500) String enderecoRetirada,
        @NotNull Boolean ativo
) {
    public RestauranteRequestDTO {
        nome = nome == null ? null : nome.strip();
        cnpj = cnpj == null ? null : cnpj.strip().replace(".", "").replace("/", "").replace("-", "");
        categoria = categoria == null ? null : categoria.strip();
        enderecoRetirada = enderecoRetirada == null ? null : enderecoRetirada.strip();
    }
}
