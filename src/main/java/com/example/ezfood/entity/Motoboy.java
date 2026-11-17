package com.example.ezfood.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity

public class Motoboy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String nome;
    @Column(nullable = false, length = 30)
    private String telefone;
    @Column(nullable = false, unique = true)
    private String email;
    @Column(nullable = false)
    private boolean ativo;
    @Column(nullable = false)
    private boolean disponivel;
    @Column(nullable = false, updatable = false)
    private LocalDateTime dataCadastro;
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }
    public boolean isDisponivel() { return disponivel; }
    public void setDisponivel(boolean disponivel) { this.disponivel = disponivel; }
    public LocalDateTime getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDateTime dataCadastro) { this.dataCadastro = dataCadastro; }
}
