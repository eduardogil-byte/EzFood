package com.example.ezfood.repository;

import com.example.ezfood.entity.Motoboy;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface MotoboyRepository extends JpaRepository<Motoboy, Long> {
    boolean existsByEmail(String email);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select m from Motoboy m where m.id = :id")
    Optional<Motoboy> findByIdForUpdate(@Param("id") Long id);
}
