# Backlog — TaskFlow

## 1. Objetivo

Este backlog registra o estado atual do TaskFlow e organiza as próximas entregas de forma incremental. Ele deve ser atualizado conforme funcionalidades, testes, documentação e infraestrutura forem concluídos.

---

## 2. Legenda de status

- `[x]` Concluído
- `[~]` Parcialmente concluído
- `[ ]` Pendente

---

## 3. Prioridades

- **Alta**: essencial para a versão 1.0
- **Média**: importante, mas pode vir depois do núcleo principal
- **Baixa**: melhoria futura ou opcional

---

## 4. Estado geral em 2026-04-29

O TaskFlow já possui um fluxo funcional full stack com API ASP.NET Core, front-end React, autenticação JWT, persistência com EF Core/SQL Server, Docker Compose e testes automatizados.

Funcionalidades já implementadas:

- cadastro e login de usuários;
- emissão e validação de JWT;
- hash de senha com PBKDF2;
- CRUD de categorias por usuário autenticado;
- criação, listagem, atualização, mudança de status e exclusão lógica de tarefas;
- filtros por status, prioridade e categoria;
- ordenação por prazo e prioridade;
- resumo de tarefas por status;
- interface web protegida com login, cadastro, dashboard/listagem e criação/edição de tarefas;
- visualização em lista e kanban com drag and drop para mudança de status;
- tema claro/escuro;
- execução local via Docker Compose com SQL Server, migrator, API, web e profile de testes;
- testes unitários de domínio e aplicação;
- testes de integração da API com `WebApplicationFactory` e SQLite em memória.

Pontos ainda pendentes ou parciais:

- endpoint dedicado de consulta de tarefa por id;
- middleware global de exceções, já que o tratamento atual está nos controllers;
- publicação em ambiente externo ou demonstração pública;
- seed de dados;
- testes automatizados do front-end.

---

## 5. Backlog por etapas

### Etapa 1 — Setup do projeto

#### Alta
- [x] Criar repositório e estrutura inicial do projeto
- [x] Criar a solution .NET
- [x] Criar os projetos `TaskFlow.Domain`, `TaskFlow.Application`, `TaskFlow.Infrastructure` e `TaskFlow.API`
- [x] Criar os projetos de teste `TaskFlow.UnitTests` e `TaskFlow.IntegrationTests`
- [x] Criar o projeto React
- [x] Organizar estrutura de pastas
- [x] Adicionar `.gitignore`
- [x] Criar `README.md`
- [x] Adicionar pasta `docs/`

---

### Etapa 2 — Domínio

#### Alta
- [x] Criar entidade `User`
- [x] Criar entidade `Task`
- [x] Criar entidade `Category`
- [x] Criar enum `TaskStatus`
- [x] Criar enum `TaskPriority`
- [x] Criar regras de negócio das tarefas
- [x] Definir contratos principais do domínio
- [x] Criar exceções de domínio
- [x] Adicionar `AuditInfo`

---

### Etapa 3 — Application

#### Alta
- [x] Criar DTOs de autenticação
- [x] Criar DTOs de tarefas
- [x] Criar DTOs de categorias
- [x] Criar casos de uso de cadastro
- [x] Criar casos de uso de login
- [x] Criar casos de uso de criação de tarefa
- [x] Criar casos de uso de edição de tarefa
- [x] Criar casos de uso de exclusão lógica de tarefa
- [x] Criar casos de uso de listagem de tarefas
- [x] Criar casos de uso de alteração de status
- [x] Criar casos de uso de dashboard/resumo
- [x] Criar casos de uso de categorias
- [x] Criar validações de entrada

---

### Etapa 4 — Infrastructure

#### Alta
- [x] Configurar EF Core
- [x] Criar `DbContext`
- [x] Criar mapeamentos das entidades
- [x] Criar migrations iniciais
- [x] Configurar SQL Server
- [x] Implementar persistência de usuários
- [x] Implementar persistência de tarefas
- [x] Implementar persistência de categorias
- [x] Implementar `UnitOfWork`
- [x] Implementar geração de token JWT
- [x] Implementar validação de token JWT
- [x] Implementar hash de senha

---

### Etapa 5 — API

#### Alta
- [x] Configurar dependência entre projetos
- [x] Configurar DI
- [x] Configurar Swagger
- [x] Criar endpoint de cadastro
- [x] Criar endpoint de login
- [x] Criar endpoint de criação de tarefa
- [ ] Criar endpoint de consulta de tarefa por id
- [x] Criar endpoint de listagem de tarefas
- [x] Criar endpoint de edição de tarefa
- [x] Criar endpoint de alteração de status
- [x] Criar endpoint de exclusão lógica de tarefa
- [x] Criar endpoints de categorias
- [x] Criar endpoint de dashboard/resumo
- [x] Implementar autenticação e autorização por token Bearer
- [~] Implementar tratamento padronizado de exceções
- [ ] Implementar middleware global de exceções
- [x] Implementar health check em `/health`

---

### Etapa 6 — Front-end

#### Alta
- [x] Criar estrutura base do React
- [x] Criar página de login
- [x] Criar página de cadastro
- [x] Criar página de dashboard/listagem de tarefas
- [x] Criar página/formulário de criação de tarefa
- [x] Criar formulário de edição de tarefa
- [x] Criar integração HTTP com a API
- [x] Criar tratamento visual de loading e erro
- [x] Criar rotas públicas e protegidas
- [x] Criar armazenamento local do token
- [x] Criar gerenciamento de categorias pela interface
- [x] Criar visualização em lista
- [x] Criar visualização kanban com drag and drop
- [x] Criar alternância de tema claro/escuro

#### Média
- [x] Criar filtros por status
- [x] Criar filtros por prioridade
- [x] Criar filtros por categoria
- [x] Criar ordenação por prazo
- [x] Criar ordenação por prioridade
- [~] Melhorar feedback visual do front-end

---

### Etapa 7 — Testes

#### Alta
- [x] Criar testes unitários das regras de negócio
- [x] Criar testes unitários dos casos de uso
- [x] Criar testes de integração da API
- [x] Validar fluxo completo de autenticação
- [x] Validar fluxo completo de criação, alteração de status e exclusão lógica de tarefa
- [x] Validar fluxo de categorias

#### Média
- [x] Adicionar cenários de erro e borda no domínio, aplicação e API
- [~] Melhorar cobertura de testes críticos
- [ ] Preparar massa de dados de apoio para testes
- [ ] Adicionar testes automatizados do front-end

---

### Etapa 8 — Qualidade

#### Média
- [ ] Adicionar seed de dados
- [~] Refatorar nomes e responsabilidades
- [~] Melhorar feedback visual do front-end
- [x] Revisar consistência entre documentação e implementação
- [x] Revisar estrutura final do projeto
- [x] Documentar arquitetura atual
- [x] Documentar execução local e Docker

---

### Etapa 9 — Publicação

#### Média
- [~] Revisar documentação final
- [x] Ajustar README.md com instruções de execução
- [x] Preparar ambiente local para deploy com Docker Compose
- [ ] Preparar ambiente externo de deploy
- [ ] Publicar aplicação
- [ ] Publicar banco ou ambiente de demonstração
- [ ] Adicionar projeto ao portfólio

---

## 6. Backlog funcional resumido

### Alta prioridade
- [x] cadastro e login
- [x] CRUD de tarefas
- [x] alteração de status
- [x] filtros principais
- [x] dashboard resumido
- [x] categorias

### Média prioridade
- [x] ordenação
- [x] testes de integração
- [x] melhorias de UX iniciais
- [x] centralização de componentes transversais por camada
- [ ] consulta de tarefa por id
- [ ] middleware global de exceções
- [ ] seed de dados

### Baixa prioridade
- [x] tema claro e escuro
- [ ] etiquetas múltiplas
- [ ] subtarefas
- [ ] comentários
- [ ] compartilhamento
- [ ] notificações

---

## 7. Definição de pronto

Uma entrega será considerada pronta quando:

- o código estiver versionado;
- a funcionalidade estiver testável;
- não houver quebra do fluxo principal;
- a responsabilidade estiver na camada correta;
- houver clareza de nomes e organização;
- o comportamento esperado estiver implementado;
- o projeto continuar executável localmente;
- os testes relevantes passarem;
- a documentação afetada estiver atualizada.

---
