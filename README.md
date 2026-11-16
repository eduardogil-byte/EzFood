# EzFood — API REST de gerenciamento de pedidos

## Trabalho Prático do 3º Trimestre

**Integrantes:** [preencher nomes completos]

O EzFood gerencia clientes, restaurantes e pedidos. O backend usa arquitetura em camadas e retorna DTOs JSON. Não inclui frontend, autenticação, cardápio ou itens de pedido: `valorProdutos` é o valor agregado informado na criação.

## Tecnologias e estrutura

- Java 17; Spring Boot 4.1.1 (versão declarada no `pom.xml`).
- Maven Wrapper 3.9.16, Spring Web MVC, Data JPA/Hibernate, Jakarta Validation, H2 e DevTools.
- JUnit Jupiter, Spring Boot Test e MockMvc para testes.

```text
src/main/java/com/example/ezfood/
├── controller/   # ClienteController, RestauranteController, PedidoController
├── service/      # CRUD e regras de negócio
├── repository/   # JpaRepository e consultas findBy
├── entity/       # Cliente, Restaurante, Pedido, StatusPedido
├── dto/          # Contratos de entrada e saída
├── exception/    # GlobalExceptionHandler (@RestControllerAdvice)
└── EzFoodApplication.java
src/main/resources/application.properties
src/test/java/com/example/ezfood/
```

## Entidades e relacionamentos

- **Cliente:** id, nome, e-mail único, data de cadastro e ativo.
- **Restaurante:** id, nome, CNPJ único, categoria, aberto e taxa de entrega.
- **Pedido:** id, cliente, restaurante, data, valor dos produtos, total e status.

Cliente e restaurante possuem `@OneToMany(mappedBy = ...)` para pedidos. Pedido é a entidade central, com dois `@ManyToOne` e chaves estrangeiras obrigatórias. IDs são `Long`, gerados pelo banco. Status é persistido como texto. Todos os repositories estendem `JpaRepository`.

Não há exclusão em cascata. Cliente/restaurante com qualquer pedido vinculado, inclusive cancelado ou entregue, não pode ser excluído.

## Quatro regras de negócio

1. **RN1 — Disponibilidade:** só cria pedido para cliente ativo e restaurante aberto.
2. **RN2 — Limite:** no máximo três pedidos ativos por cliente. Ativos: `CRIADO`, `PREPARANDO`, `SAIU_PARA_ENTREGA`. Entregues/cancelados liberam vaga. A criação bloqueia a linha do cliente durante a transação para serializar criações simultâneas.
3. **RN3 — Dados automáticos:** data/hora do servidor, status inicial `CRIADO` e `valorTotal = valorProdutos + taxaEntrega`, usando `BigDecimal`.
4. **RN4 — Cancelamento:** somente em `CRIADO`, até dez minutos após a criação, inclusive no instante exato do limite. Após esse instante, retorna 409.

Fluxo obrigatório:

```text
CRIADO -> PREPARANDO -> SAIU_PARA_ENTREGA -> ENTREGUE
CRIADO -> CANCELADO (até dez minutos)
```

Não permite saltar, retroceder ou repetir status. `ENTREGUE` e `CANCELADO` são finais. Alterações de status bloqueiam o pedido durante a transação. Fechar restaurante não cancela pedidos já criados.

## Como executar

Pré-requisito: JDK 17 ou superior com `JAVA_HOME` apontando para o JDK e seu diretório `bin` no PATH. A primeira execução do wrapper precisa acessar os repositórios Maven para baixar a distribuição e dependências.

Windows/PowerShell:

```powershell
java -version
.\mvnw.cmd clean verify
.\mvnw.cmd spring-boot:run
```

Linux/macOS:

```bash
java -version
./mvnw clean verify
./mvnw spring-boot:run
```

API: `http://localhost:8080`. As rotas não possuem prefixo `/api`.

## H2

- Console: `http://localhost:8080/h2-console`.
- JDBC URL: `jdbc:h2:mem:ifood`.
- Usuário: `sa`.
- Senha: vazia.
- `spring.jpa.hibernate.ddl-auto=update`; SQL habilitado no console.

O banco é em memória e os dados são perdidos ao encerrar a aplicação. Não há carga inicial. Cadastre cliente e restaurante antes de criar pedidos. O banco de testes é separado (`ezfood-tests`) e usa `create-drop`.

## Endpoints completos

Use `Content-Type: application/json` em POST, PUT e PATCH. GET e DELETE não recebem corpo. `{id}` é um inteiro `Long`.

| Método | URL | Operação | Entrada | Saída | Sucesso |
|---|---|---|---|---|---|
| POST | `/clientes` | Cadastrar | ClienteRequestDTO | ClienteResponseDTO | 201 |
| GET | `/clientes` | Listar | — | ClienteResponseDTO[] | 200 |
| GET | `/clientes/busca?nome=Ana` | Buscar por nome | Query nome obrigatória | ClienteResponseDTO[] | 200 |
| GET | `/clientes/{id}` | Consultar | ID | ClienteResponseDTO | 200 |
| PUT | `/clientes/{id}` | Atualizar nome/e-mail | ID + ClienteRequestDTO | ClienteResponseDTO | 200 |
| DELETE | `/clientes/{id}` | Excluir sem pedidos | ID | Sem corpo | 204 |
| GET | `/clientes/{id}/pedidos` | Pedidos do cliente | ID | PedidoResponseDTO[] | 200 |
| POST | `/restaurantes` | Cadastrar | RestauranteRequestDTO | RestauranteResponseDTO | 201 |
| GET | `/restaurantes` | Listar | — | RestauranteResponseDTO[] | 200 |
| GET | `/restaurantes/busca?nome=Burgers` | Buscar por nome | Query nome obrigatória | RestauranteResponseDTO[] | 200 |
| GET | `/restaurantes/{id}` | Consultar | ID | RestauranteResponseDTO | 200 |
| PUT | `/restaurantes/{id}` | Atualizar | ID + RestauranteRequestDTO | RestauranteResponseDTO | 200 |
| DELETE | `/restaurantes/{id}` | Excluir sem pedidos | ID | Sem corpo | 204 |
| GET | `/restaurantes/{id}/pedidos` | Pedidos do restaurante | ID | PedidoResponseDTO[] | 200 |
| POST | `/pedidos` | Criar | PedidoRequestDTO | PedidoResponseDTO | 201 |
| GET | `/pedidos` | Listar | — | PedidoResponseDTO[] | 200 |
| GET | `/pedidos/{id}` | Consultar | ID | PedidoResponseDTO | 200 |
| PATCH | `/pedidos/{id}/status` | Avançar ou cancelar | ID + StatusPedidoRequestDTO | PedidoResponseDTO | 200 |

Listagens retornam arrays sem paginação e sem ordem garantida. Busca por nome é parcial e ignora maiúsculas/minúsculas. Sem resultados, retorna `200 []`. Nas consultas de pedidos por relacionamento, um cliente/restaurante inexistente também retorna `200 []`, preservando o comportamento original.

Não existem edição geral/exclusão de pedido nem filtros por status/período. Categoria é texto livre. Cliente é criado ativo; o contrato atual não oferece alteração de `ativo`.

## Contratos JSON para o frontend

Exemplos de IDs/datas ilustrativos. Use os IDs efetivamente retornados pelos cadastros. Propriedades extras não fazem parte do contrato; envie apenas os campos documentados.

### Cliente — POST e PUT

`ClienteRequestDTO`:

```json
{
  "nome": "Ana Silva",
  "email": "ana@example.com"
}
```

- `nome`: string obrigatória, não vazia, máximo 255 caracteres.
- `email`: string obrigatória, e-mail válido, máximo 255 caracteres, único.
- Espaços nas extremidades são removidos; e-mail é convertido para minúsculas antes da validação/persistência.
- PUT exige nome e e-mail; não altera data nem atividade.

`ClienteResponseDTO` — retornado em POST, PUT e GET individual; as listagens retornam arrays deste objeto:

```json
{
  "id": 1,
  "nome": "Ana Silva",
  "email": "ana@example.com",
  "dataCadastro": "2026-11-16",
  "ativo": true
}
```

`id`: inteiro; `dataCadastro`: data ISO `YYYY-MM-DD` gerada pelo servidor; `ativo`: booleano, inicialmente true.

### Restaurante — POST e PUT

`RestauranteRequestDTO`:

```json
{
  "nome": "EzFood Burgers",
  "cnpj": "12345678000190",
  "categoria": "Hamburgueria",
  "aberto": true,
  "taxaEntrega": 6.50
}
```

- `nome`, `cnpj`, `categoria`: strings obrigatórias, não vazias, máximo 255 caracteres; espaços nas extremidades removidos.
- `cnpj`: único após remover pontos, barra e hífens; é retornado e persistido sem essa pontuação. Assim, `12.345.678/0001-90` e `12345678000190` são tratados como o mesmo valor. Não há validação de dígitos verificadores.
- `aberto`: booleano obrigatório; omissão ou null retorna 400. Envie false explicitamente para fechar.
- `taxaEntrega`: número obrigatório, mínimo zero, até dez dígitos inteiros e duas casas decimais.
- PUT exige o objeto completo, inclusive para apenas abrir/fechar.

`RestauranteResponseDTO`:

```json
{
  "id": 1,
  "nome": "EzFood Burgers",
  "cnpj": "12345678000190",
  "categoria": "Hamburgueria",
  "aberto": true,
  "taxaEntrega": 6.50
}
```

### Pedido — POST

`PedidoRequestDTO`:

```json
{
  "clienteId": 1,
  "restauranteId": 1,
  "valorProdutos": 39.90
}
```

- `clienteId`, `restauranteId`: inteiros positivos obrigatórios e existentes.
- `valorProdutos`: número obrigatório, mínimo 0.01, até dez dígitos inteiros e duas casas decimais.
- Não enviar data, total ou status; são definidos pelo Service.

`PedidoResponseDTO` — POST, GET individual e PATCH; listagens e relacionamentos retornam arrays deste objeto:

```json
{
  "id": 1,
  "clienteId": 1,
  "clienteNome": "Ana Silva",
  "restauranteId": 1,
  "restauranteNome": "EzFood Burgers",
  "dataPedido": "2026-11-16T14:30:00",
  "valorProdutos": 39.90,
  "valorTotal": 46.40,
  "status": "CRIADO"
}
```

IDs são inteiros, nomes são strings, valores são números JSON e `status` é string. `dataPedido` é data/hora ISO local do servidor, sem offset. Frações de segundo podem existir. Não dependa de duas casas na representação textual JSON: formate valores no frontend. Os nomes são os nomes atuais das entidades relacionadas. A taxa de entrega não é um campo separado da resposta do pedido; o total calculado fica armazenado.

### Status — PATCH `/pedidos/{id}/status`

`StatusPedidoRequestDTO`:

```json
{
  "status": "PREPARANDO"
}
```

Para cancelar:

```json
{
  "status": "CANCELADO"
}
```

Enum `StatusPedido`, obrigatório e com grafia exata:

```text
CRIADO
PREPARANDO
SAIU_PARA_ENTREGA
ENTREGUE
CANCELADO
```

A resposta é o pedido completo com o status atualizado (200). Um enum válido pode retornar 409 quando não respeitar o fluxo.

## Status HTTP e erros

- **200:** consulta ou atualização.
- **201:** cadastro.
- **204:** exclusão, corpo vazio; não chamar `response.json()` nesse retorno.
- **400:** DTO inválido, JSON inválido, enum desconhecido, ID não numérico, parâmetro obrigatório ausente ou duplicidade detectada no Service.
- **404:** entidade individual não encontrada ou rota inexistente tratada pelo MVC.
- **409:** regra de negócio, integridade do banco ou conflito de bloqueio concorrente.

Duplicidade detectada antecipadamente continua retornando 400 para preservar o contrato. Uma violação da restrição única no banco, inclusive em corrida concorrente, retorna 409.

Formato dos erros tratados pelo advice:

```json
{
  "dataHora": "2026-11-16T14:31:00",
  "status": 409,
  "erro": "Conflict",
  "mensagem": "Restaurante fechado. Pedido não permitido."
}
```

Validações concatenam `campo: mensagem` em `mensagem`. Não dependa do idioma/texto exato das mensagens padrão de Bean Validation. Erros de outros protocolos, como 405/415, continuam sob o tratamento padrão do Spring.

## Testes automatizados

```powershell
.\mvnw.cmd clean verify
```

- `EzFoodApplicationTests`: carregamento do contexto.
- `EzFoodApiTests`: contexto Spring real, controllers via MockMvc, services, repositories e H2 separados do banco de desenvolvimento.
- Cobertura: cadastros, CRUD base, duplicidade em cadastro/atualização, obrigatoriedade, e-mail, texto, valores monetários, aberto ausente/null, IDs, JSON e enum inválidos, consultas, disponibilidade, limite de três ativos, liberação de vaga, cálculo e campos automáticos, cancelamento, transições, exclusão vinculada e HTTP 200/201/204/400/404/409.
- O relógio de pedidos é injetável (`Clock`). Os testes fixam o instante e ajustam a data persistida para testar exatamente dez minutos e dez minutos mais um segundo. Não esperam dez minutos.
- Os bloqueios concorrentes foram implementados, mas a suíte não substitui teste de carga/concorrência.

**Resultado neste workspace:** compilação e testes não executados: `java`, `javac` e `mvn` não foram encontrados no PATH, `JAVA_HOME` está vazio e não foi localizado JDK nos diretórios usuais verificados. Nenhuma ferramenta foi instalada. O wrapper não substitui o JDK. A resolução das versões Maven/dependências também precisa ser confirmada em ambiente com JDK. Não há declaração de testes aprovados.

## Integração futura com React + Tailwind e Vite

Nenhum frontend foi criado. O backend não configura CORS. Para desenvolvimento, configure no futuro projeto Vite um proxy de mesma origem para `localhost:8080`:

```js
// Trecho de server a incorporar no vite.config.js do futuro frontend.
server: {
  proxy: {
    '/clientes': 'http://localhost:8080',
    '/restaurantes': 'http://localhost:8080',
    '/pedidos': 'http://localhost:8080'
  }
}
```

No React, use caminhos relativos, por exemplo `fetch('/clientes')`. Para POST/PUT/PATCH, envie JSON com `Content-Type: application/json`. Confira `response.ok`, trate o objeto de erro e não tente ler JSON em 204. Não acrescente `/api`: esse prefixo não existe no backend.

O proxy vale apenas para o servidor de desenvolvimento do Vite. Na publicação, servir frontend/API sob a mesma origem com encaminhamento das rotas, ou definir uma política CORS explícita se forem origens distintas. Tailwind não interfere no contrato HTTP.

## Antes da entrega

- Preencher integrantes.
- Executar `clean verify` em ambiente com JDK e registrar o resultado real.
- Subir a aplicação, conferir o H2 e exercitar o fluxo com IDs retornados pelos cadastros.
