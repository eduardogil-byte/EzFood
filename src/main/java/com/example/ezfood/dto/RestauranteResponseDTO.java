package com.example.ezfood.dto;

public record RestauranteResponseDTO(Long id, String nome, String cnpj,
        String categoria, String enderecoRetirada, boolean ativo) {}
