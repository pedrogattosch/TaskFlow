# TaskFlow

Sistema web para gerenciamento de tarefas, desenvolvido com .NET, React e SQL Server.

## Objetivo
Permitir o cadastro, organização, acompanhamento e conclusão de tarefas de forma simples e eficiente, servindo também como projeto de portfólio.

## Stack
- Back-end: .NET
- Front-end: React
- Banco de dados: SQL Server
- Autenticação: JWT

## Estrutura do projeto

```text
TaskFlow/
├─ docs/
├─ src/
│  ├─ TaskFlow.Domain/
│  ├─ TaskFlow.Application/
│  ├─ TaskFlow.Infrastructure/
│  ├─ TaskFlow.CrossCutting/
│  └─ TaskFlow.API/
├─ tests/
│  ├─ TaskFlow.UnitTests/
│  └─ TaskFlow.IntegrationTests/
├─ web/
│  └─ taskflow-web/
└─ README.md
```

## Documentação
- `docs/vision.md`
- `docs/architecture.md`
- `docs/backlog.md`

## Execução do projeto

### Back-end

```bash
cd backend/TaskFlow.API
dotnet restore
dotnet run
```

### Front-end

```bash
cd frontend
npm install
npm run dev
```

## Status
Em desenvolvimento...
