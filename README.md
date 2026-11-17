# EzFood — intermediação de entregas

**Integrantes:** [preencher nomes completos]

O EzFood conecta restaurantes a motoboys cadastrados. O restaurante solicita uma entrega, os motoboys consultam as solicitações disponíveis e o primeiro a aceitar assume a entrega. O restaurante acompanha o andamento até a conclusão. O destinatário não possui conta.

Backend Java 17, Spring Boot 4.1.1, Spring MVC, Spring Data JPA, Bean Validation, Maven e H2. Foram preservados os pacotes `controller`, `dto`, `entity`, `repository`, `service` e `exception`. Não há novas dependências.

## Entidades e relacionamentos

- **Restaurante:** id, nome, CNPJ único, categoria, endereço de retirada e ativo.
- **Motoboy:** id, nome, telefone, e-mail único, ativo, disponível e data/hora de cadastro automática.
- **Entrega:** a entidade e tabela internas `Pedido` foram reaproveitadas. Contém restaurante obrigatório, motoboy opcional até a aceitação, descrição do conteúdo, nome do destinatário, endereços de retirada e entrega, referência e observações opcionais, datas de criação/aceitação/conclusão e status.
- Restaurante e motoboy podem ter várias entregas no histórico; cada entrega pertence a um restaurante e, após aceita, a um motoboy. Os vínculos são `ManyToOne`, sem exclusão em cascata.
- O endereço de retirada é copiado do restaurante na criação para preservar o histórico. Alterar o cadastro não altera entregas anteriores.
- O restaurante com qualquer entrega vinculada não pode ser excluído (409); pode ser desativado por PUT.
- Não há clientes compradores, produtos, cardápio, carrinho, pagamento ou valores de venda.

O status usa `EnumType.STRING`. O banco garante unicidade de CNPJ/e-mail, chaves estrangeiras e campos obrigatórios. Há índices por status, restaurante e motoboy/status.

## Quatro regras de negócio

1. **RN1 — Disponibilidade:** somente restaurante cadastrado e ativo cria entregas. Somente motoboy cadastrado, ativo e disponível aceita. Desativação ou indisponibilidade não cancela entregas em andamento.
2. **RN2 — Limite:** o motoboy pode ter no máximo uma entrega ativa (`ACEITA`, `RETIRADA` ou `EM_ROTA`). A conclusão libera a vaga; a disponibilidade cadastrada continua sendo verificada.
3. **RN3 — Dados automáticos:** o Service gera IDs pelo banco, data/hora de cadastro/criação, status inicial `DISPONIVEL`, data de aceitação e data de conclusão. Esses campos não pertencem aos DTOs de entrada. O relógio `Clock` é injetável; datas são locais do servidor, sem offset.
4. **RN4 — Aceitação exclusiva e transições:** a aceitação ocorre em uma transação com `PESSIMISTIC_WRITE` na entrega e depois no motoboy. O bloqueio da entrega impede dois responsáveis; o bloqueio do motoboy serializa aceitações de entregas diferentes e protege o limite. O perdedor recebe 409. Alterações de status também bloqueiam a entrega. Atualização do cadastro/disponibilidade bloqueia o respectivo registro; criação bloqueia o restaurante para coordenar com desativação/exclusão.

Fluxo obrigatório:

```text
DISPONIVEL -> ACEITA -> RETIRADA -> EM_ROTA -> ENTREGUE
DISPONIVEL -> CANCELADA
```

`ACEITA` só é alcançada pela operação de aceitar, que exige o ID do motoboy. O PATCH de status permite avançar as etapas seguintes ou cancelar quando `DISPONIVEL`. Não permite pular, voltar, repetir etapas, cancelar após aceitar ou alterar estados finais. Não há prazo de dez minutos para cancelamento. `dataConclusao` é preenchida somente em `ENTREGUE`.

## Executar e testar

Requer JDK 17 ou superior. Configure `JAVA_HOME` e PATH. Use Maven instalado ou o wrapper do projeto. A primeira execução requer acesso ao Maven Central.

```powershell
java -version
mvn clean verify
mvn spring-boot:run
```

Com o wrapper no Windows: ` .\mvnw.cmd clean verify` e ` .\mvnw.cmd spring-boot:run`.
No Linux/macOS: `./mvnw clean verify` e `./mvnw spring-boot:run`.

No Windows PowerShell deste ambiente, o wrapper existente falhou ao indexar `Target[0]` de um diretório comum. A validação foi realizada com o Maven 3.8.5 já instalado em cache e JDK 17.0.18, sem alterar as versões do projeto. Se esse erro ocorrer, use o Maven instalado diretamente.

API: `http://localhost:8080`, sem prefixo `/api`.

### H2

Configuração em `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:h2:mem:ifood
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=update
spring.jpa.open-in-view=false
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

Console: `http://localhost:8080/h2-console`, URL JDBC acima, usuário `sa`, senha vazia. O banco é em memória e perde os dados ao encerrar a aplicação. Não há carga inicial.

**Mudança de modelo:** encerre a aplicação antiga e inicie a nova para recriar o H2 em memória. `ddl-auto=update` não é uma migração dos antigos clientes/pedidos: se tiver personalizado a URL para banco persistente, faça backup e uma migração explícita antes de usar esta versão. Não há conversão automática de dados antigos.

## Endpoints completos

POST, PUT e PATCH usam `Content-Type: application/json`. PUT exige o cadastro completo. IDs de entrada devem ser inteiros positivos. Listagens retornam arrays sem paginação e sem ordem garantida.

| Método | Rota | Entrada | Sucesso |
|---|---|---|---|
| POST | `/restaurantes` | RestauranteRequestDTO | 201 |
| GET | `/restaurantes` | — | 200 |
| GET | `/restaurantes/busca?nome=Pizza` | Busca parcial por nome, preservada | 200 |
| GET | `/restaurantes/{id}` | — | 200 |
| PUT | `/restaurantes/{id}` | RestauranteRequestDTO | 200 |
| DELETE | `/restaurantes/{id}` | — | 204 |
| GET | `/restaurantes/{id}/entregas` | — | 200 |
| POST | `/motoboys` | MotoboyRequestDTO | 201 |
| GET | `/motoboys` | — | 200 |
| GET | `/motoboys/{id}` | — | 200 |
| PUT | `/motoboys/{id}` | MotoboyRequestDTO | 200 |
| PATCH | `/motoboys/{id}/disponibilidade` | DisponibilidadeRequestDTO | 200 |
| GET | `/motoboys/{id}/entregas` | — | 200 |
| POST | `/entregas` | EntregaRequestDTO | 201 |
| GET | `/entregas` | — | 200 |
| GET | `/entregas/{id}` | — | 200 |
| GET | `/entregas/disponiveis` | — | 200 |
| PATCH | `/entregas/{id}/aceitar` | AceitarEntregaRequestDTO | 200 |
| PATCH | `/entregas/{id}/status` | StatusEntregaRequestDTO | 200 |

Todos retornam DTOs de saída (cadastro completo ou entrega completa); listagens retornam arrays. DELETE retorna corpo vazio. Consultas de relacionamentos de restaurante/motoboy inexistente retornam 404; cadastros existentes sem entregas retornam `[]`. As rotas antigas `/clientes`, `/pedidos` e `/{id}/pedidos` foram retiradas.

## Exemplos JSON

Use os IDs efetivamente retornados pelo cadastro. Os IDs e horários abaixo são ilustrativos.

### Cadastrar restaurante — POST /restaurantes

```json
{
  "nome": "EzFood Burgers",
  "cnpj": "12345678000190",
  "categoria": "Hamburgueria",
  "enderecoRetirada": "Rua das Flores, 100, Centro",
  "ativo": true
}
```

Saída 201: mesmo cadastro acrescido de `"id": 1`. O mesmo corpo é usado em PUT; para desativar, envie `ativo: false`.

Nome/categoria são obrigatórios, até 255 caracteres; endereço até 500. CNPJ deve ter 14 dígitos após remover pontuação; a unicidade é aplicada ao valor normalizado. Não há validação de dígitos verificadores. Textos do cadastro têm espaços externos removidos.

### Cadastrar motoboy — POST /motoboys

```json
{
  "nome": "Ana Silva",
  "telefone": "11999999999",
  "email": "ana@example.com",
  "ativo": true,
  "disponivel": true
}
```

Saída 201:

```json
{
  "id": 1,
  "nome": "Ana Silva",
  "telefone": "11999999999",
  "email": "ana@example.com",
  "ativo": true,
  "disponivel": true,
  "dataCadastro": "2026-11-17T15:00:00"
}
```

Nome, telefone e e-mail obrigatórios, limites de 255, 30 e 255 caracteres. E-mail válido, único, normalizado para minúsculas. Não há validação de operadora/DDD. Ambos os booleanos são obrigatórios, inclusive em PUT. O PUT permite ativar/desativar e editar a disponibilidade sem alterar a data de cadastro.

PATCH `/motoboys/1/disponibilidade`:

```json
{"disponivel": false}
```

`disponivel` é a preferência do motoboy; estar ocupado é determinado pela entrega ativa. Não é alterado automaticamente na aceitação/conclusão.

### Criar entrega — POST /entregas

```json
{
  "restauranteId": 1,
  "descricaoConteudo": "Duas marmitas e uma bebida",
  "nomeDestinatario": "João Souza",
  "enderecoEntrega": "Rua das Palmeiras, 250, apartamento 12",
  "referenciaEntrega": "Prédio ao lado da farmácia",
  "observacoes": "Entregar na portaria"
}
```

`restauranteId`, descrição, destinatário e endereço são obrigatórios. Descrição/endereço/referência têm limite de 500 caracteres, destinatário 255, observações 1000. Referência e observações podem ser omitidas ou nulas. Não envie motoboy, datas, status inicial ou endereço de retirada: são definidos pelo backend.

Saída 201:

```json
{
  "id": 1,
  "restauranteId": 1,
  "restauranteNome": "EzFood Burgers",
  "motoboyId": null,
  "motoboyNome": null,
  "descricaoConteudo": "Duas marmitas e uma bebida",
  "nomeDestinatario": "João Souza",
  "enderecoRetirada": "Rua das Flores, 100, Centro",
  "enderecoEntrega": "Rua das Palmeiras, 250, apartamento 12",
  "referenciaEntrega": "Prédio ao lado da farmácia",
  "observacoes": "Entregar na portaria",
  "dataCriacao": "2026-11-17T15:00:00",
  "dataAceitacao": null,
  "dataConclusao": null,
  "status": "DISPONIVEL"
}
```

Os nomes relacionados são os atuais dos cadastros. O endereço de retirada representa o momento da criação.

### Aceitar — PATCH /entregas/1/aceitar

```json
{"motoboyId": 1}
```

Retorna 200 com a entrega completa, agora com `motoboyId: 1`, `motoboyNome: "Ana Silva"`, `status: "ACEITA"` e `dataAceitacao` gerada pelo servidor. A entrega deixa de aparecer em GET `/entregas/disponiveis`. Uma segunda aceitação retorna 409, inclusive sob concorrência.

### Atualizar andamento — PATCH /entregas/1/status

Envie cada etapa em uma requisição separada:

```json
{"status": "RETIRADA"}
```

```json
{"status": "EM_ROTA"}
```

```json
{"status": "ENTREGUE"}
```

Cada chamada retorna a entrega completa. A última preenche `dataConclusao`. Para cancelar uma entrega ainda disponível:

```json
{"status": "CANCELADA"}
```

## Erros HTTP

- **200:** consultas/atualizações; **201:** cadastro/criação; **204:** exclusão sem corpo.
- **400:** Bean Validation, JSON inválido, enum desconhecido ou parâmetro incompatível.
- **404:** recurso ou rota inexistente.
- **409:** regra de negócio, CNPJ/e-mail duplicado, integridade referencial ou conflito de bloqueio concorrente.

O tratamento global existente foi preservado. Exemplo de erro:

```json
{
  "dataHora": "2026-11-17T15:01:00",
  "status": 409,
  "erro": "Conflict",
  "mensagem": "Entrega não está disponível."
}
```

Erros de validação indicam os campos na mensagem. Não dependa do texto exato das mensagens padrão de validação.

## Testes e resultado da verificação

`EzFoodApiTests` usa MockMvc, contexto Spring completo, serviços transacionais e H2 separado (`ezfood-tests`, `create-drop`), com relógio fixo. As operações concorrentes usam duas threads, transações independentes e início coordenado, verificando HTTP 200/409 e o estado persistido. Cada cenário concorrente é repetido três vezes.

A suíte cobre cadastros, criação, restaurante inativo, motoboy inativo/indisponível, limite de uma entrega em todas as etapas ativas, disponibilidade da solicitação, aceitação repetida, conclusão e liberação de vaga, todas as 36 combinações de status pelo PATCH, cancelamento, histórico do endereço, consultas, atualizações, exclusão, duplicidades, DTOs/erros HTTP e as duas formas de disputa concorrente. `EzFoodApplicationTests` verifica o carregamento do contexto.

Resultado no workspace: compilação aprovada e 60 testes aprovados, zero falhas/erros/ignorados. O comando final Maven `clean verify` concluiu com BUILD SUCCESS e gerou o JAR executável. Como outro processo mantinha o JAR antigo em `target` bloqueado, a validação completa foi executada em uma cópia idêntica de `src` e `pom.xml`, em `.maven-cache/validation`, sem encerrar o processo existente. Os relatórios finais estão em `.maven-cache/validation/target/surefire-reports` e o artefato em `.maven-cache/validation/target/EzFood-0.0.1-SNAPSHOT.jar`. Essa pasta de cache é local e está no gitignore. Encerre a instância antiga antes de executar `clean verify` no diretório principal.

## Limitações e próximos passos

Esta versão usa IDs nas operações de desenvolvimento. **IDs fornecidos pelo frontend não são autenticação segura. Autenticação e autorização serão necessárias antes de disponibilizar o sistema publicamente**, incluindo controle de quem pode consultar/alterar cada entrega e proteção dos dados do destinatário e do console H2.

Não há distribuição automática, ranking, proximidade, notificações, WebSocket ou integrações externas. O frontend deve consultar periodicamente as entregas disponíveis. O frontend antigo permanece intacto e ainda usa contratos anteriores; sua adaptação fica para outra etapa.

Endereços são texto. Não há mapa, GPS, coordenadas ou quilometragem inventada. Futuramente poderão ser adicionados geocodificação, distância em quilômetros, rota entre retirada e entrega e mapa interativo, sem misturar esses cálculos com o fluxo atual.

Não há paginação nem ambiente de produção configurado. O H2 em memória é destinado a desenvolvimento. Os testes concorrentes verificam as regras no H2, sem substituir testes de carga.
