# Arquitetura — TaskFlow

## 1. Objetivo

O TaskFlow é uma aplicação web de gerenciamento de tarefas organizada em camadas, inspirada em Clean Architecture. A solução separa domínio, casos de uso, infraestrutura, API HTTP, interface web e testes para manter baixo acoplamento entre regras de negócio, persistência e apresentação.

O back-end expõe uma API REST em ASP.NET Core. O front-end React consome essa API por HTTP, usando rotas públicas para autenticação e rotas protegidas para o fluxo de tarefas. A persistência principal usa SQL Server via Entity Framework Core.

---

## 2. Stack

### Back-end

- .NET 10
- ASP.NET Core Web API
- Entity Framework Core 10
- SQL Server
- JWT assinado com HMAC
- PBKDF2 para hash de senha
- Swagger em ambiente de desenvolvimento
- Health check em `/health`

### Front-end

- React
- TypeScript
- Vite
- React Router

### Infraestrutura

- Docker
- Docker Compose
- SQL Server em ambiente local conteinerizado

### Testes

- xUnit
- Testes unitários de domínio e aplicação
- Testes de integração com `WebApplicationFactory`
- SQLite em memória nos testes de integração

---

## 3. Estrutura da solução

```text
TaskFlow/
├─ deploy/
│  ├─ docker/
│  ├─ docker-compose.yml
│  └─ docker-compose.production.yml
├─ docs/
│  ├─ architecture.md
│  ├─ backlog.md
│  └─ vision.md
├─ src/
│  ├─ TaskFlow.slnx
│  ├─ TaskFlow.API/
│  ├─ TaskFlow.Application/
│  ├─ TaskFlow.Domain/
│  └─ TaskFlow.Infrastructure/
├─ tests/
│  ├─ TaskFlow.IntegrationTests/
│  └─ TaskFlow.UnitTests/
├─ web/
│  └─ taskflow-web/
└─ README.md
```

---

## 4. Responsabilidade de cada camada

### TaskFlow.Domain

Contém o núcleo de negócio do sistema.

Responsabilidades atuais:

- entidades `User`, `Task` e `Category`;
- enums de prioridade e status de tarefa;
- regras de negócio das entidades;
- contratos de repositório;
- exceções de domínio;
- value object `AuditInfo`.

Essa camada não depende de ASP.NET Core, EF Core, banco de dados ou interface web.

### TaskFlow.Application

Contém os casos de uso e contratos de aplicação.

Responsabilidades atuais:

- DTOs de entrada e saída;
- casos de uso de autenticação, categorias e tarefas;
- validações de fluxo de aplicação;
- mapeamento de entidades para responses;
- contratos de autenticação e unidade de trabalho;
- exceções de aplicação.

A camada Application depende do Domain e coordena o fluxo sem conhecer detalhes de SQL Server, EF Core ou controllers.

### TaskFlow.Infrastructure

Contém implementações técnicas.

Responsabilidades atuais:

- `AppDbContext`;
- configurações de entidades do EF Core;
- migrations;
- repositórios;
- `UnitOfWork`;
- hash de senha com PBKDF2;
- geração e validação de JWT;
- registro de dependências de infraestrutura.

### TaskFlow.API

Expõe a aplicação por HTTP.

Responsabilidades atuais:

- controllers REST;
- configuração de serviços e pipeline;
- Swagger em desenvolvimento;
- CORS configurável;
- forwarded headers para execução atrás do Nginx/proxy;
- health check;
- tradução de exceções esperadas para `ProblemDetails`.

Os controllers não acessam o banco diretamente. Eles recebem DTOs, resolvem o usuário autenticado quando necessário e delegam o comportamento para casos de uso.

### Front-end

Contém a interface web em React.

Responsabilidades atuais:

- páginas de login, cadastro, listagem e criação de tarefas;
- rotas públicas e protegidas;
- contexto de autenticação;
- armazenamento local do token;
- serviços HTTP para autenticação, categorias e tarefas;
- componentes reutilizáveis;
- tema claro/escuro.

No desenvolvimento local, o Vite encaminha `/api` para `http://localhost:5181`. Em Docker, o Nginx serve a build e encaminha `/api`, `/health` e `/swagger` para a API.

### Testes

Responsabilidades atuais:

- `TaskFlow.UnitTests`: valida regras de domínio e casos de uso com test doubles;
- `TaskFlow.IntegrationTests`: valida fluxos HTTP integrados usando `WebApplicationFactory` e SQLite em memória.

---

## 5. Fluxo da aplicação

1. O usuário acessa a interface React.
2. O front-end envia requisições HTTP para a API.
3. A API recebe a requisição no controller correspondente.
4. Para rotas protegidas, o controller extrai o token Bearer e usa `IJwtTokenValidator` para obter o `UserId`.
5. O controller chama o caso de uso da camada Application.
6. O caso de uso valida a entrada, consulta repositórios quando necessário e aciona regras do Domain.
7. A Infrastructure executa consultas e persistência via EF Core e SQL Server.
8. A Application retorna DTOs de resposta.
9. A API devolve a resposta HTTP para o front-end.

---

## 6. Funcionalidades implementadas

| Área | Funcionalidade |
|---|---|
| Autenticação | Cadastro de usuário |
| Autenticação | Login com geração de JWT |
| Autenticação | Rotas protegidas no front-end |
| Categorias | Criação de categoria por usuário autenticado |
| Categorias | Listagem de categorias do usuário autenticado |
| Categorias | Atualização de categoria |
| Tarefas | Criação de tarefa |
| Tarefas | Listagem de tarefas com filtros e ordenação |
| Tarefas | Resumo de tarefas por status |
| Tarefas | Atualização completa de tarefa |
| Tarefas | Atualização de status |
| Tarefas | Exclusão lógica |
| Infraestrutura | Health check em `/health` |
| Infraestrutura | Execução local e produção via Docker Compose |

---

## 7. Regras de negócio

| Código | Regra de negócio |
|---|---|
| RN01 | Toda tarefa deve possuir título com tamanho entre 3 e 120 caracteres. |
| RN02 | A descrição da tarefa é opcional, com limite de 1000 caracteres. |
| RN03 | Toda tarefa deve pertencer a um usuário. |
| RN04 | Uma tarefa deve possuir um status válido. |
| RN05 | Uma tarefa concluída registra `CompletedAt`; ao sair de concluída, esse campo volta para `null`. |
| RN06 | Uma tarefa cancelada não pode mudar diretamente para outro status; precisa ser reativada pela regra de domínio. |
| RN07 | O prazo, quando informado, não pode ser anterior à data de criação. |
| RN08 | A prioridade deve ser um valor válido do enum de prioridade. |
| RN09 | A exclusão de tarefa é lógica por meio de `IsDeleted` e auditoria. |
| RN10 | Categorias são opcionais, mas, quando usadas, devem pertencer ao mesmo usuário da tarefa. |
| RN11 | O nome da categoria é único por usuário. |
| RN12 | O e-mail do usuário é único. |

---

## 8. Entidades principais

### User

Representa o usuário autenticado.

Campos principais:

- `Id`
- `Name`
- `Email`
- `PasswordHash`
- `AuditInfo`

### Task

Representa uma tarefa do usuário.

Campos principais:

- `Id`
- `UserId`
- `CategoryId`
- `Title`
- `Description`
- `Priority`
- `Status`
- `DueDate`
- `CompletedAt`
- `IsDeleted`
- `AuditInfo`

### Category

Representa uma categoria usada para agrupar tarefas.

Campos principais:

- `Id`
- `UserId`
- `Name`
- `Color`
- `AuditInfo`

---

## 9. Banco de dados

O banco de dados principal é relacional e usa SQL Server.

### Tabelas

- `Users`
- `Tasks`
- `Categories`

### Relacionamentos

- `Users` possui relação 1:N com `Tasks`;
- `Users` possui relação 1:N com `Categories`;
- `Tasks` possui `Category` opcional;
- ao remover uma categoria, as tarefas relacionadas ficam com `CategoryId` nulo;
- exclusões de usuário referenciado por tarefas ou categorias são restritas pela configuração do EF Core.

### Índices

- índice único em `Users.Email`;
- índice único em `Categories(UserId, Name)`;
- índice em `Tasks(UserId, Status)`;
- índice em `Tasks(UserId, DueDate)`.

---

## 10. API

### Autenticação

- `POST /api/auth/register`
- `POST /api/auth/login`

### Categorias

- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/{id}`

### Tarefas

- `GET /api/tasks`
- `GET /api/tasks/summary`
- `POST /api/tasks`
- `PUT /api/tasks/{id}`
- `PATCH /api/tasks/{id}/status`
- `DELETE /api/tasks/{id}`

### Infraestrutura

- `GET /health`

### Filtros e ordenação de tarefas

`GET /api/tasks` aceita:

- `status`
- `priority`
- `categoryId`
- `sortBy`
- `sortDirection`

---

## 11. Autenticação e autorização

O login gera um JWT contendo a identificação do usuário. Nas rotas protegidas de categorias e tarefas, os controllers leem o header `Authorization: Bearer <token>` e usam `IJwtTokenValidator` para obter o `UserId`.

A autorização é aplicada por isolamento de dados nos casos de uso e repositórios, operações de categorias e tarefas sempre usam o usuário autenticado como parte do fluxo.

---

## 12. Tratamento de erros

Os controllers convertem exceções esperadas para respostas HTTP com `ProblemDetails`:

- `ApplicationValidationException` e `DomainException`: `400 Bad Request`;
- `ApplicationUnauthorizedException`: `401 Unauthorized`;
- `ApplicationNotFoundException`: `404 Not Found`;
- `ApplicationConflictException`: `409 Conflict`.

Não há middleware global de exceções implementado no estado atual, o tratamento é feito diretamente nos controllers.

---

## 13. Infraestrutura de execução

### Local sem Docker

- API executada com `dotnet run --project src/TaskFlow.API --launch-profile http`;
- Vite executado em `web/taskflow-web` com `npm run dev`;
- proxy local do Vite encaminha `/api` para `http://localhost:5181`.

### Local com Docker

`deploy/docker-compose.yml` sobe:

- `db`: SQL Server;
- `migrator`: aplica migrations antes da API;
- `api`: aplicação ASP.NET Core;
- `web`: Nginx servindo o front-end e encaminhando chamadas para a API;
- `tests`: perfil opcional para execução de testes em container.

---

## 14. Estratégia de testes

### Testes unitários

Validam comportamentos isolados de domínio e aplicação, incluindo:

- autenticação;
- criação e atualização de categorias;
- criação, listagem, resumo, atualização, mudança de status e exclusão lógica de tarefas;
- regras de entidades.

### Testes de integração

Validam fluxos HTTP da API com banco em memória, incluindo:

- cadastro;
- login;
- endpoints protegidos;
- criação e atualização de categorias;
- criação, listagem, resumo, atualização de status e exclusão lógica de tarefas.

---

## 15. Diretrizes de manutenção

- Manter regras de negócio fora dos controllers.
- Não expor entidades de domínio diretamente nas respostas HTTP.
- Usar DTOs para entrada e saída.
- Manter validações importantes no back-end.
- Evoluir o banco por migrations.
- Registrar novos casos de uso na camada Application.
- Registrar implementações técnicas na camada Infrastructure.
- Manter endpoints protegidos sempre vinculados ao usuário autenticado.
- Atualizar esta documentação quando houver mudanças reais na estrutura, no fluxo de autenticação, nos endpoints ou na infraestrutura.
