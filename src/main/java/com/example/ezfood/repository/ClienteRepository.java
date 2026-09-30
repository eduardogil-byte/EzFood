package com.example.ezfood.repository;

import com.example.ezfood.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    boolean existsByEmail(String email);

    List<Cliente> findByNomeContainingIgnoreCase(String nome);
}