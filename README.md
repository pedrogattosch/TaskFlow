# TaskFlow

TaskFlow é uma aplicação web para gerenciamento de tarefas, construída com ASP.NET Core, React, TypeScript e SQL Server. O projeto segue uma organização em camadas inspirada em Clean Architecture e em princípios de Domain-Driven Design (DDD), com domínio, casos de uso, infraestrutura, API, front-end e testes separados por responsabilidade.

O projeto já possui:

- cadastro e login de usuários;
- geração e validação de token JWT;
- hash de senha com PBKDF2;
- criação e listagem de categorias por usuário;
- criação, listagem, alteração de status e exclusão lógica de tarefas;
- filtros de tarefas por status, prioridade e categoria;
- ordenação de tarefas por prazo ou prioridade;
- resumo de tarefas por status;
- front-end com autenticação, rotas protegidas, gerenciamento de tarefas e categorias, filtros, ordenação, estados de carregamento e mensagens de erro;
- persistência com Entity Framework Core e SQL Server;
- migração inicial do banco;
- testes unitários e testes de integração da API.

## Stack

- Back-end: .NET, ASP.NET Core e Swagger
- Front-end: React e TypeScript
- Banco de dados: SQL Server e Entity Framework Core
- Testes: xUnit
- Autenticação: JWT

## Estrutura do projeto

```text
TaskFlow/
├─ docs/
│  ├─ architecture.md
│  ├─ backlog.md
│  └─ vision.md
├─ src/
│  ├─ TaskFlow.slnx
│  ├─ TaskFlow.API/
│  │  ├─ Controllers/
│  │  ├─ Properties/
│  │  ├─ appsettings.json
│  │  ├─ appsettings.Development.json
│  │  └─ Program.cs
│  ├─ TaskFlow.Application/
│  │  ├─ DTOs/
│  │  ├─ DependencyInjection/
│  │  ├─ Exceptions/
│  │  ├─ Interfaces/
│  │  └─ UseCases/
│  ├─ TaskFlow.Domain/
│  │  ├─ Entities/
│  │  ├─ Enums/
│  │  ├─ Exceptions/
│  │  ├─ Interfaces/
│  │  └─ ValueObjects/
│  └─ TaskFlow.Infrastructure/
│     ├─ DependencyInjection/
│     ├─ Identity/
│     └─ Persistence/
│        ├─ Configurations/
│        ├─ Context/
│        ├─ Migrations/
│        └─ Repositories/
├─ tests/
│  ├─ TaskFlow.IntegrationTests/
│  └─ TaskFlow.UnitTests/
└─ web/
   └─ taskflow-web/
      ├─ src/
      │  ├─ components/
      │  ├─ contexts/
      │  ├─ pages/
      │  ├─ routes/
      │  ├─ services/
      │  ├─ styles/
      │  └─ types/
      ├─ index.html
      ├─ package.json
      └─ vite.config.ts
```

## Arquitetura

O back-end está dividido em camadas:

- `TaskFlow.Domain`: entidades, enums, regras de negócio, exceções de domínio e contratos de repositório.
- `TaskFlow.Application`: DTOs, casos de uso, validações de entrada, mapeamentos de resposta e contratos de autenticação/persistência.
- `TaskFlow.Infrastructure`: `AppDbContext`, configurações do EF Core, migrations, repositórios, hash de senha, geração e validação de JWT.
- `TaskFlow.API`: controllers HTTP, Swagger, configuração da aplicação e composição das dependências.

O front-end fica em `web/taskflow-web` e consome a API por HTTP. Em desenvolvimento, o Vite usa proxy de `/api` para `http://localhost:5181`.

## Endpoints da API

Autenticação:

- `POST /api/auth/register`
- `POST /api/auth/login`

Categorias:

- `GET /api/categories`
- `POST /api/categories`

Tarefas:

- `GET /api/tasks`
- `GET /api/tasks/summary`
- `POST /api/tasks`
- `PUT /api/tasks/{id}`
- `PATCH /api/tasks/{id}/status`
- `DELETE /api/tasks/{id}`

A listagem de tarefas aceita filtros e ordenação por query string:

- `status`: `1` pendente, `2` em andamento, `3` concluída, `4` cancelada
- `priority`: `1` baixa, `2` média, `3` alta
- `categoryId`: identificador da categoria
- `sortBy`: `dueDate` ou `priority`
- `sortDirection`: `asc` ou `desc`

## Execução

### 1. Restaurar o back-end

Na raiz do repositório:

```bash
dotnet restore src/TaskFlow.slnx
```

### 2. Configurar a chave JWT

```bash
cd src/TaskFlow.API
dotnet user-secrets set "Jwt:SecretKey" "uma-chave-local-com-mais-de-32-caracteres"
cd ../..
```

### 3. Criar ou atualizar o banco

```bash
dotnet ef database update --project src/TaskFlow.Infrastructure --startup-project src/TaskFlow.API
```

### 4. Subir a API

```bash
dotnet run --project src/TaskFlow.API --launch-profile http
```

A API sobe em:

- `http://localhost:5181`
- Swagger em `http://localhost:5181/swagger`

### 5. Instalar dependências do front-end

Em outro terminal:

```bash
cd web/taskflow-web
npm install
```

### 6. Subir o front-end

```bash
npm run dev
```

O front-end sobe em:

- `http://localhost:5173`

Com a configuração atual, chamadas para `/api` são encaminhadas pelo proxy do Vite para `http://localhost:5181`.
Como a API ainda não configura CORS, mantenha esse proxy para execução local do front-end em desenvolvimento.

## Testes automatizados

Os testes ficam em `tests`.

`TaskFlow.UnitTests` cobre comportamentos de domínio e casos de uso, incluindo:

- validações e transições de status de tarefas;
- criação, listagem e validações de tarefas;
- criação e listagem de categorias;
- cadastro e login.

`TaskFlow.IntegrationTests` cobre fluxos HTTP da API, incluindo:

- cadastro, login e rejeição de e-mail duplicado;
- proteção de endpoints sem token;
- criação e listagem de categorias autenticadas;
- criação, filtro, resumo, transição de status e exclusão lógica de tarefas;
- rejeição da transição inválida de cancelada para em andamento.

Para executar os testes:

```bash
dotnet test src/TaskFlow.slnx
```

## Documentação

- `docs/vision.md`: visão do produto.
- `docs/architecture.md`: arquitetura, requisitos e regras de negócio planejadas.
- `docs/backlog.md`: backlog por etapas e itens futuros.

O README.md descreve o estado implementado no código atual. Itens futuros do backlog, como tema claro/escuro, etiquetas múltiplas, subtarefas, comentários, notificações e compartilhamento, ainda não fazem parte da aplicação.
