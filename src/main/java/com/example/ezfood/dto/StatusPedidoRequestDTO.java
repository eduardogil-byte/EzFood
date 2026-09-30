package com.example.ezfood.dto;

import com.example.ezfood.entity.StatusPedido;
import jakarta.validation.constraints.NotNull;

public record StatusPedidoRequestDTO(

        @NotNull
        StatusPedido status

) {
}