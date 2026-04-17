# Backlog — TaskFlow

## 1. Objetivo

Este backlog organiza a construção do TaskFlow em entregas pequenas, claras e priorizadas, permitindo desenvolvimento incremental e uso eficiente do Codex no apoio à implementação.

---

## 2. Prioridades

- **Alta**: essencial para a versão 1.0
- **Média**: importante, mas pode vir depois do núcleo principal
- **Baixa**: melhoria futura ou opcional

---

## 3. Backlog por etapas

### Etapa 1 — Setup do projeto

#### Alta
- Criar repositório e estrutura inicial do projeto
- Criar a solution .NET
- Criar os projetos `TaskFlow.Domain`, `TaskFlow.Application`, `TaskFlow.Infrastructure`, `TaskFlow.CrossCutting` e `TaskFlow.API`
- Criar os projetos de teste `TaskFlow.UnitTests` e `TaskFlow.IntegrationTests`
- Criar o projeto React
- Organizar estrutura de pastas
- Adicionar `.gitignore`
- Criar `README.md`
- Adicionar pasta `docs/`

---

### Etapa 2 — Domínio

#### Alta
- Criar entidade `User`
- Criar entidade `Task`
- Criar entidade `Category`
- Criar enum `TaskStatus`
- Criar enum `TaskPriority`
- Criar regras de negócio das tarefas
- Definir contratos principais do domínio
- Criar exceções de domínio

---

### Etapa 3 — Application

#### Alta
- Criar DTOs de autenticação
- Criar DTOs de tarefas
- Criar DTOs de categorias
- Criar casos de uso de cadastro
- Criar casos de uso de login
- Criar casos de uso de criação de tarefa
- Criar casos de uso de edição de tarefa
- Criar casos de uso de exclusão lógica
- Criar casos de uso de listagem de tarefas
- Criar casos de uso de alteração de status
- Criar casos de uso de dashboard
- Criar validações de entrada

---

### Etapa 4 — Infrastructure

#### Alta
- Configurar EF Core
- Criar `DbContext`
- Criar mapeamentos das entidades
- Criar migrations iniciais
- Configurar SQL Server
- Implementar persistência de usuários
- Implementar persistência de tarefas
- Implementar persistência de categorias
- Implementar geração de token JWT
- Implementar hash de senha

---

### Etapa 5 — CrossCutting

#### Média
- Centralizar configuração de injeção de dependência
- Organizar registro de serviços por módulo
- Criar extensões compartilhadas de configuração
- Definir local para políticas e componentes transversais
- Evitar acoplamento indevido entre camadas

---

### Etapa 6 — API

#### Alta
- Configurar dependência entre projetos
- Configurar DI
- Configurar Swagger
- Criar endpoint de cadastro
- Criar endpoint de login
- Criar endpoint de criação de tarefa
- Criar endpoint de consulta de tarefa por id
- Criar endpoint de listagem de tarefas
- Criar endpoint de edição de tarefa
- Criar endpoint de alteração de status
- Criar endpoint de exclusão lógica
- Criar endpoint de categorias
- Criar endpoint de dashboard
- Implementar autenticação e autorização
- Implementar middleware global de exceções

---

### Etapa 7 — Front-end

#### Alta
- Criar estrutura base do React
- Criar página de login
- Criar página de cadastro
- Criar página de dashboard
- Criar página de listagem de tarefas
- Criar formulário de criação de tarefa
- Criar formulário de edição de tarefa
- Criar integração HTTP com a API
- Criar tratamento visual de loading e erro

#### Média
- Criar filtros por status
- Criar filtros por prioridade
- Criar filtros por categoria
- Criar ordenação por prazo
- Criar ordenação por prioridade

---

### Etapa 8 — Testes

#### Alta
- Criar testes unitários das regras de negócio
- Criar testes unitários dos casos de uso
- Criar testes de integração da API
- Validar fluxo completo de autenticação
- Validar fluxo completo de criação e conclusão de tarefa

#### Média
- Adicionar cenários de erro e borda
- Melhorar cobertura de testes críticos
- Preparar massa de dados de apoio para testes

---

### Etapa 9 — Qualidade

#### Média
- Adicionar seed de dados
- Refatorar nomes e responsabilidades
- Melhorar feedback visual do front-end
- Revisar consistência entre documentação e implementação
- Revisar estrutura final do projeto

---

### Etapa 10 — Publicação

#### Média
- Revisar documentação final
- Ajustar README com instruções de execução
- Preparar ambiente para deploy
- Publicar aplicação
- Publicar banco ou ambiente de demonstração
- Adicionar projeto ao portfólio

---

## 4. Backlog funcional resumido

### Alta prioridade
- cadastro e login
- CRUD de tarefas
- alteração de status
- filtros principais
- dashboard resumido

### Média prioridade
- categorias
- ordenação
- testes de integração
- melhorias de UX
- centralização de componentes transversais

### Baixa prioridade
- tema claro e escuro
- etiquetas múltiplas
- subtarefas
- comentários
- compartilhamento

---

## 5. Primeira ordem sugerida de implementação

1. Estruturar repositório e solution
2. Criar domínio
3. Configurar banco e migrations
4. Implementar autenticação
5. Implementar CRUD de tarefas
6. Implementar categorias
7. Implementar dashboard
8. Construir front-end
9. Criar testes
10. Publicar e documentar

---

## 6. Definição de pronto

Uma entrega será considerada pronta quando:

- o código estiver versionado
- a funcionalidade estiver testável
- não houver quebra do fluxo principal
- a responsabilidade estiver na camada correta
- houver clareza de nomes e organização
- o comportamento esperado estiver implementado
- o projeto continuar executável localmente

---

## 7. Itens futuros

- etiquetas múltiplas por tarefa
- subtarefas
- comentários e histórico completo
- notificações por e-mail ou push
- compartilhamento de tarefas entre usuários
- tema claro e escuro
