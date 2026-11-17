package com.example.ezfood.service;

import com.example.ezfood.dto.*;
import com.example.ezfood.entity.Restaurante;
import com.example.ezfood.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class RestauranteService {
    private final RestauranteRepository restaurantes;
    private final PedidoRepository pedidos;

    public RestauranteService(RestauranteRepository restaurantes, PedidoRepository pedidos) {
        this.restaurantes = restaurantes;
        this.pedidos = pedidos;
    }

    @Transactional
    public RestauranteResponseDTO cadastrar(RestauranteRequestDTO dados) {
        validarCnpj(dados.cnpj());
        Restaurante restaurante = new Restaurante();
        aplicar(restaurante, dados);
        return converter(restaurantes.save(restaurante));
    }

    public List<RestauranteResponseDTO> listarTodos() {
        return restaurantes.findAll().stream().map(this::converter).toList();
    }

    public RestauranteResponseDTO buscarPorId(Long id) {
        return converter(restaurantes.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Restaurante não encontrado.")));
    }

    public List<RestauranteResponseDTO> buscarPorNome(String nome) {
        return restaurantes.findByNomeContainingIgnoreCase(nome).stream().map(this::converter).toList();
    }

    @Transactional
    public RestauranteResponseDTO atualizar(Long id, RestauranteRequestDTO dados) {
        Restaurante restaurante = buscarParaAtualizar(id);
        if (!restaurante.getCnpj().equals(dados.cnpj())) validarCnpj(dados.cnpj());
        aplicar(restaurante, dados);
        return converter(restaurante);
    }

    @Transactional
    public void excluir(Long id) {
        Restaurante restaurante = buscarParaAtualizar(id);
        if (pedidos.existsByRestauranteId(id)) {
            throw new IllegalStateException("Não é possível excluir restaurante com entregas.");
        }
        restaurantes.delete(restaurante);
    }

    private Restaurante buscarParaAtualizar(Long id) {
        return restaurantes.findByIdForUpdate(id)
                .orElseThrow(() -> new NoSuchElementException("Restaurante não encontrado."));
    }

    private void validarCnpj(String cnpj) {
        if (restaurantes.existsByCnpj(cnpj)) throw new IllegalStateException("CNPJ já cadastrado.");
    }

    private void aplicar(Restaurante restaurante, RestauranteRequestDTO dados) {
        restaurante.setNome(dados.nome());
        restaurante.setCnpj(dados.cnpj());
        restaurante.setCategoria(dados.categoria());
        restaurante.setEnderecoRetirada(dados.enderecoRetirada());
        restaurante.setAtivo(dados.ativo());
    }

    private RestauranteResponseDTO converter(Restaurante r) {
        return new RestauranteResponseDTO(r.getId(), r.getNome(), r.getCnpj(),
                r.getCategoria(), r.getEnderecoRetirada(), r.isAtivo());
    }
}
