package com.example.ezfood.repository;

import com.example.ezfood.entity.Restaurante;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface RestauranteRepository extends JpaRepository<Restaurante, Long> {
    boolean existsByCnpj(String cnpj);
    List<Restaurante> findByNomeContainingIgnoreCase(String nome);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from Restaurante r where r.id = :id")
    Optional<Restaurante> findByIdForUpdate(@Param("id") Long id);
}
