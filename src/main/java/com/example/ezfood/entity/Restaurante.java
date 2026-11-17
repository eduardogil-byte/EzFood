package com.example.ezfood.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity

public class Restaurante {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String nome;
    @Column(nullable = false, unique = true)
    private String cnpj;
    @Column(nullable = false)
    private String categoria;
    @Column(nullable = false, length = 500)
    private String enderecoRetirada;
    @Column(nullable = false)
    private boolean ativo;
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public String getEnderecoRetirada() { return enderecoRetirada; }
    public void setEnderecoRetirada(String enderecoRetirada) { this.enderecoRetirada = enderecoRetirada; }
    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }
}
