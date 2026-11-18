# EzFood — frontend de entregas

Interface React para intermediação de entregas entre restaurantes e motoboys. Os dados operacionais vêm exclusivamente da API Spring Boot; não há cadastros ou entregas fictícios embutidos.

## Tecnologias

React 19, Vite 6, Tailwind CSS 4 e Lucide React. Foram preservados os componentes de interface, a identidade visual, o cliente HTTP centralizado e o proxy existentes. Nenhuma biblioteca foi adicionada.

Paleta: laranja `#F97316`, botões `#C2410C`, grafite `#111827`, fundo `#FFF7ED` e cards `#FFFFFF`. Fontes: Plus Jakarta Sans e DM Sans, com fallback sem serifa.

## Instalação e execução

Requer Node.js compatível com as dependências instaladas (neste workspace foi usado Node 24.14.0) e backend EzFood atualizado com JDK 17 ou superior.

Na raiz do repositório, inicie o backend:

```powershell
mvn spring-boot:run
```

Também é possível usar `.\mvnw.cmd spring-boot:run` no Windows ou `./mvnw spring-boot:run` no Linux/macOS. Caso o wrapper Windows apresente o problema preexistente de `Target[0]`, use uma instalação local do Maven.

Em outro terminal:

```powershell
cd Frontend
npm install
npm run dev
```

No PowerShell, se a política de execução bloquear `npm.ps1`, use `npm.cmd` nos mesmos comandos.

Frontend: **http://localhost:5173**. Backend padrão: **http://localhost:8080**.

## Proxy e ambiente

O `vite.config.js` foi preservado. O navegador acessa `/api/...`; o Vite remove `/api` e encaminha ao backend:

```text
/api/entregas -> http://localhost:8080/entregas
```

Mantenha `VITE_API_BASE=/api`, conforme `.env.example`. Essa variável já possui o mesmo valor padrão no cliente HTTP; não é obrigatório criar arquivo de ambiente para o desenvolvimento local.

O proxy não é incluído no build estático. Em produção será necessário um reverse proxy equivalente, ou uma URL de API com política CORS apropriada. Não foi adicionado CORS ou qualquer alteração no backend.

## Seleção de perfil

A tela inicial permite escolher Restaurante ou Motoboy, selecionar um cadastro existente ou criar um novo.

A seleção é armazenada na chave `ezfood.perfil` do localStorage, contendo somente `type` e `id`. O ID é obtido do cadastro selecionado ou da resposta de criação, sem IDs fixos. Antes de exibir o painel, o cadastro é consultado na API. Um 404 limpa a seleção e retorna à tela inicial; falhas de conexão permitem tentar novamente.

O botão “Trocar perfil” limpa a seleção. Bloqueios do localStorage não impedem usar a interface, mas impedem persistir a escolha.

**Modo de demonstração:** isso não é login nem autenticação segura. O backend atual não verifica a identidade de quem consulta ou altera entregas. Autenticação, autorização e proteção dos dados serão necessárias antes de disponibilizar publicamente.

## Telas e fluxos

### Restaurante

- **Visão geral:** totais reais de entregas, disponíveis, em andamento e concluídas, além das solicitações recentes.
- **Minhas entregas:** listagem responsiva, pesquisa, filtros por situação e detalhes.
- **Nova entrega:** conteúdo, destinatário, endereço de entrega, referência e observações opcionais. O restaurante vem do perfil; a retirada vem do seu cadastro.
- **Detalhes:** endereços, conteúdo, destinatário, motoboy responsável, status e datas. O endereço de retirada preserva o histórico registrado pelo backend.
- **Cancelamento:** somente em `DISPONIVEL`, mediante confirmação.
- **Meu cadastro:** consulta, edição completa, ativação/desativação e exclusão. O backend impede excluir restaurante com entregas vinculadas.

Restaurante inativo recebe um aviso e não pode solicitar entregas pela interface.

### Motoboy

- **Disponíveis:** disponibilidade pessoal, entrega ativa e solicitações disponíveis, com retirada, destino, conteúdo, destinatário e informações adicionais.
- **Minha entrega:** acompanhamento e botões para a próxima etapa válida.
- **Histórico:** entregas finalizadas do próprio motoboy.
- **Cadastro:** consulta e edição de nome, telefone, e-mail, atividade e disponibilidade.

Aceitar exige cadastro ativo, disponibilidade ligada e ausência de entrega ativa. O botão é bloqueado quando essas condições não são atendidas. A disponibilidade cadastrada não é alterada automaticamente na aceitação ou conclusão.

No celular há navegação inferior, controles com alvos de toque adequados e conteúdo adaptado para telas pequenas. No desktop há sidebar.

## Status e ações

```text
DISPONIVEL -> ACEITA -> RETIRADA -> EM_ROTA -> ENTREGUE
DISPONIVEL -> CANCELADA
```

- Aceitação: `PATCH /entregas/{id}/aceitar`, com `{ "motoboyId": ID_SELECIONADO }`.
- Andamento: `PATCH /entregas/{id}/status`, com `{ "status": "RETIRADA" }`, depois `EM_ROTA` e `ENTREGUE`.
- Cancelamento: mesmo endpoint de status, com `CANCELADA`, somente enquanto disponível.
- Disponibilidade: `PATCH /motoboys/{id}/disponibilidade`, com booleano `disponivel`.

A interface nunca usa o endpoint de status para aceitar uma entrega. Não há prazo de dez minutos para cancelamento. O backend permanece responsável pelas regras e pela proteção contra concorrência.

## Cliente HTTP e atualização

`src/lib/api.js` centraliza todos os endpoints de restaurantes, motoboys e entregas. Os DTOs de entrada não incluem IDs gerados, status inicial, motoboy da criação, datas ou valores de venda.

Os painéis sincronizam o perfil e as entregas automaticamente, com intervalo de 5 segundos após cada ciclo concluído. As consultas de cada ciclo podem buscar recursos distintos em paralelo; novos ciclos não se sobrepõem. Atualizações manuais e ações solicitam uma leitura nova. Em abas ocultas, o timer é pausado e as consultas são canceladas; ao retornar, os dados são atualizados.

Não há repetição automática de aceitação. Se outro motoboy assumir a entrega, o 409 é exibido com a mensagem do backend e as listas são recarregadas.

O cliente:

- Mostra `mensagem` retornada pela API em erros 400/404/409.
- Trata falha de conexão e timeout de 12 segundos.
- Não interpreta corpo em respostas 204.
- Informa quando os dados exibidos podem estar desatualizados e bloqueia ações dependentes deles.
- Mantém os formulários abertos quando o backend rejeita a gravação.
- Trata datas como data/hora local sem acrescentar UTC ou inventar fuso.

O fluxo não utiliza clientes compradores, valores de produtos, faturamento, taxa de entrega ou contratos antigos.

## Build e testes

```powershell
npm run build
npm test
```

Build estático: `Frontend/dist/`. Os testes usam o executor nativo do Node, sem bibliotecas adicionais. Cobrem o enum real do backend, transições, elegibilidade de aceitação, cancelamento, datas, ordenação, armazenamento de perfil e contratos HTTP, inclusive 204, 400, 404, 409, erro de rede e ausência de repetição da aceitação.

Não existe script `lint` neste projeto; não foi adicionado um apenas para esta alteração.

### Verificação realizada

- Instalação concluída, build Vite aprovado e 18 testes Node aprovados.
- Fluxos revisados com Playwright e backend Spring Boot real, sem respostas operacionais simuladas.
- Como a instância existente em 8080 não respondeu, foi usada uma instância separada em 8081, com H2 exclusivo em memória, e Vite em 5174. Somente o navegador de QA encaminhou suas chamadas a essa instância. O proxy versionado continua apontando para 8080.
- Os cadastros de teste foram criados durante a verificação nessa instância isolada; não fazem parte dos fontes ou de uma carga inicial.
- Verificados: cadastro de ambos os perfis, seleção existente e persistência, criação/cancelamento, edição, restaurante inativo, disponibilidade, aceitação, bloqueio de segunda entrega, retirada, rota, conclusão, histórico, detalhes, conflito real 200/409, exclusão vinculada bloqueada, perfil inexistente e recuperação após falha de conexão.
- O polling foi observado em execução, inclusive pausa por visibilidade e retomada. Não houve requisições simultâneas repetidas ao mesmo endpoint.
- Revisão visual em desktop, tablet e celular: sidebar, navegação inferior, formulários, listas, tipografia, paleta, estados vazios e ausência de rolagem horizontal.

O conceito Image Gen serviu de referência para a composição. Foram preservados a marca/ícones do projeto, os contratos reais e o cancelamento como ramificação, sem colocar `CANCELADA` como etapa depois de `ENTREGUE`.

## Limitações

Sem autenticação, mapas, GPS, geocodificação, distâncias, pagamentos, ranking, distribuição automática ou notificações em tempo real. A organização dos endereços em um componente próprio permite adicionar mapas futuramente, sem renderizar um mapa fictício agora.

O H2 padrão é em memória: reiniciar o backend apaga os cadastros e invalida seleções anteriores. Não há paginação no backend. As fontes externas possuem fallback local; falhas no carregamento delas podem alterar a aparência da tipografia.
