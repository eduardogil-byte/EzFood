package com.example.ezfood.repository;

import com.example.ezfood.entity.Pedido;
import com.example.ezfood.entity.StatusPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;

import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Pedido p where p.id = :id")
    Optional<Pedido> findByIdForUpdate(@Param("id") Long id);

    List<Pedido> findByClienteId(Long clienteId);

    List<Pedido> findByRestauranteId(Long restauranteId);


    boolean existsByClienteId(Long clienteId);

    boolean existsByRestauranteId(Long restauranteId);

    long countByClienteIdAndStatusIn(
            Long clienteId,
            List<StatusPedido> status
    );
}
