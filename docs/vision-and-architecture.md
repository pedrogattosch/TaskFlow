# DOCUMENTO DE VISÃO E ARQUITETURA

# TaskFlow - Sistema de Tarefas

- **Back-end:** .NET
- **Front-end:** React
- **Banco de dados:** SQL Server

## 1. Visão geral do sistema

O TaskFlow será um sistema web para cadastro, organização, acompanhamento e conclusão de tarefas. O usuário poderá criar tarefas, definir prioridades, acompanhar status, organizar por categorias e visualizar o progresso em uma interface simples. O projeto foi definido para ser pequeno o suficiente para ser concluído por uma pessoa em fase de estudos, mas estruturado de forma profissional para demonstrar domínio técnico.

## 2. Escopo funcional

### 2.1 Funcionalidades da versão 1.0

- Cadastro e autenticação de usuário.
- Criação, edição, exclusão lógica e consulta de tarefas.
- Definição de título, descrição, prioridade, prazo e categoria.
- Alteração de status da tarefa: pendente, em andamento, concluída e cancelada.
- Listagem com filtros por status, prioridade, categoria e intervalo de datas.
- Ordenação por data de criação, prazo e prioridade.
- Dashboard simples com quantidade de tarefas por status.
- Registro de data de criação, atualização e conclusão.

### 2.2 Funcionalidades futuras

- Etiquetas múltiplas por tarefa.
- Notificações por e-mail ou push.
- Comentários e histórico completo de alterações.
- Subtarefas.
- Compartilhamento de tarefas entre usuários.

## 3. Requisitos do sistema

### 3.1 Requisitos funcionais

| Código | Requisito funcional |
|---|---|
| RF01 | O sistema deve permitir cadastro de usuário. |
| RF02 | O sistema deve permitir login e logout. |
| RF03 | O sistema deve permitir criar uma tarefa. |
| RF04 | O sistema deve permitir editar dados de uma tarefa. |
| RF05 | O sistema deve permitir alterar o status de uma tarefa. |
| RF06 | O sistema deve permitir excluir uma tarefa de forma lógica. |
| RF07 | O sistema deve permitir consultar tarefa por id. |
| RF08 | O sistema deve permitir listar tarefas com filtros e ordenação. |
| RF09 | O sistema deve exibir um resumo do total de tarefas por status. |
| RF10 | O sistema deve registrar auditoria básica de criação e atualização. |

### 3.2 Requisitos não funcionais

| Código | Requisito não funcional |
|---|---|
| RNF01 | API REST documentada com Swagger. |
| RNF02 | Arquitetura organizada por camadas com separação de responsabilidades. |
| RNF03 | Persistência em SQL Server usando Entity Framework Core. |
| RNF04 | Front-end React com componentes reutilizáveis e consumo via HTTP. |
| RNF05 | Validação de entrada no back-end e feedback amigável no front-end. |
| RNF06 | Autenticação baseada em JWT. |
| RNF07 | Código versionado em Git com commits pequenos e descritivos. |
| RNF08 | Cobertura mínima de testes nas regras críticas do domínio. |

## 4. Regras de negócio

| Código | Regra de negócio |
|---|---|
| RN01 | Toda tarefa deve possuir título com tamanho entre 3 e 120 caracteres. |
| RN02 | A descrição da tarefa é opcional, com limite de 1000 caracteres. |
| RN03 | Toda tarefa deve pertencer a um usuário. |
| RN04 | Uma tarefa deve possuir exatamente um status ativo. |
| RN05 | Uma tarefa concluída deve registrar data de conclusão. |
| RN06 | Uma tarefa cancelada não pode voltar para "em andamento" sem reativação explícita. |
| RN07 | O prazo, quando informado, não pode ser anterior à data de criação. |
| RN08 | A prioridade deve ser uma entre: baixa, média ou alta. |
| RN09 | A exclusão será lógica para preservar histórico e rastreabilidade. |
| RN10 | Categorias são opcionais, mas, quando usadas, devem pertencer ao mesmo usuário da tarefa. |

## 5. Modelo de domínio

O domínio principal do projeto é gerenciamento de tarefas. A ideia central é que o usuário organiza suas tarefas pessoais por meio de entidades simples, porém coesas. O foco é manter regras importantes no domínio e não espalhadas pela interface ou pela camada de infraestrutura.

### 5.1 Entidades principais

| Entidade | Responsabilidade | Observações |
|---|---|---|
| User | Representa o usuário autenticado do sistema. | Responsável por identidade e relacionamento com tarefas. |
| Task | Representa a tarefa cadastrada. | Entidade central do domínio |
| Category | Agrupa tarefas por contexto. | Opcional na versão 1.0. |

### 5.2 Value Objects e enums

| Tipo | Descrição |
|---|---|
| TaskStatus | Enum com Pendente, Em andamento, Concluída, Cancelada. |
| TaskPriority | Enum com Baixa, Média, Alta |
| AuditInfo | Value object opcional para CreatedAt, UpdatedAt e DeletedAt |

### 5.3 Detalhamento das entidades

**Entidade: User**

| Atributo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| Id | Guid | Sim | Identificador do usuário |
| Name | string | Sim | Nome do usuário |
| Email | string | Sim | E-mail único |
| PasswordHash | string | Sim | Senha armazenada com hash |
| CreatedAt | datetime | Sim | Data de criação |
| UpdatedAt | datetime | Sim | Data da última atualização |

**Entidade: Category**

| Atributo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| Id | Guid | Sim | Identificador da categoria |
| UserId | Guid | Sim | Dono da categoria |
| Name | string | Sim | Nome da categoria |
| Color | string | Não | Cor para exibição no front-end |
| CreatedAt | datetime | Sim | Data de criação |

**Entidade: Task**

| Atributo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| Id | Guid | Sim | Identificador da tarefa |
| UserId | Guid | Sim | Dono da tarefa |
| CategoryId | Guid | Não | Categoria associada |
| Title | string | Sim | Título da tarefa |
| Description | string | Não | Descrição detalhada |
| Priority | int/enum | Sim | Baixa, Média ou Alta |
| Status | int/enum | Sim | Pendente, Em andamento, Concluída, Cancelada |
| DueDate | datetime | Não | Prazo da tarefa |
| CompletedAt | datetime | Não | Data de conclusão |
| IsDeleted | bit | Sim | Marca exclusão lógica |
| CreatedAt | datetime | Sim | Data de criação |
| UpdatedAt | datetime | Sim | Data da última atualização |

## 6. Modelagem do banco de dados

### 6.1 Tabelas

| Tabela | Chave primária | Principais relacionamentos |
|---|---|---|
| Users | Id | 1:N com Tasks e Categories |
| Categories | Id | N:1 com Users; 1:N com Tasks |
| Tasks | Id | N:1 com Users; N:1 com Categories |

### 6.2 Estrutura sugerida das tabelas

**Tabela Users**

| Coluna | Tipo SQL Server | Regra |
|---|---|---|
| Id | uniqueidentifier | PK |
| Name | nvarchar(120) | not null |
| Email | nvarchar(150) | not null unique |
| PasswordHash | nvarchar(255) | not null |
| CreatedAt | datetime2 | not null |
| UpdatedAt | datetime2 | not null |

**Tabela Categories**

| Coluna | Tipo SQL Server | Regra |
|---|---|---|
| Id | uniqueidentifier | PK |
| UserId | uniqueidentifier | FK -> Users(Id) |
| Name | nvarchar(80) | not null |
| Color | nvarchar(20) | null |
| CreatedAt | datetime2 | not null |

**Tabela Tasks**

| Coluna | Tipo SQL Server | Regra |
|---|---|---|
| Id | uniqueidentifier | PK |
| UserId | uniqueidentifier | FK -> Users(Id) |
| CategoryId | uniqueidentifier | FK -> Categories(Id), null |
| Title | nvarchar(120) | not null |
| Description | nvarchar(1000) | null |
| Priority | int | not null |
| Status | int | not null |
| DueDate | datetime2 | null |
| CompletedAt | datetime2 | null |
| IsDeleted | bit | not null default 0 |
| CreatedAt | datetime2 | not null |
| UpdatedAt | datetime2 | not null |

### 6.3 Índices recomendados

- Índice único em Users.Email.
- Índice composto em Tasks(UserId, Status).
- Índice composto em Tasks(UserId, DueDate).
- Índice em Categories(UserId, Name).

## 7. Arquitetura do sistema

A arquitetura recomendada é Clean Architecture com elementos de DDD tático. Ela ajuda a separar regras de negócio, casos de uso, infraestrutura e interface. Para um projeto júnior, essa abordagem mostra organização sem exigir complexidade desnecessária de microsserviços.

### 7.1 Visão por camadas

| Camada | Responsabilidade | Tecnologias sugeridas |
|---|---|---|
| Domain | Entidades, enums, contratos e regras de negócio. | .NET class library |
| Application | Casos de uso, DTOs, validações e orquestração. | .NET class library |
| Infrastructure | Persistência, autenticação, serviços externos. | EF Core, SQL Server, JWT |
| API | Controllers/endpoints, DI, Swagger e middleware. | ASP.NET Core Web API |
| Front-end | Interface do usuário e consumo da API. | React |

### 7.2 Fluxo arquitetural

- O React envia requisições HTTP para a API.
- A API recebe a entrada, valida o contrato e chama casos de uso da camada Application.
- A camada Application aplica regras de processo e usa interfaces definidas pelo domínio.
- A Infrastructure implementa repositórios e serviços concretos.
- O SQL Server persiste os dados.

### 7.3 Estrutura de solução sugerida

| Projeto | Descrição |
|---|---|
| TaskFlow.Domain | Entidades, enums, exceptions, interfaces de domínio. |
| TaskFlow.Application | Casos de uso, DTOs, validators, services. |
| TaskFlow.Infrastructure | DbContext, repositories, auth, migrations. |
| TaskFlow.API | Controllers, configuração, middlewares, Swagger. |
| taskflow-web | Aplicação React. |

### 7.4 Estrutura de pastas do front-end

| Pasta | Objetivo |
|---|---|
| src/components | Componentes reutilizáveis. |
| src/pages | Páginas principais. |
| src/services | Cliente HTTP e integração com a API. |
| src/hooks | Hooks personalizados. |
| src/types | Tipos e contratos TypeScript. |
| src/routes | Configuração de rotas. |
| src/utils | Funções auxiliares. |

### 7.5 Boas práticas arquiteturais

- Não colocar regra de negócio dentro de controller ou componente React.
- Usar DTOs para entrada e saída da API, evitando expor entidades diretamente.
- Centralizar validações importantes no back-end.
- Padronizar respostas de erro.
- Usar migrations para evolução do banco.
- Separar contrato e implementação por interface quando isso trouxer clareza.
- Começar simples e só adicionar abstrações quando houver necessidade real.

## 8. API sugerida

| Método | Rota | Objetivo |
|---|---|---|
| POST | /api/auth/register | Cadastrar usuário. |
| POST | /api/auth/login | Autenticar e gerar JWT. |
| GET | /api/tasks | Listar tarefas com filtros. |
| GET | /api/tasks/{id} | Buscar tarefa por id. |
| POST | /api/tasks | Criar tarefa. |
| PUT | /api/tasks/{id} | Atualizar tarefa. |
| PATCH | /api/tasks/{id}/status | Alterar status. |
| DELETE | /api/tasks/{id} | Excluir logicamente. |
| GET | /api/categories | Listar categorias. |
| POST | /api/categories | Criar categoria. |
| GET | /api/dashboard/summary | Retornar resumo para dashboard. |

## 9. Segurança, qualidade e observabilidade

- Armazenar senhas apenas com hash seguro.
- Proteger rotas privadas com JWT.
- Validar ownership: um usuário só pode acessar os próprios dados.
- Registrar logs de erros no back-end.
- Usar tratamento global de exceções.
- Criar testes unitários para regras de negócio e testes de integração para fluxos principais.
- Aplicar lint/format no front-end e análise estática no back-end.

## 10. Estratégia de testes

| Tipo de teste | Exemplos |
|---|---|
| Unitário | Validação de regras de tarefa, mudança de status, datas e prioridade. |
| Integração | Criação de tarefa na API e persistência no banco. |
| Front-end | Renderização de lista, formulário e tratamento de erro. |
| Manual | Fluxo completo de cadastro, login, criação e conclusão de tarefa. |

## 11. Etapas de desenvolvimento

| Etapa | Entregáveis |
|---|---|
| 1. Planejamento | Definição do escopo, documentação, modelagem e backlog. |
| 2. Setup do repositório | Solução .NET, projeto React, Git, README e convenções. |
| 3. Domínio e aplicação | Entidades, casos de uso, validações e contratos. |
| 4. Infraestrutura | DbContext, migrations, repositórios e autenticação. |
| 5. API | Endpoints, Swagger, tratamento de erro e testes de integração. |
| 6. Front-end | Telas de login, dashboard, lista e formulário de tarefas. |
| 7. Qualidade | Testes, refatorações, seed de dados e melhorias de UX. |
| 8. Publicação | Deploy, documentação final e apresentação do projeto. |

### 11.1 Ordem sugerida de implementação

- Criar o repositório e estruturar a solução.
- Modelar User, Task e Category.
- Configurar SQL Server e migrations.
- Implementar cadastro e login com JWT.
- Implementar CRUD de tarefas.
- Implementar filtros, dashboard e categorias.
- Construir o front-end consumindo a API.
- Criar testes e revisar código.
- Publicar e documentar o projeto.

## 12. Backlog inicial do produto

| Prioridade | Item |
|---|---|
| Alta | Cadastro e login. |
| Alta | CRUD de tarefas. |
| Alta | Filtro por status. |
| Alta | Dashboard resumido. |
| Média | Categorias. |
| Média | Ordenação por prazo e prioridade. |
| Média | Testes de integração. |
| Baixa | Tema claro/escuro. |
| Baixa | Etiquetas múltiplas. |

## 13. Critérios de pronto

- Código versionado e organizado por feature/camada.
- Migrações funcionando em ambiente limpo.
- Endpoints testados e documentados no Swagger.
- Front-end integrado com tratamento de loading e erro.
- README com instruções claras de execução.
- Pelo menos uma bateria básica de testes automatizados.
- Projeto publicado com link acessível para demonstração.

## 14. Padrões e boas práticas recomendadas

- SOLID para organização de classes e responsabilidades.
- Repository Pattern apenas se fizer sentido sobre o EF Core; evitar abstrações desnecessárias.
- Result pattern ou padrão de resposta para controlar sucesso e erro de casos de uso.
- Middleware global para exceções.
- FluentValidation para validações de request.
- AutoMapper somente se simplificar o mapeamento; não usar por obrigação.
- Commits pequenos, branchs por funcionalidade e Pull Requests bem descritivos.

## 15. Roteiro de aprendizado

| Trilha | Foco prático no projeto |
|---|---|
| .NET e C# | Classes, interfaces, LINQ, async/await, DI, Web API. |
| Banco de dados | Modelagem relacional, chaves, índices, migrations e consultas. |
| React | Componentes, hooks, estado, formulários, rotas e consumo de API. |
| Arquitetura | Camadas, DDD tático, SOLID, Clean Architecture. |
| Testes | xUnit/NUnit, testes de integração e depuração. |
| Git e GitHub | Commits, branches, README, issues e apresentação do projeto. |
