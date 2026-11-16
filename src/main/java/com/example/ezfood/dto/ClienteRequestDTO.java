package com.example.ezfood.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Locale;

public record ClienteRequestDTO(

        @NotBlank
        @Size(max = 255)
        String nome,

        @NotBlank
        @Email
        @Size(max = 255)
        String email

) {
    public ClienteRequestDTO {
        nome = nome == null ? null : nome.strip();
        email = email == null ? null : email.strip().toLowerCase(Locale.ROOT);
    }
}
