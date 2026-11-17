package com.example.ezfood.dto;

import jakarta.validation.constraints.*;

public record AceitarEntregaRequestDTO(@NotNull @Positive Long motoboyId) {}
