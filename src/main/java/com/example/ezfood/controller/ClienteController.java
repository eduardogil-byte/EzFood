
package com.example.ezfood.controller;

import com.example.ezfood.dto.ClienteRequestDTO;
import com.example.ezfood.dto.ClienteResponseDTO;
import com.example.ezfood.dto.PedidoResponseDTO;
import com.example.ezfood.service.ClienteService;
import com.example.ezfood.service.PedidoService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/clientes")
public class ClienteController {

    private final ClienteService clienteService;
    private final PedidoService pedidoService;

    public ClienteController(
            ClienteService clienteService,
            PedidoService pedidoService) {
        this.clienteService = clienteService;
        this.pedidoService = pedidoService;
    }

    // Cadastrar cliente
    @PostMapping
    public ResponseEntity<ClienteResponseDTO> cadastrar(
            @Valid @RequestBody ClienteRequestDTO dados) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(clienteService.cadastrar(dados));
    }

    // Listar todos
    @GetMapping
    public ResponseEntity<List<ClienteResponseDTO>> listarTodos() {
        return ResponseEntity.ok(clienteService.listarTodos());
    }

    // Buscar por nome
    @GetMapping("/busca")
    public ResponseEntity<List<ClienteResponseDTO>> buscarPorNome(
            @RequestParam String nome) {

        return ResponseEntity.ok(clienteService.buscarPorNome(nome));
    }

    // Buscar por ID
    @GetMapping("/{id}")
    public ResponseEntity<ClienteResponseDTO> buscarPorId(
            @PathVariable Long id) {

        return ResponseEntity.ok(clienteService.buscarPorId(id));
    }

    // Atualizar cliente
    @PutMapping("/{id}")
    public ResponseEntity<ClienteResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody ClienteRequestDTO dados) {

        return ResponseEntity.ok(clienteService.atualizar(id, dados));
    }

    // Excluir cliente
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {

        clienteService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    // Listar pedidos de um cliente
    @GetMapping("/{id}/pedidos")
    public ResponseEntity<List<PedidoResponseDTO>> listarPedidos(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                pedidoService.listarPorCliente(id)
        );
    }
}
