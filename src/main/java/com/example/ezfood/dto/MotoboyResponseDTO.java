package com.example.ezfood.dto;

import java.time.LocalDateTime;

public record MotoboyResponseDTO(Long id, String nome, String telefone, String email,
        boolean ativo, boolean disponivel, LocalDateTime dataCadastro) {}
