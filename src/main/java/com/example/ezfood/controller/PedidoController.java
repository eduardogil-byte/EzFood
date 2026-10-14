
package com.example.ezfood.controller;

import com.example.ezfood.dto.PedidoRequestDTO;
import com.example.ezfood.dto.PedidoResponseDTO;
import com.example.ezfood.dto.StatusPedidoRequestDTO;

import com.example.ezfood.service.PedidoService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    // Criar pedido
    @PostMapping
    public ResponseEntity<PedidoResponseDTO> cadastrar(
            @Valid @RequestBody PedidoRequestDTO dados) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(pedidoService.cadastrar(dados));
    }

    // Listar todos os pedidos
    @GetMapping
    public ResponseEntity<List<PedidoResponseDTO>> listarTodos() {

        return ResponseEntity.ok(
                pedidoService.listarTodos()
        );
    }

    // Buscar pedido pelo ID
    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponseDTO> buscarPorId(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                pedidoService.buscarPorId(id)
        );
    }

    // Atualizar status do pedido
    @PatchMapping("/{id}/status")
    public ResponseEntity<PedidoResponseDTO> atualizarStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusPedidoRequestDTO dados) {

        return ResponseEntity.ok(
                pedidoService.atualizarStatus(id, dados)
        );
    }
}
