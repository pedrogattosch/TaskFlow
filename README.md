# TaskFlow

O **TaskFlow** é um sistema web para gerenciamento de tarefas que permite ao usuário:
* Criar e organizar tarefas;
* Definir prioridades e prazos;
* Acompanhar status;
* Filtrar e visualizar progresso.
  
---
## ⚙️ Tecnologias

### Back-end

* .NET / ASP.NET Core
* Entity Framework Core
* SQL Server
* JWT Authentication

### Front-end

* React
* TypeScript

---

## 🚀 Funcionalidades

* Cadastro e autenticação de usuários;
* CRUD de tarefas;
* Definição de prioridade e prazo;
* Alteração de status:
  * Pendente;
  * Em andamento;
  * Concluída;
  * Cancelada.
* Filtros por:
  * Status;
  * Prioridade;
  * Categoria;
  * Datas.
* Dashboard com resumo de tarefas;
* Exclusão lógica;

---

## 📁 Estrutura do projeto

```bash
TaskFlow/
├── backend/
│   ├── TaskFlow.API
│   ├── TaskFlow.Application
│   ├── TaskFlow.Domain
│   ├── TaskFlow.Infrastructure
│   ├── TaskFlow.UnitTests
│   ├── TaskFlow.IntegrationTests
│   └── TaskFlow.slnx
│
├── frontend/
│   └── taskflow-web
│
└──── docs/
    └── vision-and-architecture.md
```

---

## ▶️ Como executar o projeto

### 🔹 Back-end

```bash
cd backend/TaskFlow.API
dotnet run
```

### 🔹 Front-end

```bash
cd frontend/taskflow-web
npm install
npm run dev
```

## 📚 Documentação

A documentação completa do projeto está disponível em: `docs/vision-and-architecture.md`

