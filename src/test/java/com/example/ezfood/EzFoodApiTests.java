package com.example.ezfood;

import com.example.ezfood.dto.*;
import com.example.ezfood.entity.StatusEntrega;
import com.example.ezfood.repository.*;
import com.example.ezfood.service.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.*;
import org.springframework.context.annotation.*;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.*;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:ezfood-tests;DB_CLOSE_DELAY=-1;LOCK_TIMEOUT=10000",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.show-sql=false",
        "spring.jpa.open-in-view=false"
})
@Import(EzFoodApiTests.Tempo.class)
class EzFoodApiTests {
    @TestConfiguration(proxyBeanMethods = false)
    static class Tempo {
        @Bean @Primary
        Clock testClock() {
            return Clock.fixed(Instant.parse("2026-11-17T15:00:00Z"), ZoneOffset.UTC);
        }
    }

    @Autowired WebApplicationContext context;
    @Autowired PedidoRepository pedidos;
    @Autowired MotoboyRepository motoboys;
    @Autowired RestauranteRepository restaurantes;
    @Autowired RestauranteService restauranteService;
    @Autowired MotoboyService motoboyService;
    @Autowired PedidoService entregas;
    @Autowired Clock clock;

    MockMvc mvc;
    Long restauranteId;
    Long motoboyId;

    @BeforeEach
    void preparar() {
        mvc = MockMvcBuilders.webAppContextSetup(context).build();
        pedidos.deleteAll();
        motoboys.deleteAll();
        restaurantes.deleteAll();
        restauranteId = restauranteService.cadastrar(restaurante(true, "Rua A, 10")).id();
        motoboyId = cadastrarMotoboy("ana@example.com", true, true);
    }

    RestauranteRequestDTO restaurante(boolean ativo, String endereco) {
        return new RestauranteRequestDTO("Burgers", "12345678000190", "Hamburgueria", endereco, ativo);
    }

    Long cadastrarMotoboy(String email, boolean ativo, boolean disponivel) {
        return motoboyService.cadastrar(new MotoboyRequestDTO(
                "Ana", "11999999999", email, ativo, disponivel)).id();
    }

    EntregaResponseDTO criarEntrega() {
        return entregas.cadastrar(new EntregaRequestDTO(restauranteId,
                "Duas marmitas", "João", "Rua B, 20", null, "Portaria"));
    }

    ResultActions postJson(String url, String json) throws Exception {
        return mvc.perform(post(url).contentType(MediaType.APPLICATION_JSON).content(json));
    }

    ResultActions patchJson(String url, String json) throws Exception {
        return mvc.perform(patch(url).contentType(MediaType.APPLICATION_JSON).content(json));
    }

    ResultActions aceitar(Long entrega, Long motoboy) throws Exception {
        return patchJson("/entregas/" + entrega + "/aceitar", "{\"motoboyId\":" + motoboy + "}");
    }

    ResultActions alterarStatus(Long id, StatusEntrega novo) throws Exception {
        return patchJson("/entregas/" + id + "/status", "{\"status\":\"" + novo + "\"}");
    }

    @Test
    void cadastrarRestaurante() throws Exception {
        postJson("/restaurantes", """
                {"nome":"Pizza","cnpj":"98.765.432/0001-10","categoria":"Pizzaria",
                 "enderecoRetirada":"Rua C, 30","ativo":true}
                """).andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.cnpj").value("98765432000110"))
                .andExpect(jsonPath("$.enderecoRetirada").value("Rua C, 30"));
    }

    @Test
    void cadastrarMotoboy() throws Exception {
        postJson("/motoboys", """
                {"nome":"Beto","telefone":"11988888888","email":" BETO@example.com ",
                 "ativo":true,"disponivel":true}
                """).andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("beto@example.com"))
                .andExpect(jsonPath("$.dataCadastro").value(LocalDateTime.now(clock).toString() + ":00"));
    }

    @Test
    void criarEntregaComDadosAutomaticos() throws Exception {
        postJson("/entregas", """
                {"restauranteId":%d,"descricaoConteudo":"Marmitas","nomeDestinatario":"João",
                 "enderecoEntrega":"Rua B, 20","status":"ENTREGUE","motoboyId":%d,
                 "dataCriacao":"2000-01-01T00:00:00","dataAceitacao":"2000-01-01T00:00:00",
                 "dataConclusao":"2000-01-01T00:00:00"}
                """.formatted(restauranteId, motoboyId))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("DISPONIVEL"))
                .andExpect(jsonPath("$.enderecoRetirada").value("Rua A, 10"))
                .andExpect(jsonPath("$.motoboyId").isEmpty())
                .andExpect(jsonPath("$.dataAceitacao").isEmpty())
                .andExpect(jsonPath("$.dataConclusao").isEmpty())
                .andExpect(jsonPath("$.dataCriacao").value("2026-11-17T15:00:00"));
    }

    @Test
    void restauranteInativoNaoCriaEntrega() throws Exception {
        restauranteService.atualizar(restauranteId, restaurante(false, "Rua A, 10"));
        postJson("/entregas", """
                {"restauranteId":%d,"descricaoConteudo":"Marmitas",
                 "nomeDestinatario":"João","enderecoEntrega":"Rua B, 20"}
                """.formatted(restauranteId)).andExpect(status().isConflict());
        assertThat(pedidos.count()).isZero();
    }

    @Test
    void aceitarRetiraDaListaDisponivelEImpedeSegundaAceitacao() throws Exception {
        Long id = criarEntrega().id();
        mvc.perform(get("/entregas/disponiveis")).andExpect(jsonPath("$[0].id").value(id));
        aceitar(id, motoboyId).andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACEITA"))
                .andExpect(jsonPath("$.motoboyId").value(motoboyId))
                .andExpect(jsonPath("$.dataAceitacao").value("2026-11-17T15:00:00"));
        mvc.perform(get("/entregas/disponiveis")).andExpect(content().json("[]"));
        aceitar(id, cadastrarMotoboy("beto@example.com", true, true))
                .andExpect(status().isConflict());
        aceitar(id, motoboyId).andExpect(status().isConflict());
    }

    @ParameterizedTest
    @CsvSource({"false,true", "true,false", "false,false"})
    void somenteMotoboyAtivoDisponivelAceita(boolean ativo, boolean disponivel) throws Exception {
        Long outro = cadastrarMotoboy("outro@example.com", ativo, disponivel);
        aceitar(criarEntrega().id(), outro).andExpect(status().isConflict());
    }

    @Test
    void limiteUmaEntregaEConclusaoLiberaVaga() throws Exception {
        Long primeira = criarEntrega().id();
        Long segunda = criarEntrega().id();
        aceitar(primeira, motoboyId).andExpect(status().isOk());
        aceitar(segunda, motoboyId).andExpect(status().isConflict());
        alterarStatus(primeira, StatusEntrega.RETIRADA).andExpect(status().isOk());
        aceitar(segunda, motoboyId).andExpect(status().isConflict());
        alterarStatus(primeira, StatusEntrega.EM_ROTA).andExpect(status().isOk());
        aceitar(segunda, motoboyId).andExpect(status().isConflict());
        alterarStatus(primeira, StatusEntrega.ENTREGUE).andExpect(status().isOk())
                .andExpect(jsonPath("$.dataConclusao").value("2026-11-17T15:00:00"));
        aceitar(segunda, motoboyId).andExpect(status().isOk());
    }

    static Stream<Arguments> transicoes() {
        return Arrays.stream(StatusEntrega.values()).flatMap(origem ->
                Arrays.stream(StatusEntrega.values()).map(destino -> Arguments.of(origem, destino)));
    }

    @ParameterizedTest
    @MethodSource("transicoes")
    void matrizDeTransicoes(StatusEntrega origem, StatusEntrega destino) throws Exception {
        Long id = criarEntrega().id();
        if (origem == StatusEntrega.CANCELADA) {
            alterarStatus(id, origem).andExpect(status().isOk());
        } else if (origem != StatusEntrega.DISPONIVEL) {
            aceitar(id, motoboyId).andExpect(status().isOk());
            for (StatusEntrega etapa : List.of(StatusEntrega.RETIRADA, StatusEntrega.EM_ROTA, StatusEntrega.ENTREGUE)) {
                if (entregas.buscarPorId(id).status() == origem) break;
                alterarStatus(id, etapa).andExpect(status().isOk());
            }
        }
        boolean permitida = switch (origem) {
            case DISPONIVEL -> destino == StatusEntrega.CANCELADA;
            case ACEITA -> destino == StatusEntrega.RETIRADA;
            case RETIRADA -> destino == StatusEntrega.EM_ROTA;
            case EM_ROTA -> destino == StatusEntrega.ENTREGUE;
            case ENTREGUE, CANCELADA -> false;
        };
        alterarStatus(id, destino).andExpect(permitida ? status().isOk() : status().isConflict());
        assertThat(entregas.buscarPorId(id).status()).isEqualTo(permitida ? destino : origem);
    }

    @Test
    void cancelamentoFinalEDadosHistoricos() throws Exception {
        Long id = criarEntrega().id();
        restauranteService.atualizar(restauranteId, restaurante(true, "Novo endereço"));
        assertThat(entregas.buscarPorId(id).enderecoRetirada()).isEqualTo("Rua A, 10");
        alterarStatus(id, StatusEntrega.CANCELADA).andExpect(status().isOk());
        aceitar(id, motoboyId).andExpect(status().isConflict());
        mvc.perform(delete("/restaurantes/{id}", restauranteId)).andExpect(status().isConflict());
        assertThat(entregas.buscarPorId(id).dataConclusao()).isNull();
    }

    @Test
    void consultasAtualizacoesEExclusao() throws Exception {
        Long id = criarEntrega().id();
        aceitar(id, motoboyId).andExpect(status().isOk());
        for (String url : List.of("/restaurantes", "/motoboys", "/entregas",
                "/restaurantes/" + restauranteId + "/entregas", "/motoboys/" + motoboyId + "/entregas")) {
            mvc.perform(get(url)).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
        }
        for (String url : List.of("/restaurantes/" + restauranteId, "/motoboys/" + motoboyId, "/entregas/" + id)) {
            mvc.perform(get(url)).andExpect(status().isOk()).andExpect(jsonPath("$.id").isNumber());
        }
        patchJson("/motoboys/" + motoboyId + "/disponibilidade", "{\"disponivel\":false}")
                .andExpect(status().isOk()).andExpect(jsonPath("$.disponivel").value(false));
        mvc.perform(put("/motoboys/{id}", motoboyId).contentType(MediaType.APPLICATION_JSON).content("""
                {"nome":"Ana Silva","email":"ana@example.com","telefone":"11999999999",
                 "ativo":true,"disponivel":true}
                """)).andExpect(status().isOk()).andExpect(jsonPath("$.nome").value("Ana Silva"));
        mvc.perform(put("/restaurantes/{id}", restauranteId).contentType(MediaType.APPLICATION_JSON).content("""
                {"nome":"Burgers","cnpj":"12345678000190","categoria":"Hamburgueria",
                 "enderecoRetirada":"Rua Nova","ativo":false}
                """)).andExpect(status().isOk()).andExpect(jsonPath("$.ativo").value(false));
        Long semEntregas = restauranteService.cadastrar(new RestauranteRequestDTO(
                "Pizza", "98765432000110", "Pizzaria", "Rua C", true)).id();
        mvc.perform(delete("/restaurantes/{id}", semEntregas)).andExpect(status().isNoContent());
        mvc.perform(get("/restaurantes/{id}", semEntregas)).andExpect(status().isNotFound());
    }

    @ParameterizedTest
    @CsvSource({
            "/restaurantes,{}", "/motoboys,{}", "/entregas,{}",
            "/motoboys,'{\"nome\":\"Ana\",\"telefone\":\"1\",\"email\":\"invalido\",\"ativo\":true,\"disponivel\":true}'",
            "/entregas,'{\"restauranteId\":-1,\"descricaoConteudo\":\" \",\"nomeDestinatario\":\"João\",\"enderecoEntrega\":\"Rua B\"}'"
    })
    void dtoInvalidoRetorna400(String url, String json) throws Exception {
        postJson(url, json).andExpect(status().isBadRequest()).andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void errosHttpEDuplicidades() throws Exception {
        postJson("/motoboys", """
                {"nome":"Ana","telefone":"1","email":"ANA@example.com","ativo":true,"disponivel":true}
                """).andExpect(status().isConflict());
        postJson("/restaurantes", """
                {"nome":"Burgers","cnpj":"12.345.678/0001-90","categoria":"Hamburgueria",
                 "enderecoRetirada":"Rua A","ativo":true}
                """).andExpect(status().isConflict());
        for (String url : List.of("/restaurantes/999999", "/motoboys/999999", "/entregas/999999",
                "/restaurantes/999999/entregas", "/motoboys/999999/entregas", "/rota-inexistente")) {
            mvc.perform(get(url)).andExpect(status().isNotFound()).andExpect(jsonPath("$.status").value(404));
        }
        Long id = criarEntrega().id();
        aceitar(999999L, motoboyId).andExpect(status().isNotFound());
        aceitar(id, 999999L).andExpect(status().isNotFound());
        patchJson("/entregas/" + id + "/aceitar", "{}").andExpect(status().isBadRequest());
        patchJson("/entregas/" + id + "/aceitar", "{\"motoboyId\":0}").andExpect(status().isBadRequest());
        patchJson("/entregas/" + id + "/status", "{\"status\":\"INEXISTENTE\"}").andExpect(status().isBadRequest());
        patchJson("/entregas/" + id + "/status", "{}").andExpect(status().isBadRequest());
        patchJson("/motoboys/" + motoboyId + "/disponibilidade", "{}").andExpect(status().isBadRequest());
        mvc.perform(get("/entregas/abc")).andExpect(status().isBadRequest());
        postJson("/entregas", "{").andExpect(status().isBadRequest());
    }

    @RepeatedTest(3)
    void concorrenciaNaMesmaEntregaRetorna200E409() throws Exception {
        Long id = criarEntrega().id();
        Long outro = cadastrarMotoboy("outro@example.com", true, true);
        assertThat(aceitarSimultaneamente(id, motoboyId, id, outro)).containsExactlyInAnyOrder(200, 409);
        EntregaResponseDTO resultado = entregas.buscarPorId(id);
        assertThat(resultado.status()).isEqualTo(StatusEntrega.ACEITA);
        assertThat(resultado.motoboyId()).isIn(motoboyId, outro);
        assertThat(resultado.dataAceitacao()).isEqualTo(LocalDateTime.now(clock));
    }

    @RepeatedTest(3)
    void concorrenciaMesmoMotoboyEmEntregasDiferentes() throws Exception {
        Long primeira = criarEntrega().id();
        Long segunda = criarEntrega().id();
        assertThat(aceitarSimultaneamente(primeira, motoboyId, segunda, motoboyId))
                .containsExactlyInAnyOrder(200, 409);
        assertThat(entregas.listarPorMotoboy(motoboyId)).hasSize(1);
        assertThat(entregas.listarDisponiveis()).hasSize(1);
    }

    List<Integer> aceitarSimultaneamente(Long primeira, Long primeiroMotoboy,
                                        Long segunda, Long segundoMotoboy) throws Exception {
        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch prontas = new CountDownLatch(2);
        CountDownLatch iniciar = new CountDownLatch(1);
        try {
            Future<Integer> a = executor.submit(() -> executarAceitacao(prontas, iniciar, primeira, primeiroMotoboy));
            Future<Integer> b = executor.submit(() -> executarAceitacao(prontas, iniciar, segunda, segundoMotoboy));
            assertThat(prontas.await(5, TimeUnit.SECONDS)).isTrue();
            iniciar.countDown();
            return List.of(a.get(20, TimeUnit.SECONDS), b.get(20, TimeUnit.SECONDS));
        } finally {
            iniciar.countDown();
            executor.shutdownNow();
            assertThat(executor.awaitTermination(5, TimeUnit.SECONDS)).isTrue();
        }
    }

    int executarAceitacao(CountDownLatch prontas, CountDownLatch iniciar, Long id, Long motoboy) throws Exception {
        prontas.countDown();
        if (!iniciar.await(5, TimeUnit.SECONDS)) throw new IllegalStateException("Tempo de início excedido");
        return aceitar(id, motoboy).andReturn().getResponse().getStatus();
    }
}
