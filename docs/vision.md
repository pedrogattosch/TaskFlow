# Visão — TaskFlow

## 1. Objetivo

O objetivo do TaskFlow é permitir que usuários gerenciem suas tarefas de forma clara, organizada e eficiente, acompanhando o ciclo de vida de cada tarefa.

Além disso, o projeto serve como portfólio técnico, evidenciando:

- desenvolvimento com .NET e ASP.NET Core;
- integração com SQL Server por Entity Framework Core;
- construção de APIs REST;
- autenticação com JWT;
- hash de senha com PBKDF2;
- consumo de API com React e TypeScript;
- organização em camadas inspirada em Clean Architecture;
- execução local com Docker Compose;
- testes unitários e testes de integração;
- boas práticas de código, documentação e versionamento.

---

## 2. Público-alvo

Usuários que desejam organizar tarefas pessoais de forma simples, com controle de:

- status;
- prioridade;
- prazos;
- categorias.

O sistema é voltado inicialmente para uso individual. Cada usuário autenticado acessa seus próprios dados de tarefas e categorias.

---

## 3. Escopo atual

Funcionalidades implementadas:

- cadastro de usuário;
- login e autenticação com JWT;
- emissão e validação de token;
- criação, listagem, edição, alteração de status e exclusão lógica de tarefas;
- filtros por status, prioridade e categoria;
- ordenação por prazo e prioridade;
- resumo de tarefas por status;
- criação, listagem, edição e exclusão de categorias;
- criação de categoria diretamente no fluxo de tarefas;
- interface protegida com rotas públicas e privadas;
- visualização de tarefas em lista;
- visualização de tarefas em kanban com drag and drop;
- suporte a tema claro/escuro;
- health check em `/health`;
- Swagger em ambiente de desenvolvimento;
- execução local sem Docker;
- execução local com Docker;
- testes unitários de domínio e aplicação;
- testes de integração da API com SQLite em memória.

---

## 4. Escopo da versão 1.0

O núcleo funcional previsto para a versão 1.0 está majoritariamente implementado.

Itens já cobertos:

- cadastro de usuário;
- login e autenticação com JWT;
- criação de tarefas;
- edição de tarefas;
- exclusão lógica;
- listagem com filtros;
- ordenação;
- alteração de status;
- dashboard/resumo por status;
- categorização de tarefas;
- interface web integrada à API;
- execução local documentada;
- testes automatizados do back-end.

Itens ainda pendentes ou opcionais para consolidar a versão 1.0:

- endpoint dedicado para consulta de tarefa por id, caso seja necessário para consumo externo ou evolução da interface;
- middleware global de exceções, substituindo o tratamento repetido nos controllers;
- seed de dados para demonstração local;
- testes automatizados do front-end;
- publicação de um ambiente de demonstração.

---

## 5. Funcionalidades futuras

- etiquetas múltiplas;
- subtarefas;
- comentários;
- histórico detalhado de alterações;
- compartilhamento de tarefas;
- notificações;
- ambiente público de demonstração.

---

## 6. Problema resolvido

Centralizar o gerenciamento de tarefas em um único sistema simples e eficiente, substituindo métodos dispersos como anotações, planilhas ou aplicativos sem integração com o fluxo completo de organização.

---

## 7. Valor entregue

- organização pessoal;
- controle de prioridades;
- acompanhamento de progresso;
- separação de tarefas por categorias;
- visualização por lista e kanban;
- resumo rápido do estado das tarefas;
- experiência web integrada a uma API real;
- base técnica adequada para evolução incremental.

---

## 8. Critérios de sucesso

- fluxo completo de tarefas funcionando;
- autenticação implementada;
- API funcional e documentada;
- front-end integrado;
- projeto executável localmente;
- execução via Docker Compose disponível;
- testes relevantes passando;
- código organizado e versionado;
- documentação consistente com o estado real do projeto.
