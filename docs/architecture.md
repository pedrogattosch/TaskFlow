# Arquitetura — TaskFlow

## 1. Visão arquitetural

O TaskFlow será desenvolvido com uma arquitetura em camadas, inspirada em Clean Architecture, com separação clara de responsabilidades entre domínio, aplicação, infraestrutura, API, cross-cutting, testes e front-end.

Essa abordagem foi escolhida para manter o projeto organizado, facilitar a manutenção, permitir evolução incremental e demonstrar boas práticas de desenvolvimento.

---

## 2. Stack

### Back-end
- .NET
- ASP.NET Core Web API
- Entity Framework Core
- SQL Server
- JWT para autenticação
- Swagger para documentação da API

### Front-end
- React
- TypeScript
- Consumo da API via HTTP

### Testes
- xUnit
- Testes unitários
- Testes de integração

---

## 3. Estrutura da solução

A solução deverá ser organizada da seguinte forma:

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

---

## 4. Responsabilidade de cada camada

### TaskFlow.Domain
Responsável por representar o núcleo do sistema.

Deve conter:
- entidades
- enums
- regras de negócio
- contratos essenciais
- exceções de domínio

Essa camada não deve depender de infraestrutura, banco de dados ou framework de interface.

### TaskFlow.Application
Responsável pelos casos de uso da aplicação.

Deve conter:
- serviços de aplicação
- DTOs
- validações
- contratos de entrada e saída
- orquestração do fluxo da aplicação

Essa camada coordena o uso do domínio sem conter detalhes técnicos de persistência.

### TaskFlow.Infrastructure
Responsável pela implementação técnica.

Deve conter:
- DbContext
- mapeamentos do EF Core
- repositórios
- autenticação JWT
- acesso a banco de dados
- migrations
- serviços externos

### TaskFlow.CrossCutting
Responsável por concentrar configurações e componentes transversais da aplicação.

Deve conter:
- injeção de dependência
- registro de serviços
- configurações compartilhadas
- utilitários transversais
- abstrações reutilizáveis entre camadas
- centralização de políticas comuns

Essa camada deve existir apenas quando realmente contribuir com organização e clareza, evitando virar um repositório genérico de código solto.

### TaskFlow.API
Responsável pela exposição dos endpoints HTTP.

Deve conter:
- controllers ou endpoints
- configuração de DI
- middlewares
- Swagger
- tratamento global de exceções
- autenticação e autorização

### TaskFlow.UnitTests
Responsável por validar regras de negócio e comportamentos isolados.

Deve conter testes para:
- entidades
- regras de domínio
- validações
- casos de uso

### TaskFlow.IntegrationTests
Responsável por validar o comportamento integrado da aplicação.

Deve conter testes para:
- endpoints
- persistência
- autenticação
- fluxos principais entre API, Application e Infrastructure

### Front-end
Responsável pela interface com o usuário.

Deve conter:
- páginas
- componentes reutilizáveis
- rotas
- hooks
- serviços de integração com a API
- tratamento de loading e erro

---

## 5. Fluxo da aplicação

1. O usuário interage com a interface React.
2. O front-end envia requisições para a API.
3. A API recebe a requisição e encaminha para a camada de Application.
4. A camada de Application executa o caso de uso.
5. O domínio aplica as regras de negócio.
6. A Infrastructure persiste ou consulta os dados no SQL Server.
7. Componentes transversais podem ser resolvidos via CrossCutting, quando necessário.
8. A resposta retorna para a API e depois para o front-end.

---

## 6. Requisitos do sistema

### 6.1 Requisitos funcionais

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

### 6.2 Requisitos não funcionais

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

---

## 7. Regras de negócio

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

---

## 8. Entidades principais

### User
Representa o usuário autenticado do sistema.

Campos principais:
- Id
- Name
- Email
- PasswordHash
- CreatedAt
- UpdatedAt

### Task
Representa a tarefa cadastrada no sistema.

Campos principais:
- Id
- UserId
- CategoryId
- Title
- Description
- Priority
- Status
- DueDate
- CompletedAt
- IsDeleted
- CreatedAt
- UpdatedAt

### Category
Representa uma categoria usada para agrupar tarefas.

Campos principais:
- Id
- UserId
- Name
- Color
- CreatedAt

---

## 9. Banco de dados

O banco de dados será relacional, utilizando SQL Server.

### Tabelas principais
- Users
- Tasks
- Categories

### Relacionamentos
- Users possui relação 1:N com Tasks
- Users possui relação 1:N com Categories
- Categories possui relação 1:N com Tasks
- Tasks possui Category opcional

### Índices recomendados
- índice único em Users.Email
- índice composto em Tasks(UserId, Status)
- índice composto em Tasks(UserId, DueDate)
- índice em Categories(UserId, Name)

---

## 10. API inicial sugerida

### Autenticação
- `POST /api/auth/register`
- `POST /api/auth/login`

### Tarefas
- `GET /api/tasks`
- `GET /api/tasks/{id}`
- `POST /api/tasks`
- `PUT /api/tasks/{id}`
- `PATCH /api/tasks/{id}/status`
- `DELETE /api/tasks/{id}`

### Categorias
- `GET /api/categories`
- `POST /api/categories`

### Dashboard
- `GET /api/dashboard/summary`

---

## 11. Padrões e diretrizes

- não colocar regra de negócio em controllers
- não expor entidades diretamente na API
- usar DTOs para entrada e saída
- centralizar validações importantes no back-end
- usar migrations para evolução do banco
- manter código simples e legível
- evitar abstrações desnecessárias
- criar commits pequenos e descritivos
- preferir organização por responsabilidade e clareza
- usar CrossCutting apenas para preocupações realmente transversais

---

## 12. Qualidade e segurança

- senhas devem ser armazenadas com hash seguro
- rotas privadas devem usar JWT
- cada usuário só poderá acessar os próprios dados
- erros devem ser tratados globalmente
- logs de erro devem ser registrados
- testes unitários devem validar regras críticas
- testes de integração devem cobrir fluxos principais

---

## 13. Estratégia de testes

### Testes unitários
Devem validar comportamentos isolados do domínio e da aplicação, como:
- validação de título da tarefa
- mudança de status
- regras de prioridade
- regras de prazo
- validações de entrada

### Testes de integração
Devem validar o comportamento do sistema funcionando em conjunto, como:
- cadastro de usuário
- login
- criação de tarefa pela API
- alteração de status
- persistência em banco
- proteção de rotas autenticadas

---

## 14. Objetivo arquitetural

A arquitetura do TaskFlow deve ser simples o suficiente para permitir aprendizado e evolução contínua, mas robusta o bastante para servir como projeto de portfólio com estrutura profissional.
