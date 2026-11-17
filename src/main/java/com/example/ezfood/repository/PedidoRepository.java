package com.example.ezfood.repository;

import com.example.ezfood.entity.*;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Pedido p where p.id = :id")
    Optional<Pedido> findByIdForUpdate(@Param("id") Long id);

    List<Pedido> findByMotoboyId(Long motoboyId);
    List<Pedido> findByRestauranteId(Long restauranteId);
    List<Pedido> findByStatus(StatusEntrega status);
    boolean existsByRestauranteId(Long restauranteId);
    boolean existsByMotoboyIdAndStatusIn(Long motoboyId, List<StatusEntrega> status);
}
