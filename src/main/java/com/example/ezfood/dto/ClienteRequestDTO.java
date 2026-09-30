package com.example.ezfood.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ClienteRequestDTO(

        @NotBlank
        String nome,

        @NotBlank
        @Email
        String email

) {
}