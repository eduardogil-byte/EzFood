package com.example.ezfood.dto;

import com.example.ezfood.entity.StatusEntrega;
import java.time.LocalDateTime;

public record EntregaResponseDTO(Long id, Long restauranteId, String restauranteNome,
        Long motoboyId, String motoboyNome, String descricaoConteudo, String nomeDestinatario,
        String enderecoRetirada, String enderecoEntrega, String referenciaEntrega, String observacoes,
        LocalDateTime dataCriacao, LocalDateTime dataAceitacao, LocalDateTime dataConclusao,
        StatusEntrega status) {}
