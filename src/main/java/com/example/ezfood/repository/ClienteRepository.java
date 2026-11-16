package com.example.ezfood.repository;

import com.example.ezfood.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;

import java.util.List;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Cliente c where c.id = :id")
    Optional<Cliente> findByIdForUpdate(@Param("id") Long id);

    boolean existsByEmail(String email);

    List<Cliente> findByNomeContainingIgnoreCase(String nome);
}
