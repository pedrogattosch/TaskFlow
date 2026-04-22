# TaskFlow

TaskFlow é uma aplicação web de gerenciamento de tarefas com back-end em ASP.NET Core, front-end em React e persistência em SQL Server. O projeto está organizado em camadas, com separação entre domínio, casos de uso, infraestrutura, API, interface web e testes.

## Stacks

- Back-end: .NET 10, ASP.NET Core e Swagger
- Front-end: React 19, TypeScript e Vite
- Banco de dados: SQL Server com Entity Framework Core
- Autenticação: JWT
- Servidor do front-end: Nginx
- Infraestrutura e publicação: Docker e Docker Compose
- Testes: xUnit

## Funcionalidades

- cadastro de usuário;
- login com geração de token JWT;
- hash de senha com PBKDF2;
- criação e listagem de categorias por usuário autenticado;
- atualização de categoria;
- criação de tarefas;
- listagem de tarefas com filtros e ordenação;
- resumo de tarefas por status;
- atualização completa de tarefa;
- atualização de status da tarefa;
- exclusão lógica de tarefa;
- interface web com autenticação, rotas protegidas, dashboard e fluxo de tarefas;
- health check em `/health`;
- Swagger disponível em ambiente de desenvolvimento.

## Estrutura de pastas

```text
TaskFlow/
├─ deploy/
│  ├─ docker/
│  │  ├─ migrate.sh
│  │  └─ run-tests.sh
│  ├─ .env.example
│  ├─ .env.production.example
│  ├─ docker-compose.yml
│  └─ docker-compose.production.yml
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
│  │  ├─ appsettings.Production.json
│  │  ├─ Dockerfile
│  │  └─ Program.cs
│  ├─ TaskFlow.Application/
│  ├─ TaskFlow.Domain/
│  └─ TaskFlow.Infrastructure/
│     └─ Persistence/
│        └─ Migrations/
├─ tests/
│  ├─ TaskFlow.IntegrationTests/
│  └─ TaskFlow.UnitTests/
└─ web/
   └─ taskflow-web/
      ├─ src/
      ├─ Dockerfile
      ├─ nginx.conf
      ├─ package.json
      └─ vite.config.ts
```

## Endpoints

Autenticação:

- `POST /api/auth/register`
- `POST /api/auth/login`

Categorias:

- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/{id}`

Tarefas:

- `GET /api/tasks`
- `GET /api/tasks/summary`
- `POST /api/tasks`
- `PUT /api/tasks/{id}`
- `PATCH /api/tasks/{id}/status`
- `DELETE /api/tasks/{id}`

Infraestrutura:

- `GET /health`

Filtros e ordenação em `GET /api/tasks`:

- `status`: `1` pendente, `2` em andamento, `3` concluída ou `4` cancelada
- `priority`: `1` baixa, `2` média ou `3` alta
- `categoryId`: identificador da categoria
- `sortBy`: `dueDate` ou `priority`
- `sortDirection`: `asc` ou `desc`

## Execução local sem Docker

### 1. Restaurar dependências do back-end

Na raiz do repositório:

```powershell
dotnet restore src/TaskFlow.slnx
```

### 2. Configurar a chave JWT

```powershell
dotnet user-secrets set "Jwt:SecretKey" "uma-chave-local-com-mais-de-32-caracteres" --project src/TaskFlow.API
```

### 3. Ajustar a connection string

Por padrão, o arquivo `src/TaskFlow.API/appsettings.json` usa LocalDB:

```text
Server=(localdb)\MSSQLLocalDB;Database=TaskFlowDb;Trusted_Connection=True;TrustServerCertificate=True
```

Se necessário, sobrescreva com variável de ambiente:

```powershell
$env:ConnectionStrings__DefaultConnection="Server=localhost,1433;Database=TaskFlowDb;User ID=sa;Password=SuaSenhaAqui;Encrypt=False;TrustServerCertificate=True;"
```

### 4. Aplicar as migrations

```powershell
dotnet ef database update --project src/TaskFlow.Infrastructure --startup-project src/TaskFlow.API
```

### 5. Subir a API

```powershell
dotnet run --project src/TaskFlow.API --launch-profile http
```

A API ficará disponível em:

- `http://localhost:5181`
- Swagger: `http://localhost:5181/swagger`
- Health: `http://localhost:5181/health`

### 6. Instalar dependências do front-end

Em outro terminal:

```powershell
Set-Location web/taskflow-web
npm install
```

### 7. Subir o front-end

```powershell
npm run dev
```

O front-end ficará disponível em:

- `http://localhost:5173`

No modo local sem Docker, o Vite encaminha `/api` para `http://localhost:5181`.

## Execução local com Docker

### 1. Criar e configurar `deploy/.env`

Na raiz do repositório:

```powershell
Copy-Item deploy/.env.example deploy/.env
```

O arquivo `deploy/.env.example` já traz uma configuração local pronta. A senha de `MSSQL_SA_PASSWORD` precisa atender às regras de complexidade do SQL Server.

### 2. Validar a configuração

```powershell
docker compose --env-file deploy/.env -f deploy/docker-compose.yml config
```

### 3. Fazer o build das imagens

```powershell
docker compose --env-file deploy/.env -f deploy/docker-compose.yml build
```

### 4. Subir a stack local

```powershell
docker compose --env-file deploy/.env -f deploy/docker-compose.yml up --build
```

Com a stack em execução é possível acessar a aplicação:

- http://localhost:8088

### 5. Encerrar a stack local

```powershell
docker compose --env-file deploy/.env -f deploy/docker-compose.yml down
```

Encerrar e remover o volume do banco local:

```powershell
docker compose --env-file deploy/.env -f deploy/docker-compose.yml down -v
```

## Publicação com Docker

### 1. Criar e configurar `deploy/.env.production`

Na raiz do repositório:

```powershell
Copy-Item deploy/.env.production.example deploy/.env.production
```

O arquivo `deploy/.env.production` deve apontar para um SQL Server já existente.

### 2. Validar a configuração

```powershell
docker compose --env-file deploy/.env.production -f deploy/docker-compose.production.yml config
```

### 3. Fazer o build das imagens

```powershell
docker compose --env-file deploy/.env.production -f deploy/docker-compose.production.yml build
```

### 4. Subir o ambiente de produção

```powershell
docker compose --env-file deploy/.env.production -f deploy/docker-compose.production.yml up -d
```

Com o ambiente em execução é possível acessar a aplicação:

- `http://localhost` ou a porta definida em `WEB_PORT`

### 5. Encerrar o ambiente de produção

```powershell
docker compose --env-file deploy/.env.production -f deploy/docker-compose.production.yml down
```

## Testes

### Testes com `dotnet test`

Na raiz do repositório:

```powershell
dotnet test tests/TaskFlow.UnitTests/TaskFlow.UnitTests.csproj
dotnet test tests/TaskFlow.IntegrationTests/TaskFlow.IntegrationTests.csproj
```

Os testes de integração usam SQLite em memória por meio de `CustomWebApplicationFactory`, então não dependem do SQL Server local para execução.

### Testes via Docker

```powershell
docker compose --env-file deploy/.env -f deploy/docker-compose.yml --profile test run --rm tests
```

## Documentação

- `docs/vision.md`: visão do produto
- `docs/architecture.md`: arquitetura e regras planejadas
- `docs/backlog.md`: backlog e próximos incrementos
