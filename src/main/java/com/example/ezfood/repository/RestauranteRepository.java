package com.example.ezfood.repository;

import com.example.ezfood.entity.Restaurante;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RestauranteRepository extends JpaRepository<Restaurante, Long> {

    boolean existsByCnpj(String cnpj);

    List<Restaurante> findByNomeContainingIgnoreCase(String nome);
}