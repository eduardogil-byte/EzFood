# EzFood — Frontend React + Tailwind CSS

Painel administrativo para a API Spring Boot do **EzFood**, com identidade visual **Laranja & Grafite**.

**Paleta oficial:** laranja `#F97316`, laranja escuro `#C2410C`, grafite `#111827`, creme `#FFF7ED` e branco `#FFFFFF`.

## O que o painel faz

- **Visão geral**: total de clientes, restaurantes abertos, pedidos ativos e soma de pedidos entregues; últimos pedidos; distribuição por status.
- **Clientes**: cadastrar, listar, pesquisar, editar e excluir. Bloqueio de exclusões com pedidos é feito pela API.
- **Restaurantes**: cadastrar, listar, filtrar, pesquisar, editar, excluir e abrir/fechar usando o `PUT /restaurantes/{id}`.
- **Pedidos**: criar, listar, filtrar, consultar detalhes por ID, avançar o status e cancelar pedidos quando elegíveis; valores somados visualmente são estimados e conferidos pelo backend.
- Mensagens de erros da API, estados de carregamento, confirmação de exclusão e layout responsivo.

## Pré-requisitos

- Node.js 20.19+ ou 22.12+
- Java + Spring Boot EzFood com Controllers e Services implementados (API na porta **8080**)

> **Atenção:** o ZIP original `EzFood-main.zip` compartilhado antes das implementações não contém Services e Controllers. Este frontend foi criado com base na API implementada nos passos anteriores da conversa. Para funcionar é necessário que os endpoints estejam disponíveis.

## Rodar localmente (Windows / PowerShell)

**Terminal 1 — backend**, na pasta principal do EzFood:

```powershell
.\mvnw.cmd spring-boot:run
```

**Terminal 2 — frontend**, dentro da pasta `ezfood-frontend`:

```powershell
npm install
npm run dev
```

Para testar as regras de apresentação que não dependem de servidor:

```powershell
npm test
```

Abra **http://localhost:5173**.

A URL `/api` do frontend é encaminhada automaticamente pelo **proxy Vite** para `http://localhost:8080`. Por isso, **não é necessário configurar CORS para rodar no desenvolvimento**.

### Inserir na pasta do projeto

Copie a pasta `ezfood-frontend` para dentro da raiz do projeto EzFood (no mesmo nível de `pom.xml`):

```text
EzFood/
├── src/
├── pom.xml
├── mvnw.cmd
└── ezfood-frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
```

## Build para produção

```powershell
npm run build
```

Os arquivos estáticos serão gerados na pasta `dist/`. **O proxy do Vite só funciona em desenvolvimento.** Em produção configure no servidor um reverse proxy de `/api/*` para a API Spring em `http://localhost:8080/*`, ou altere `VITE_API_BASE` para a URL pública da API (nesse caso pode ser necessário habilitar CORS no backend).

## Contrato da API utilizado

| Recurso | Rotas utilizadas |
| --- | --- |
| Clientes | `GET /clientes`, `POST /clientes`, `PUT /clientes/{id}`, `DELETE /clientes/{id}` |
| Restaurantes | `GET /restaurantes`, `POST /restaurantes`, `PUT /restaurantes/{id}`, `DELETE /restaurantes/{id}` |
| Pedidos | `GET /pedidos`, `GET /pedidos/{id}`, `POST /pedidos`, `PATCH /pedidos/{id}/status` |

Payload para registrar um pedido:

```json
{
  "clienteId": 1,
  "restauranteId": 1,
  "valorProdutos": 39.90
}
```

Os status são `CRIADO`, `PREPARANDO`, `SAIU_PARA_ENTREGA`, `ENTREGUE`, `CANCELADO`.

### Regras e limites respeitados pelo frontend

- Permite selecionar somente clientes ativos e restaurantes abertos para **novo pedido**.
- Não apresenta o botão cancelar fora dos primeiros 10 minutos ou para pedidos fora de `CRIADO`.
- Oferece apenas a próxima transição de status permitida.
- O backend é a fonte da verdade: ele valida 3 pedidos ativos por cliente, calcula o valor total e verifica as regras de transição/cancelamento.
- Clientes não têm alteração de `ativo` no formulário porque o `ClienteRequestDTO` atual só possui `nome` e `email`.
- Não há catálogo de produtos na API: `valorProdutos` é um valor digitado, não uma lista de itens.

## Observações

- O banco H2 usado no projeto está em memória: os dados serão perdidos ao encerrar o backend, salvo se sua configuração tiver sido alterada.
- Se a API estiver fora do ar, uma mensagem de conexão será exibida no painel. Confirme o backend em `http://localhost:8080/clientes`.
- Não existem contas, login nem autenticação na API descrita; o painel é somente administrativo.

### Consultas adicionais no cliente HTTP

O módulo `src/lib/api.js` também inclui funções para `GET /clientes/{id}`, `GET /clientes/busca?nome=`, `GET /clientes/{id}/pedidos`, `GET /restaurantes/{id}`, `GET /restaurantes/busca?nome=` e `GET /restaurantes/{id}/pedidos`. As telas fazem pesquisa e contagens locais a partir das listas carregadas, evitando chamadas adicionais a cada tecla.
