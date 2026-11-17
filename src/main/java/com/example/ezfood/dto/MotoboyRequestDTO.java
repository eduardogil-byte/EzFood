package com.example.ezfood.dto;

import jakarta.validation.constraints.*;
import java.util.Locale;

public record MotoboyRequestDTO(
        @NotBlank @Size(max = 255) String nome,
        @NotBlank @Size(max = 30) String telefone,
        @NotBlank @Email @Size(max = 255) String email,
        @NotNull Boolean ativo,
        @NotNull Boolean disponivel
) {
    public MotoboyRequestDTO {
        nome = nome == null ? null : nome.strip();
        telefone = telefone == null ? null : telefone.strip();
        email = email == null ? null : email.strip().toLowerCase(Locale.ROOT);
    }
}
