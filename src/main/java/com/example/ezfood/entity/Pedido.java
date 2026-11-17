package com.example.ezfood.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(indexes = {
    @Index(name = "idx_entrega_status", columnList = "status"),
    @Index(name = "idx_entrega_motoboy_status", columnList = "motoboy_id,status"),
    @Index(name = "idx_entrega_restaurante", columnList = "restaurante_id")
})
public class Pedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "restaurante_id", nullable = false)
    private Restaurante restaurante;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "motoboy_id")
    private Motoboy motoboy;
    @Column(nullable = false, length = 500)
    private String descricaoConteudo;
    @Column(nullable = false)
    private String nomeDestinatario;
    @Column(nullable = false, length = 500, updatable = false)
    private String enderecoRetirada;
    @Column(nullable = false, length = 500)
    private String enderecoEntrega;
    @Column(length = 500)
    private String referenciaEntrega;
    @Column(length = 1000)
    private String observacoes;
    @Column(nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    private LocalDateTime dataAceitacao;

    private LocalDateTime dataConclusao;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusEntrega status;
    public Long getId() { return id; }
    public Restaurante getRestaurante() { return restaurante; }
    public void setRestaurante(Restaurante restaurante) { this.restaurante = restaurante; }
    public Motoboy getMotoboy() { return motoboy; }
    public void setMotoboy(Motoboy motoboy) { this.motoboy = motoboy; }
    public String getDescricaoConteudo() { return descricaoConteudo; }
    public void setDescricaoConteudo(String descricaoConteudo) { this.descricaoConteudo = descricaoConteudo; }
    public String getNomeDestinatario() { return nomeDestinatario; }
    public void setNomeDestinatario(String nomeDestinatario) { this.nomeDestinatario = nomeDestinatario; }
    public String getEnderecoRetirada() { return enderecoRetirada; }
    public void setEnderecoRetirada(String enderecoRetirada) { this.enderecoRetirada = enderecoRetirada; }
    public String getEnderecoEntrega() { return enderecoEntrega; }
    public void setEnderecoEntrega(String enderecoEntrega) { this.enderecoEntrega = enderecoEntrega; }
    public String getReferenciaEntrega() { return referenciaEntrega; }
    public void setReferenciaEntrega(String referenciaEntrega) { this.referenciaEntrega = referenciaEntrega; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }
    public LocalDateTime getDataAceitacao() { return dataAceitacao; }
    public void setDataAceitacao(LocalDateTime dataAceitacao) { this.dataAceitacao = dataAceitacao; }
    public LocalDateTime getDataConclusao() { return dataConclusao; }
    public void setDataConclusao(LocalDateTime dataConclusao) { this.dataConclusao = dataConclusao; }
    public StatusEntrega getStatus() { return status; }
    public void setStatus(StatusEntrega status) { this.status = status; }
}
