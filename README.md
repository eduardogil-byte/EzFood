# EzFood — API REST de gerenciamento de pedidos

## Integrantes

- **[Nome completo do integrante 1]**
- **[Nome completo do integrante 2, se houver]**

## Sobre o projeto

O **EzFood** é uma API REST desenvolvida em Java com Spring Boot para gerenciar **clientes**, **restaurantes** e **pedidos**. O projeto aplica arquitetura em camadas, persistência com JPA/Hibernate, validação de dados por DTOs e tratamento global de exceções.

### Entidades e relacionamentos

- **Cliente:** nome, e-mail único, data de cadastro e situação (ativo/inativo).
- **Restaurante:** nome, CNPJ único, categoria, situação (aberto/fechado) e taxa de entrega.
- **Pedido:** cliente, restaurante, data do pedido, valor dos produtos, valor total e status.

Um cliente pode ter vários pedidos; um restaurante pode receber vários pedidos. Cada pedido pertence a **um cliente** e **um restaurante** (relacionamentos `@ManyToOne`).

### Regras de negócio (implementadas na camada Service)

1. **RN1 — Disponibilidade:** um pedido só pode ser criado quando o cliente estiver ativo e o restaurante estiver aberto.
2. **RN2 — Limite:** um cliente pode ter no máximo **3 pedidos ativos** (`CRIADO`, `PREPARANDO` ou `SAIU_PARA_ENTREGA`).
3. **RN3 — Cálculo automático:** a data do pedido é registrada pelo servidor e o valor total é calculado com **valor dos produtos + taxa de entrega**. O valor total não é enviado pelo cliente.
4. **RN4 — Cancelamento condicionado:** um pedido só pode ser cancelado durante os **primeiros 10 minutos**, enquanto estiver com status `CRIADO`.

O fluxo normal de status é `CRIADO` → `PREPARANDO` → `SAIU_PARA_ENTREGA` → `ENTREGUE`. Pedidos `ENTREGUE` ou `CANCELADO` não podem avançar para outro status.

## Tecnologias

- Java 17
- Spring Boot 4.1.1
- Spring Web MVC
- Spring Data JPA / Hibernate
- Jakarta Bean Validation
- Banco de dados H2 em memória
- Maven (wrapper incluído no repositório)

## Estrutura do projeto

```text
src/main/java/com/example/ezfood/
├── controller/   # Endpoints REST
├── dto/          # Requisições e respostas da API
├── entity/       # Entidades e enum de status
├── exception/    # Tratamento global de erros
├── repository/   # Acesso ao banco com Spring Data JPA
├── service/      # Regras de negócio
└── EzFoodApplication.java
```

## Como executar

**Pré-requisito:** JDK 17 ou superior instalado.

No terminal, na raiz do projeto, execute:

**Windows (PowerShell):**

```powershell
.\mvnw.cmd clean test
.\mvnw.cmd spring-boot:run
```

**Linux/macOS:**

```bash
./mvnw clean test
./mvnw spring-boot:run
```

A API ficará disponível, por padrão, em `http://localhost:8080`.

## Endpoints

| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/clientes` | Cadastrar cliente |
| GET | `/clientes` | Listar clientes |
| GET | `/clientes/{id}` | Consultar cliente |
| GET | `/clientes/busca?nome=Ana` | Pesquisar clientes por nome |
| PUT | `/clientes/{id}` | Atualizar cliente |
| DELETE | `/clientes/{id}` | Excluir cliente, se não possuir pedidos |
| GET | `/clientes/{id}/pedidos` | Listar pedidos de um cliente |
| POST | `/restaurantes` | Cadastrar restaurante |
| GET | `/restaurantes` | Listar restaurantes |
| GET | `/restaurantes/{id}` | Consultar restaurante |
| GET | `/restaurantes/busca?nome=Sabor` | Pesquisar restaurantes por nome |
| PUT | `/restaurantes/{id}` | Atualizar restaurante |
| DELETE | `/restaurantes/{id}` | Excluir restaurante, se não possuir pedidos |
| GET | `/restaurantes/{id}/pedidos` | Listar pedidos de um restaurante |
| POST | `/pedidos` | Criar pedido |
| GET | `/pedidos` | Listar pedidos |
| GET | `/pedidos/{id}` | Consultar pedido |
| PATCH | `/pedidos/{id}/status` | Alterar status do pedido |

## Exemplos de requisições

Use o Postman ou Insomnia com o cabeçalho `Content-Type: application/json`.

### Cadastrar cliente

`POST http://localhost:8080/clientes`

```json
{
  "nome": "Eduardo Gil",
  "email": "eduardo@teste.com"
}
```

### Cadastrar restaurante

`POST http://localhost:8080/restaurantes`

```json
{
  "nome": "EzFood Burgers",
  "cnpj": "12345678000190",
  "categoria": "Hamburgueria",
  "aberto": true,
  "taxaEntrega": 6.50
}
```

### Criar pedido

`POST http://localhost:8080/pedidos`

```json
{
  "clienteId": 1,
  "restauranteId": 1,
  "valorProdutos": 39.90
}
```

Com taxa de entrega de `6.50`, o total calculado será `46.40`. Substitua os IDs de exemplo pelos IDs retornados nos cadastros.

### Atualizar status

`PATCH http://localhost:8080/pedidos/1/status`

```json
{
  "status": "PREPARANDO"
}
```

Os status possíveis são `CRIADO`, `PREPARANDO`, `SAIU_PARA_ENTREGA`, `ENTREGUE` e `CANCELADO`, respeitando as regras de transição.

## Códigos HTTP

- `200 OK`: consulta ou atualização concluída.
- `201 Created`: cadastro realizado.
- `204 No Content`: exclusão realizada.
- `400 Bad Request`: dados inválidos ou duplicidade detectada pela validação do serviço.
- `404 Not Found`: registro não localizado.
- `409 Conflict`: operação bloqueada por regra de negócio ou integridade referencial.

## Banco de dados H2

Com a aplicação em execução, acesse `http://localhost:8080/h2-console` e configure:

- **JDBC URL:** `jdbc:h2:mem:ifood`
- **User Name:** `sa`
- **Password:** deixar em branco

O banco é **em memória**: os registros normalmente são perdidos quando a aplicação é encerrada.

## Testes recomendados

No Postman/Insomnia, verifique pelo menos:

1. Cadastro e consulta de cliente, restaurante e pedido.
2. Impedimento de pedido para restaurante fechado ou cliente inativo.
3. Bloqueio do quarto pedido ativo de um mesmo cliente.
4. Cálculo automático do total e registro automático da data.
5. Cancelamento permitido dentro de 10 minutos e recusado fora do prazo ou em outro status.
6. Rejeição de cadastro com e-mail/CNPJ já usado.
7. Retorno `404` para IDs inexistentes.
8. Bloqueio de exclusão de cliente ou restaurante com pedidos.

> **Antes da entrega:** execute os testes e registre os resultados. Este README descreve o comportamento esperado da implementação e não substitui a validação prática.
