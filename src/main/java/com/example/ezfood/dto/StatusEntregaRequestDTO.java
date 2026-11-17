package com.example.ezfood.dto;

import com.example.ezfood.entity.StatusEntrega;
import jakarta.validation.constraints.NotNull;

public record StatusEntregaRequestDTO(@NotNull StatusEntrega status) {}
