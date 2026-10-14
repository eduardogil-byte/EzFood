
package com.example.ezfood.controller;

import com.example.ezfood.dto.RestauranteRequestDTO;
import com.example.ezfood.dto.RestauranteResponseDTO;
import com.example.ezfood.dto.PedidoResponseDTO;

import com.example.ezfood.service.RestauranteService;
import com.example.ezfood.service.PedidoService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/restaurantes")
public class RestauranteController {

    private final RestauranteService restauranteService;
    private final PedidoService pedidoService;

    public RestauranteController(
            RestauranteService restauranteService,
            PedidoService pedidoService) {

        this.restauranteService = restauranteService;
        this.pedidoService = pedidoService;
    }

    // Cadastrar restaurante
    @PostMapping
    public ResponseEntity<RestauranteResponseDTO> cadastrar(
            @Valid @RequestBody RestauranteRequestDTO dados) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(restauranteService.cadastrar(dados));
    }

    // Listar todos
    @GetMapping
    public ResponseEntity<List<RestauranteResponseDTO>> listarTodos() {

        return ResponseEntity.ok(
                restauranteService.listarTodos()
        );
    }

    // Buscar por nome
    @GetMapping("/busca")
    public ResponseEntity<List<RestauranteResponseDTO>> buscarPorNome(
            @RequestParam String nome) {

        return ResponseEntity.ok(
                restauranteService.buscarPorNome(nome)
        );
    }

    // Buscar por ID
    @GetMapping("/{id}")
    public ResponseEntity<RestauranteResponseDTO> buscarPorId(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                restauranteService.buscarPorId(id)
        );
    }

    // Atualizar restaurante
    @PutMapping("/{id}")
    public ResponseEntity<RestauranteResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody RestauranteRequestDTO dados) {

        return ResponseEntity.ok(
                restauranteService.atualizar(id, dados)
        );
    }

    // Excluir restaurante
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {

        restauranteService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    // Listar pedidos de um restaurante
    @GetMapping("/{id}/pedidos")
    public ResponseEntity<List<PedidoResponseDTO>> listarPedidos(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                pedidoService.listarPorRestaurante(id)
        );
    }
}
