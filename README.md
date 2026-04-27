<p align="center">
  <img src="docs/assets/taskflow-header.png" alt="TaskFlow - Organize tarefas, acompanhe progresso e aumente sua produtividade" width="100%">
</p>

# TaskFlow

TaskFlow é uma aplicação web para gerenciamento de tarefas com autenticação por JWT, API em ASP.NET Core, front-end em React e persistência em SQL Server. O projeto está organizado em camadas para separar domínio, casos de uso, infraestrutura, API, interface web e testes.

## Stack

- Back-end:`.NET`, `ASP.NET Core` e `Swagger`
- Front-end: `React`, `TypeScript` e `Vite`
- Banco de dados: `Entity Framework Core` e `SQL Server`
- Autenticação: `JWT`
- Infraestrutura local: `Docker Compose`
- Testes unitários: `xUnit`

## Funcionalidades atuais

- cadastro e login de usuários;
- emissão e validação de token JWT;
- hash de senha com `PBKDF2`;
- criação, listagem, atualização e exclusão de categorias por usuário autenticado;
- criação, listagem, atualização, mudança de status e exclusão lógica de tarefas;
- filtros por status, prioridade e categoria;
- ordenação de tarefas por prazo e prioridade;
- resumo de tarefas por status;
- interface protegida com login, registro e gerenciamento de tarefas;
- visualização de tarefas em lista e kanban com drag and drop;
- criação de categoria diretamente pela interface;
- suporte a tema claro/escuro;
- `Swagger` em ambiente de desenvolvimento;
- health check em `/health`.

## Arquitetura do projeto

```text
TaskFlow/
├─ deploy/
│  ├─ docker/
│  │  ├─ migrate.sh
│  │  └─ run-tests.sh
│  ├─ .env.example
│  └─ docker-compose.yml
├─ docs/
│  ├─ architecture.md
│  ├─ backlog.md
│  ├─ vision.md
│  └─ assets/
├─ src/
│  ├─ TaskFlow.slnx
│  ├─ TaskFlow.API/
│  ├─ TaskFlow.Application/
│  ├─ TaskFlow.Domain/
│  └─ TaskFlow.Infrastructure/
├─ tests/
│  ├─ TaskFlow.IntegrationTests/
│  └─ TaskFlow.UnitTests/
└─ web/
   └─ taskflow-web/
```

## API

### Endpoints públicos

- `POST /api/auth/register`
- `POST /api/auth/login`

### Endpoints autenticados

Categorias:

- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/{id}`
- `DELETE /api/categories/{id}`

Tarefas:

- `GET /api/tasks`
- `GET /api/tasks/summary`
- `POST /api/tasks`
- `PUT /api/tasks/{id}`
- `PATCH /api/tasks/{id}/status`
- `DELETE /api/tasks/{id}`

Infraestrutura:

- `GET /health`

### Filtros de `GET /api/tasks`

- `status`: `1` pendente, `2` em andamento, `3` concluída, `4` cancelada
- `priority`: `1` baixa, `2` média, `3` alta
- `categoryId`: identificador da categoria
- `sortBy`: `dueDate` ou `priority`
- `sortDirection`: `asc` ou `desc`

### Contratos principais

`POST /api/auth/register`

```json
{
  "name": "Pedro",
  "email": "pedro@example.com",
  "password": "SenhaSegura123!"
}
```

`POST /api/auth/login`

```json
{
  "email": "pedro@example.com",
  "password": "SenhaSegura123!"
}
```

Resposta de autenticação:

```json
{
  "userId": "00000000-0000-0000-0000-000000000000",
  "name": "Pedro",
  "email": "pedro@example.com",
  "accessToken": "jwt-token",
  "expiresAt": "2026-04-26T22:00:00Z"
}
```

`POST /api/categories`

```json
{
  "name": "Trabalho",
  "color": "#2563eb"
}
```

`POST /api/tasks`

```json
{
  "title": "Preparar release",
  "description": "Revisar checklist e publicar versão",
  "priority": 3,
  "dueDate": "2026-04-30T18:00:00Z",
  "categoryId": null,
  "categoryName": "Entrega"
}
```

`PATCH /api/tasks/{id}/status`

```json
{
  "status": 2
}
```

## Execução local sem Docker

### 1. Restaurar dependências do back-end

```powershell
dotnet restore src/TaskFlow.slnx
```

### 2. Configurar a chave JWT

```powershell
dotnet user-secrets set "Jwt:SecretKey" "uma-chave-local-com-mais-de-32-caracteres" --project src/TaskFlow.API
```

Se necessário, configure também:

```powershell
dotnet user-secrets set "Jwt:Issuer" "TaskFlow" --project src/TaskFlow.API
dotnet user-secrets set "Jwt:Audience" "TaskFlow.Api" --project src/TaskFlow.API
```

### 3. Ajustar a connection string

O arquivo `src/TaskFlow.API/appsettings.json` usa `LocalDB` por padrão:

```text
Server=(localdb)\MSSQLLocalDB;Database=TaskFlowDb;Trusted_Connection=True;TrustServerCertificate=True
```

Para sobrescrever via variável de ambiente:

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

API disponível em:

- `http://localhost:5181`
- `http://localhost:5181/swagger`
- `http://localhost:5181/health`

### 6. Instalar dependências do front-end

```powershell
Set-Location web/taskflow-web
npm install
```

### 7. Subir o front-end

```powershell
npm run dev
```

Front-end disponível em:

- `http://localhost:5173`

No ambiente local sem Docker, o Vite encaminha `/api` para `http://localhost:5181`.

## Execução com Docker

### 1. Criar o arquivo de ambiente

```powershell
Copy-Item deploy/.env.example deploy/.env
```

Variáveis padrão do arquivo:

- `DB_PORT=1433`
- `API_PORT=8080`
- `WEB_PORT=8088`
- `CORS__ALLOWEDORIGIN=http://localhost:8088`

`MSSQL_SA_PASSWORD` precisa obedecer às regras de complexidade do SQL Server.

### 2. Validar a configuração

```powershell
docker compose --env-file deploy/.env -f deploy/docker-compose.yml config
```

### 3. Subir a stack

```powershell
docker compose --env-file deploy/.env -f deploy/docker-compose.yml up --build
```

Serviços expostos:

- aplicação web: `http://localhost:8088`
- API: `http://localhost:8080`

O `docker-compose` sobe:

- `db` com SQL Server 2022;
- `migrator` para aplicar as migrations;
- `api` em ASP.NET Core;
- `web` servido por `Nginx`;
- `tests` em profile separado.

### 4. Encerrar a stack

```powershell
docker compose --env-file deploy/.env -f deploy/docker-compose.yml down
```

Para remover também o volume do banco:

```powershell
docker compose --env-file deploy/.env -f deploy/docker-compose.yml down -v
```

## Testes

### Via .NET

```powershell
dotnet test tests/TaskFlow.UnitTests/TaskFlow.UnitTests.csproj
dotnet test tests/TaskFlow.IntegrationTests/TaskFlow.IntegrationTests.csproj
```

Os testes de integração usam `SQLite` em memória por meio de `CustomWebApplicationFactory`, então não dependem de um SQL Server local.

### Via Docker

```powershell
docker compose --env-file deploy/.env -f deploy/docker-compose.yml --profile test run --rm tests
```

## Documentação complementar

- [docs/vision.md](/C:/Users/pedro/dev/TaskFlow/docs/vision.md)
- [docs/architecture.md](/C:/Users/pedro/dev/TaskFlow/docs/architecture.md)
- [docs/backlog.md](/C:/Users/pedro/dev/TaskFlow/docs/backlog.md)
