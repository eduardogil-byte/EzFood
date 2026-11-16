package com.example.ezfood;

import com.example.ezfood.dto.*;
import com.example.ezfood.entity.Pedido;
import com.example.ezfood.repository.*;
import com.example.ezfood.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:ezfood-tests;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.show-sql=false"
})
@Import(EzFoodApiTests.Tempo.class)
class EzFoodApiTests {

    @TestConfiguration(proxyBeanMethods = false)
    static class Tempo {
        @Bean
        @Primary
        Clock testClock() {
            return Clock.fixed(Instant.parse("2026-11-16T15:00:00Z"), ZoneOffset.UTC);
        }
    }

    @Autowired WebApplicationContext context;
    @Autowired ClienteRepository clientes;
    @Autowired RestauranteRepository restaurantes;
    @Autowired PedidoRepository pedidos;
    @Autowired ClienteService clienteService;
    @Autowired RestauranteService restauranteService;
    @Autowired PedidoService pedidoService;
    @Autowired Clock clock;

    MockMvc mvc;
    Long clienteId;
    Long restauranteId;

    @BeforeEach
    void preparar() {
        mvc = MockMvcBuilders.webAppContextSetup(context).build();
        pedidos.deleteAll();
        clientes.deleteAll();
        restaurantes.deleteAll();
        clienteId = clienteService.cadastrar(new ClienteRequestDTO("Ana", "ana@example.com")).id();
        restauranteId = restauranteService.cadastrar(new RestauranteRequestDTO(
                "Burgers", "12345678000190", "Hamburgueria", true, new BigDecimal("6.50"))).id();
    }

    ResultActions postJson(String url, String json) throws Exception {
        return mvc.perform(post(url).contentType(MediaType.APPLICATION_JSON).content(json));
    }

    ResultActions alterarStatus(Long id, String status) throws Exception {
        return mvc.perform(patch("/pedidos/{id}/status", id)
                .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"" + status + "\"}"));
    }

    String novoPedido() {
        return "{\"clienteId\":%d,\"restauranteId\":%d,\"valorProdutos\":39.90}"
                .formatted(clienteId, restauranteId);
    }

    Long criarPedido() {
        return pedidoService.cadastrar(new PedidoRequestDTO(
                clienteId, restauranteId, new BigDecimal("39.90"))).id();
    }

    @Test
    void cadastroDeClienteNormalizaEmailEDefineCamposAutomaticos() throws Exception {
        postJson("/clientes", "{\"nome\":\" Bruno \",\"email\":\" BRUNO@EXAMPLE.COM \"}")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.nome").value("Bruno"))
                .andExpect(jsonPath("$.email").value("bruno@example.com"))
                .andExpect(jsonPath("$.dataCadastro").isString())
                .andExpect(jsonPath("$.ativo").value(true));
    }

    @Test
    void cadastroDeRestaurante() throws Exception {
        postJson("/restaurantes", """
                {"nome":"Pizza","cnpj":"98765432000100","categoria":"Pizzaria",
                 "aberto":false,"taxaEntrega":0}
                """)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.aberto").value(false))
                .andExpect(jsonPath("$.taxaEntrega").value(0));
    }

    @Test
    void duplicidadesNoCadastroEAtualizacao() throws Exception {
        postJson("/clientes", "{\"nome\":\"Outra\",\"email\":\"ANA@EXAMPLE.COM\"}")
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.status").value(400));
        postJson("/restaurantes", """
                {"nome":"Outro","cnpj":"12345678000190","categoria":"Teste",
                 "aberto":true,"taxaEntrega":0}
                """).andExpect(status().isBadRequest());
        postJson("/restaurantes", """
                {"nome":"Outro","cnpj":"12.345.678/0001-90","categoria":"Teste",
                 "aberto":true,"taxaEntrega":0}
                """).andExpect(status().isBadRequest());
        Long outroCliente = clienteService.cadastrar(new ClienteRequestDTO("Bia", "bia@example.com")).id();
        mvc.perform(put("/clientes/{id}", outroCliente).contentType(MediaType.APPLICATION_JSON)
                .content("{\"nome\":\"Bia\",\"email\":\"ana@example.com\"}"))
                .andExpect(status().isBadRequest());
        Long outroRestaurante = restauranteService.cadastrar(new RestauranteRequestDTO(
                "Pizza", "98765432000100", "Pizza", true, BigDecimal.ZERO)).id();
        mvc.perform(put("/restaurantes/{id}", outroRestaurante).contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"nome":"Pizza","cnpj":"12345678000190","categoria":"Pizza",
                         "aberto":true,"taxaEntrega":0}
                        """))
                .andExpect(status().isBadRequest());
    }

    @ParameterizedTest
    @ValueSource(strings = {"{}", "{\"nome\":\" \",\"email\":\"ana@example.com\"}",
            "{\"nome\":\"Ana\",\"email\":\"invalido\"}", "{\"nome\":\"Ana\",\"email\":null}"})
    void validaCliente(String json) throws Exception {
        postJson("/clientes", json).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.dataHora").isString())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.erro").value("Bad Request"))
                .andExpect(jsonPath("$.mensagem").isNotEmpty());
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "{}",
            "{\"nome\":\"R\",\"cnpj\":\"1\",\"categoria\":\"C\",\"taxaEntrega\":0}",
            "{\"nome\":\"R\",\"cnpj\":\"1\",\"categoria\":\"C\",\"aberto\":null,\"taxaEntrega\":0}",
            "{\"nome\":\"R\",\"cnpj\":\"1\",\"categoria\":\"C\",\"aberto\":true,\"taxaEntrega\":-1}",
            "{\"nome\":\"R\",\"cnpj\":\"1\",\"categoria\":\"C\",\"aberto\":true,\"taxaEntrega\":1.001}",
            "{\"nome\":\"R\",\"cnpj\":\" \",\"categoria\":\"C\",\"aberto\":true,\"taxaEntrega\":0}",
            "{\"nome\":\"R\",\"cnpj\":\"1\",\"categoria\":\" \",\"aberto\":true,\"taxaEntrega\":0}"})
    void validaRestauranteIncluindoAbertoObrigatorio(String json) throws Exception {
        postJson("/restaurantes", json).andExpect(status().isBadRequest());
    }

    @Test
    void rejeitaTextoEValoresMonetariosAcimaDoLimite() throws Exception {
        postJson("/clientes", "{\"nome\":\"" + "a".repeat(256) + "\",\"email\":\"x@example.com\"}")
                .andExpect(status().isBadRequest());
        postJson("/pedidos", novoPedido().replace("39.90", "10000000000.00"))
                .andExpect(status().isBadRequest());
    }

    @ParameterizedTest
    @ValueSource(strings = {"0", "-1", "0.001", "1.001", "null"})
    void validaValorDoPedido(String valor) throws Exception {
        postJson("/pedidos", novoPedido().replace("39.90", valor)).andExpect(status().isBadRequest());
    }

    @Test
    void validaIdsEStatusObrigatorios() throws Exception {
        postJson("/pedidos", "{}").andExpect(status().isBadRequest());
        postJson("/pedidos", novoPedido().replace("\"clienteId\":" + clienteId, "\"clienteId\":0"))
                .andExpect(status().isBadRequest());
        Long id = criarPedido();
        mvc.perform(patch("/pedidos/{id}/status", id).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest());
        alterarStatus(id, "DESCONHECIDO").andExpect(status().isBadRequest());
        postJson("/clientes", "{").andExpect(status().isBadRequest());
    }

    @Test
    void calculaTotalEInicializaDataEStatus() throws Exception {
        postJson("/pedidos", novoPedido()).andExpect(status().isCreated())
                .andExpect(jsonPath("$.clienteId").value(clienteId.intValue()))
                .andExpect(jsonPath("$.restauranteId").value(restauranteId.intValue()))
                .andExpect(jsonPath("$.clienteNome").value("Ana"))
                .andExpect(jsonPath("$.restauranteNome").value("Burgers"))
                .andExpect(jsonPath("$.status").value("CRIADO"))
                .andExpect(jsonPath("$.valorProdutos").value(39.90))
                .andExpect(jsonPath("$.valorTotal").value(46.40));
        Pedido salvo = pedidos.findAll().get(0);
        assertThat(salvo.getDataPedido()).isEqualTo(LocalDateTime.now(clock));
        assertThat(salvo.getValorTotal()).isEqualByComparingTo("46.40");
    }

    @Test
    void bloqueiaClienteInativoERestauranteFechado() throws Exception {
        var cliente = clientes.findById(clienteId).orElseThrow();
        cliente.setAtivo(false);
        clientes.saveAndFlush(cliente);
        postJson("/pedidos", novoPedido()).andExpect(status().isConflict());
        cliente.setAtivo(true);
        clientes.saveAndFlush(cliente);
        var restaurante = restaurantes.findById(restauranteId).orElseThrow();
        restaurante.setAberto(false);
        restaurantes.saveAndFlush(restaurante);
        postJson("/pedidos", novoPedido()).andExpect(status().isConflict());
        assertThat(pedidos.count()).isZero();
    }

    @Test
    void limitaTresAtivosEReabreVagaAposCancelamento() throws Exception {
        Long primeiro = criarPedido();
        Long segundo = criarPedido();
        alterarStatus(segundo, "PREPARANDO").andExpect(status().isOk());
        alterarStatus(segundo, "SAIU_PARA_ENTREGA").andExpect(status().isOk());
        criarPedido();
        postJson("/pedidos", novoPedido()).andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
        alterarStatus(primeiro, "CANCELADO").andExpect(status().isOk());
        postJson("/pedidos", novoPedido()).andExpect(status().isCreated());
    }

    @Test
    void cancelamentoPermitidoExatamenteAosDezMinutos() throws Exception {
        Long id = criarPedido();
        Pedido pedido = pedidos.findById(id).orElseThrow();
        pedido.setDataPedido(LocalDateTime.now(clock).minusMinutes(10));
        pedidos.saveAndFlush(pedido);
        alterarStatus(id, "CANCELADO").andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELADO"));
        alterarStatus(id, "PREPARANDO").andExpect(status().isConflict());
        alterarStatus(id, "CANCELADO").andExpect(status().isConflict());
    }

    @Test
    void cancelamentoExpiraAposDezMinutos() throws Exception {
        Long id = criarPedido();
        Pedido pedido = pedidos.findById(id).orElseThrow();
        pedido.setDataPedido(LocalDateTime.now(clock).minusMinutes(10).minusSeconds(1));
        pedidos.saveAndFlush(pedido);
        alterarStatus(id, "CANCELADO").andExpect(status().isConflict());
        assertThat(pedidos.findById(id).orElseThrow().getStatus().name()).isEqualTo("CRIADO");
    }

    @Test
    void respeitaFluxoEBloqueiaSaltosRepeticoesRetrocessoECancelamentoTardio() throws Exception {
        Long id = criarPedido();
        alterarStatus(id, "ENTREGUE").andExpect(status().isConflict());
        alterarStatus(id, "CRIADO").andExpect(status().isConflict());
        alterarStatus(id, "PREPARANDO").andExpect(status().isOk());
        alterarStatus(id, "CANCELADO").andExpect(status().isConflict());
        alterarStatus(id, "CRIADO").andExpect(status().isConflict());
        alterarStatus(id, "SAIU_PARA_ENTREGA").andExpect(status().isOk());
        alterarStatus(id, "ENTREGUE").andExpect(status().isOk());
        alterarStatus(id, "PREPARANDO").andExpect(status().isConflict());
        alterarStatus(id, "CANCELADO").andExpect(status().isConflict());
        // ENTREGUE também libera uma vaga no limite de ativos.
        criarPedido();
        criarPedido();
        postJson("/pedidos", novoPedido()).andExpect(status().isCreated());
    }

    @Test
    void bloqueiaExclusaoComPedidosMesmoCancelados() throws Exception {
        Long id = criarPedido();
        alterarStatus(id, "CANCELADO").andExpect(status().isOk());
        mvc.perform(delete("/clientes/{id}", clienteId)).andExpect(status().isConflict());
        mvc.perform(delete("/restaurantes/{id}", restauranteId)).andExpect(status().isConflict());
        assertThat(clientes.existsById(clienteId)).isTrue();
        assertThat(restaurantes.existsById(restauranteId)).isTrue();
    }

    @Test
    void consultaListasNomesERelacionamentos() throws Exception {
        Long id = criarPedido();
        mvc.perform(get("/clientes")).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
        mvc.perform(get("/restaurantes")).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
        mvc.perform(get("/pedidos")).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
        mvc.perform(get("/clientes/{id}", clienteId)).andExpect(status().isOk());
        mvc.perform(get("/restaurantes/{id}", restauranteId)).andExpect(status().isOk());
        mvc.perform(get("/pedidos/{id}", id)).andExpect(status().isOk());
        mvc.perform(get("/clientes/busca").param("nome", "AN"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
        mvc.perform(get("/restaurantes/busca").param("nome", "BURG"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
        mvc.perform(get("/clientes/{id}/pedidos", clienteId))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(id.intValue()));
        mvc.perform(get("/restaurantes/{id}/pedidos", restauranteId))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(id.intValue()));
        mvc.perform(get("/clientes/busca").param("nome", "inexistente"))
                .andExpect(status().isOk()).andExpect(content().json("[]"));
    }

    @Test
    void atualizaEExcluiEntidadesSemPedidos() throws Exception {
        mvc.perform(put("/restaurantes/{id}", restauranteId).contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"nome":"Burgers","cnpj":"12345678000190","categoria":"Hamburgueria",
                         "taxaEntrega":7.50}
                        """))
                .andExpect(status().isBadRequest());
        assertThat(restaurantes.findById(restauranteId).orElseThrow().isAberto()).isTrue();
        mvc.perform(put("/clientes/{id}", clienteId).contentType(MediaType.APPLICATION_JSON)
                .content("{\"nome\":\"Ana Silva\",\"email\":\"ana@example.com\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.nome").value("Ana Silva"));
        mvc.perform(put("/restaurantes/{id}", restauranteId).contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"nome":"Burgers","cnpj":"12345678000190","categoria":"Hamburgueria",
                         "aberto":false,"taxaEntrega":7.50}
                        """))
                .andExpect(status().isOk()).andExpect(jsonPath("$.aberto").value(false));
        mvc.perform(delete("/clientes/{id}", clienteId))
                .andExpect(status().isNoContent()).andExpect(content().string(""));
        mvc.perform(delete("/restaurantes/{id}", restauranteId))
                .andExpect(status().isNoContent()).andExpect(content().string(""));
    }

    @Test
    void padronizaNaoEncontradoEParametrosInvalidos() throws Exception {
        for (String base : new String[]{"/clientes", "/restaurantes", "/pedidos"}) {
            mvc.perform(get(base + "/9223372036854775807"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.status").value(404))
                    .andExpect(jsonPath("$.erro").value("Not Found"))
                    .andExpect(jsonPath("$.mensagem").isNotEmpty());
            mvc.perform(get(base + "/abc")).andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status").value(400));
        }
        mvc.perform(get("/clientes/busca")).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
        mvc.perform(get("/restaurantes/busca")).andExpect(status().isBadRequest());
        postJson("/pedidos", novoPedido().replace("\"clienteId\":" + clienteId,
                "\"clienteId\":9223372036854775807")).andExpect(status().isNotFound());
        postJson("/pedidos", novoPedido().replace("\"restauranteId\":" + restauranteId,
                "\"restauranteId\":9223372036854775807")).andExpect(status().isNotFound());
        alterarStatus(Long.MAX_VALUE, "PREPARANDO").andExpect(status().isNotFound());
        mvc.perform(get("/rota-inexistente")).andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }
}
