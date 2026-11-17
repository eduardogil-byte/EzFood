package com.example.ezfood.dto;

import jakarta.validation.constraints.*;

public record EntregaRequestDTO(
        @NotNull @Positive Long restauranteId,
        @NotBlank @Size(max = 500) String descricaoConteudo,
        @NotBlank @Size(max = 255) String nomeDestinatario,
        @NotBlank @Size(max = 500) String enderecoEntrega,
        @Size(max = 500) String referenciaEntrega,
        @Size(max = 1000) String observacoes
) {}
