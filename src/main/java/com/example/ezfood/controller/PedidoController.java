
package com.example.ezfood.controller;

import com.example.ezfood.dto.AceitarEntregaRequestDTO;
import com.example.ezfood.dto.EntregaRequestDTO;
import com.example.ezfood.dto.EntregaResponseDTO;
import com.example.ezfood.dto.StatusEntregaRequestDTO;

import com.example.ezfood.service.PedidoService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/entregas")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    // Criar entrega
    @PostMapping
    public ResponseEntity<EntregaResponseDTO> cadastrar(
            @Valid @RequestBody EntregaRequestDTO dados) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(pedidoService.cadastrar(dados));
    }

    // Listar todas as entregas
    @GetMapping
    public ResponseEntity<List<EntregaResponseDTO>> listarTodos() {

        return ResponseEntity.ok(
                pedidoService.listarTodos()
        );
    }

    @GetMapping("/disponiveis")
    public ResponseEntity<List<EntregaResponseDTO>> listarDisponiveis() {
        return ResponseEntity.ok(pedidoService.listarDisponiveis());
    }

    @PatchMapping("/{id}/aceitar")
    public ResponseEntity<EntregaResponseDTO> aceitar(
            @PathVariable Long id,
            @Valid @RequestBody AceitarEntregaRequestDTO dados) {
        return ResponseEntity.ok(pedidoService.aceitar(id, dados));
    }

    // Buscar entrega pelo ID
    @GetMapping("/{id}")
    public ResponseEntity<EntregaResponseDTO> buscarPorId(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                pedidoService.buscarPorId(id)
        );
    }

    // Atualizar status da entrega
    @PatchMapping("/{id}/status")
    public ResponseEntity<EntregaResponseDTO> atualizarStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusEntregaRequestDTO dados) {

        return ResponseEntity.ok(
                pedidoService.atualizarStatus(id, dados)
        );
    }
}
