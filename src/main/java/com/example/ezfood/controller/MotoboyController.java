package com.example.ezfood.controller;

import com.example.ezfood.dto.*;
import com.example.ezfood.service.*;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/motoboys")
public class MotoboyController {
    private final MotoboyService motoboys;
    private final PedidoService entregas;

    public MotoboyController(MotoboyService motoboys, PedidoService entregas) {
        this.motoboys = motoboys;
        this.entregas = entregas;
    }

    @PostMapping
    public ResponseEntity<MotoboyResponseDTO> cadastrar(@Valid @RequestBody MotoboyRequestDTO dados) {
        return ResponseEntity.status(HttpStatus.CREATED).body(motoboys.cadastrar(dados));
    }

    @GetMapping
    public List<MotoboyResponseDTO> listarTodos() {
        return motoboys.listarTodos();
    }

    @GetMapping("/{id}")
    public MotoboyResponseDTO buscarPorId(@PathVariable Long id) {
        return motoboys.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public MotoboyResponseDTO atualizar(@PathVariable Long id, @Valid @RequestBody MotoboyRequestDTO dados) {
        return motoboys.atualizar(id, dados);
    }

    @PatchMapping("/{id}/disponibilidade")
    public MotoboyResponseDTO disponibilidade(@PathVariable Long id,
            @Valid @RequestBody DisponibilidadeRequestDTO dados) {
        return motoboys.atualizarDisponibilidade(id, dados);
    }

    @GetMapping("/{id}/entregas")
    public List<EntregaResponseDTO> listarEntregas(@PathVariable Long id) {
        return entregas.listarPorMotoboy(id);
    }
}
