
package com.example.ezfood.service;

import com.example.ezfood.dto.RestauranteRequestDTO;
import com.example.ezfood.dto.RestauranteResponseDTO;
import com.example.ezfood.entity.Restaurante;
import com.example.ezfood.repository.RestauranteRepository;
import com.example.ezfood.repository.PedidoRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class RestauranteService {

    private final RestauranteRepository restauranteRepository;
    private final PedidoRepository pedidoRepository;

    public RestauranteService(
            RestauranteRepository restauranteRepository,
            PedidoRepository pedidoRepository) {

        this.restauranteRepository = restauranteRepository;
        this.pedidoRepository = pedidoRepository;
    }

    // 1. Cadastrar restaurante
    @Transactional
    public RestauranteResponseDTO cadastrar(
            RestauranteRequestDTO dados) {

        if (restauranteRepository.existsByCnpj(dados.cnpj())) {
            throw new IllegalArgumentException(
                    "CNPJ já cadastrado."
            );
        }

        Restaurante restaurante = new Restaurante();

        restaurante.setNome(dados.nome());
        restaurante.setCnpj(dados.cnpj());
        restaurante.setCategoria(dados.categoria());
        restaurante.setAberto(dados.aberto());
        restaurante.setTaxaEntrega(dados.taxaEntrega());

        Restaurante salvo =
                restauranteRepository.save(restaurante);

        return converterParaDTO(salvo);
    }

    // 2. Listar todos os restaurantes
    public List<RestauranteResponseDTO> listarTodos() {

        return restauranteRepository.findAll()
                .stream()
                .map(this::converterParaDTO)
                .toList();
    }

    // 3. Buscar restaurante pelo ID
    public RestauranteResponseDTO buscarPorId(Long id) {

        Restaurante restaurante =
                buscarEntidadePorId(id);

        return converterParaDTO(restaurante);
    }

    // 4. Buscar restaurantes pelo nome
    public List<RestauranteResponseDTO> buscarPorNome(
            String nome) {

        return restauranteRepository
                .findByNomeContainingIgnoreCase(nome)
                .stream()
                .map(this::converterParaDTO)
                .toList();
    }

    // 5. Atualizar restaurante
    @Transactional
    public RestauranteResponseDTO atualizar(
            Long id, RestauranteRequestDTO dados) {

        Restaurante restaurante = buscarEntidadePorId(id);

        if (!restaurante.getCnpj().equals(dados.cnpj())
                && restauranteRepository.existsByCnpj(dados.cnpj())) {

            throw new IllegalArgumentException(
                    "CNPJ já cadastrado."
            );
        }

        restaurante.setNome(dados.nome());
        restaurante.setCnpj(dados.cnpj());
        restaurante.setCategoria(dados.categoria());
        restaurante.setAberto(dados.aberto());
        restaurante.setTaxaEntrega(dados.taxaEntrega());

        Restaurante atualizado =
                restauranteRepository.save(restaurante);

        return converterParaDTO(atualizado);
    }

    // 6. Excluir restaurante
    @Transactional
    public void excluir(Long id) {

        Restaurante restaurante = buscarEntidadePorId(id);

        if (pedidoRepository.existsByRestauranteId(id)) {
            throw new IllegalStateException(
                    "Não é possível excluir restaurante com pedidos."
            );
        }

        restauranteRepository.delete(restaurante);
    }

    // Método auxiliar para buscar entidade
    private Restaurante buscarEntidadePorId(Long id) {

        return restauranteRepository.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Restaurante não encontrado."
                        )
                );
    }

    // Converte Restaurante para DTO
    private RestauranteResponseDTO converterParaDTO(
            Restaurante restaurante) {

        return new RestauranteResponseDTO(
                restaurante.getId(),
                restaurante.getNome(),
                restaurante.getCnpj(),
                restaurante.getCategoria(),
                restaurante.isAberto(),
                restaurante.getTaxaEntrega()
        );
    }
}
