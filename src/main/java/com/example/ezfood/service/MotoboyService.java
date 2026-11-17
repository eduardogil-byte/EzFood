package com.example.ezfood.service;

import com.example.ezfood.dto.*;
import com.example.ezfood.entity.Motoboy;
import com.example.ezfood.repository.MotoboyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class MotoboyService {
    private final MotoboyRepository repository;
    private final Clock clock;

    public MotoboyService(MotoboyRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    @Transactional
    public MotoboyResponseDTO cadastrar(MotoboyRequestDTO dados) {
        validarEmail(dados.email());
        Motoboy motoboy = new Motoboy();
        aplicar(motoboy, dados);
        motoboy.setDataCadastro(LocalDateTime.now(clock));
        return converter(repository.save(motoboy));
    }

    public List<MotoboyResponseDTO> listarTodos() {
        return repository.findAll().stream().map(this::converter).toList();
    }

    public MotoboyResponseDTO buscarPorId(Long id) {
        return converter(repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Motoboy não encontrado.")));
    }

    @Transactional
    public MotoboyResponseDTO atualizar(Long id, MotoboyRequestDTO dados) {
        Motoboy motoboy = buscarParaAtualizar(id);
        if (!motoboy.getEmail().equals(dados.email())) validarEmail(dados.email());
        aplicar(motoboy, dados);
        return converter(motoboy);
    }

    @Transactional
    public MotoboyResponseDTO atualizarDisponibilidade(Long id, DisponibilidadeRequestDTO dados) {
        Motoboy motoboy = buscarParaAtualizar(id);
        motoboy.setDisponivel(dados.disponivel());
        return converter(motoboy);
    }

    private Motoboy buscarParaAtualizar(Long id) {
        return repository.findByIdForUpdate(id)
                .orElseThrow(() -> new NoSuchElementException("Motoboy não encontrado."));
    }

    private void validarEmail(String email) {
        if (repository.existsByEmail(email)) throw new IllegalStateException("E-mail já cadastrado.");
    }

    private void aplicar(Motoboy motoboy, MotoboyRequestDTO dados) {
        motoboy.setNome(dados.nome());
        motoboy.setTelefone(dados.telefone());
        motoboy.setEmail(dados.email());
        motoboy.setAtivo(dados.ativo());
        motoboy.setDisponivel(dados.disponivel());
    }

    private MotoboyResponseDTO converter(Motoboy m) {
        return new MotoboyResponseDTO(m.getId(), m.getNome(), m.getTelefone(),
                m.getEmail(), m.isAtivo(), m.isDisponivel(), m.getDataCadastro());
    }
}
