package com.example.ezfood.repository;

import com.example.ezfood.entity.Pedido;
import com.example.ezfood.entity.StatusPedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    List<Pedido> findByClienteId(Long clienteId);

    List<Pedido> findByRestauranteId(Long restauranteId);

    long countByClienteIdAndStatusIn(
            Long clienteId,
            List<StatusPedido> status
    );
}