
package com.example.ezfood.service;

import com.example.ezfood.dto.ClienteRequestDTO;
import com.example.ezfood.dto.ClienteResponseDTO;
import com.example.ezfood.entity.Cliente;
import com.example.ezfood.repository.ClienteRepository;
import com.example.ezfood.repository.PedidoRepository;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final PedidoRepository pedidoRepository;

    public ClienteService(
            ClienteRepository clienteRepository,
            PedidoRepository pedidoRepository) {

        this.clienteRepository = clienteRepository;
        this.pedidoRepository = pedidoRepository;
    }

    // 1. Cadastrar cliente
    public ClienteResponseDTO cadastrar(ClienteRequestDTO dados) {

        if (clienteRepository.existsByEmail(dados.email())) {
            throw new IllegalArgumentException("E-mail já cadastrado.");
        }

        Cliente cliente = new Cliente();
        cliente.setNome(dados.nome());
        cliente.setEmail(dados.email());
        cliente.setDataCadastro(LocalDate.now());
        cliente.setAtivo(true);

        Cliente salvo = clienteRepository.save(cliente);

        return converterParaDTO(salvo);
    }

    // 2. Listar todos os clientes
    public List<ClienteResponseDTO> listarTodos() {

        return clienteRepository.findAll()
                .stream()
                .map(this::converterParaDTO)
                .toList();
    }

    // 3. Buscar cliente pelo ID
    public ClienteResponseDTO buscarPorId(Long id) {

        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Cliente não encontrado."
                        )
                );

        return converterParaDTO(cliente);
    }

    // 4. Buscar clientes pelo nome
    public List<ClienteResponseDTO> buscarPorNome(String nome) {

        return clienteRepository
                .findByNomeContainingIgnoreCase(nome)
                .stream()
                .map(this::converterParaDTO)
                .toList();
    }

    // Converte a entidade Cliente para DTO
    private ClienteResponseDTO converterParaDTO(Cliente cliente) {

        return new ClienteResponseDTO(
                cliente.getId(),
                cliente.getNome(),
                cliente.getEmail(),
                cliente.getDataCadastro(),
                cliente.isAtivo()
        );
    }


    // 5. Atualizar cliente
    @Transactional
    public ClienteResponseDTO atualizar(
            Long id, ClienteRequestDTO dados) {

        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Cliente não encontrado."
                        )
                );

        // Impede duplicação de e-mail
        if (!cliente.getEmail().equals(dados.email())
                && clienteRepository.existsByEmail(dados.email())) {

            throw new IllegalArgumentException(
                    "E-mail já cadastrado."
            );
        }

        cliente.setNome(dados.nome());
        cliente.setEmail(dados.email());

        Cliente atualizado = clienteRepository.save(cliente);

        return converterParaDTO(atualizado);
    }

    // 6. Excluir cliente
    @Transactional
    public void excluir(Long id) {

        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Cliente não encontrado."
                        )
                );

        // Impede excluir clientes com pedidos
        if (pedidoRepository.existsByClienteId(id)) {

            throw new IllegalStateException(
                    "Não é possível excluir cliente com pedidos."
            );
        }

        clienteRepository.delete(cliente);
    }

}
