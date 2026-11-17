# Plano de Verificação, Validação e Testes — BiblioWeb

**Disciplina:** Verificação, Validação e Teste de Software (VV&TS)  
**Instituição:** UFMS  
**Aplicação:** BiblioWeb — Sistema de Biblioteca  
**Repositório:** https://github.com/Wallacewlk/BiblioWeb  
**URL de demonstração:** https://biblioweb-wallace.onrender.com  
**Versões de referência:** 2369696 (base), c090365 (regressão), ea93de8 (testes estruturais), 06c8e87 (CI).

> **Atualização de 17/11/2026:** 40 unitários (20 originais + 20 caixa-branca), 19 de integração/API, 6 E2E e 6 manuais: **71 aprovados, 0 falhas nas execuções documentadas**. Cobertura e CI medidos; riscos remanescentes descritos.

## 1. Objetivo e distinção entre verificação e validação

- **Verificação:** conferir se o software foi construído de acordo com requisitos, especificações e regras (ex.: cliente não pode fazer POST administrativo).
- **Validação:** conferir se o produto atende ao uso esperado de uma biblioteca (ex.: emprestar um livro e devolvê-lo, com estoque correto).
- **Teste:** executar o software com entradas controladas e comparar o resultado real com o esperado.

## 2. Escopo e funcionalidades selecionadas

1. Cadastro de cliente e validação dos dados.
2. Login, sessão, cookie e logout.
3. Autorização de perfis CLIENTE e ADMIN.
4. CRUD de livros (cadastro, listagem, alteração e desativação lógica).
5. Empréstimos, disponibilidade e prevenção de duplicações.
6. Devolução, atualização de estoque e proteção contra acesso a empréstimo alheio.
7. Códigos HTTP e respostas JSON da API.
8. Integração frontend, Express e SQLite local (PostgreSQL em produção). 

**Fora do escopo da suíte automatizada:** carga massiva, infraestrutura do Render, qualidade de interface em todos os navegadores, acessibilidade integral e exploração de segurança invasiva. Essas dimensões exigem estratégia adicional e não devem ser declaradas aprovadas sem evidências.

## 3. Estratégia e níveis de teste

| Nível/técnica | Ferramenta | Ambiente | Evidência |
|---|---|---|---|
| Unitário | `node:test` + `assert` + mocks nativos | Node.js local; sem abrir servidor | `evidencias/unitarios.txt` |
| Integração | `node:test` + `fetch` HTTP real | Express + sessão + SQLite local | `evidencias/integracao.txt` |
| Funcional/caixa-preta | Partição de equivalência e valores-limite | API e interface | casos documentados e capturas |
| API REST | `fetch` e códigos HTTP | servidor local | respostas 200, 201, 400, 401, 403, 404, 409 |
| E2E em navegador | `Cypress 16.3.0` | Browser Electron + Express + SQLite local | `evidencias/cypress-6-aprovados.png` |
| Caixa-branca | node:test, assert, mocks e cobertura V8 | controllers | coverage-final.txt |
| Integração contínua | GitHub Actions | Ubuntu, SQLite, Chrome | runs #1 e #2 |
| Regressão | Reexecução após alteração | ambiente local | logs comparáveis antes/depois |
| Validação manual | Navegador | local ou Render | roteiro e capturas de tela |

**Observação:** o Cypress verifica fluxos reais pela interface e usa `cy.env()` para carregar credenciais administrativas locais por configuração segura. O `npm run smoke` já presente no BiblioWeb é um teste automatizado ponta a ponta da API, mas não substitui testes unitários isolados nem análise formal de técnicas.

## 4. Ambiente e preparação

- Windows, VS Code, Git e Node.js 20+ (a versão do computador do projeto foi 24.19.0).
- Dependências instaladas via `npm install`.
- Um **servidor local** iniciado por `npm start`, usando SQLite local e `NODE_ENV=development`.
- Arquivo `.env` **local** com `ADMIN_EMAIL`, `ADMIN_PASSWORD` e `SESSION_SECRET`, nunca versionado.
- A suíte nova de integração **recusa URL remota ou DATABASE_URL configurada**, para não modificar produção.

### Comandos

Abra o primeiro terminal CMD, na pasta `BiblioWeb`:

```cmd
npm install
npm start
```

Abra um **segundo** CMD e execute:

```cmd
executar-vvts.cmd
```

Evidências: `docs/vvts/evidencias/unitarios.txt`, `docs/vvts/evidencias/integracao.txt` e `docs/vvts/evidencias/cypress-6-aprovados.png`.

Para reproduzir os testes E2E, mantenha `npm.cmd start` ativo no terminal PowerShell e execute, em outro terminal, `npx.cmd cypress open --e2e --browser electron`. Escolha `biblioweb.cy.js`. Execute **apenas** com SQLite local e sem `DATABASE_URL`.

Se preferir executar separadamente:

```cmd
npm run test:coverage
npm run test:integration
npm run test:e2e
```

## 5. Critérios de entrada

- Aplicação local inicia sem erro.
- Dependências npm instaladas.
- Banco local separado da produção.
- Administrador de demonstração configurado no ambiente local.
- Rotas do software e código de testes presentes no repositório.
- Casos de teste revisados e IDs definidos.

## 6. Critérios de saída

- 100% dos casos de prioridade **alta** executados; falhas críticas corrigidas ou explicitamente registradas.
- Nenhum defeito crítico em aberto que impeça os principais fluxos de login, empréstimo e devolução.
- Resultados esperados e obtidos registrados; falhas não podem ser omitidas.
- Evidências anexadas ao repositório, sem senhas e sem URL privada do banco.
- Regressão executada após correções.

## 7. Técnicas de caixa-preta

### Partição de equivalência — cadastro

- **Válida:** nome de 2 a 100 caracteres, e-mail em formato aceito, senha com 8+ caracteres.
- **Inválida:** nome vazio/1 caractere/mais de 100; e-mail sem formato; senha de 0 a 7; e-mail repetido.

### Valor-limite — livros

No controller de livros, `totalCopies` deve ser inteiro entre 0 e 9999, inclusive.

| Entrada | Classe | Esperado |
|---:|---|---|
| -1 | Inválida inferior | HTTP 400 |
| 0 | Válida inferior | HTTP 201 |
| 1 | Válida | HTTP 201 |
| 9999 | Válida superior | HTTP 201 |
| 10000 | Inválida superior | HTTP 400 |
| 1.5 | Inválida (não inteiro) | HTTP 400 |

### Tabela de decisão — empréstimo

| Livro existe/ativo? | Já possui empréstimo ativo? | Há exemplares? | Resultado |
|---|---|---|---|
| Não | - | - | 404 |
| Sim | Sim | - | 409 |
| Sim | Não | Não | 409 |
| Sim | Não | Sim | 201 + decrementa estoque |

### Tabela de decisão — devolução

| Empréstimo existe? | Solicitante é dono ou ADMIN? | Já devolvido? | Resultado |
|---|---|---|---|
| Não | - | - | 404 |
| Sim | Não | - | 403 |
| Sim | Sim | Sim | 409 |
| Sim | Sim | Não | 200 + incrementa estoque |

## 8. Limitações e riscos

- Testes com mocks comprovam decisões do controller isolado, não substituem teste real de transações SQL.
- Os testes HTTP usam banco local SQLite; ambiente de produção usa PostgreSQL. É necessário documentar essa diferença.
- Há Cypress e CI confirmados. A cobertura V8 (91,98% linhas; 91,95% ramificações; 54,17% funções) refere-se somente aos módulos carregados pela suíte unitária; não inclui todo o frontend, todas as rotas nem o servidor separado. DAOs simulados justificam a baixa cobertura de funções.
- M01–M06 executados em 17/11; estados visuais capturados, com confirmação do executor para cadastro, refresh e navegação móvel. A aprovação é por caso único, não por soma de reexecuções.
- Dependências com alertas de auditoria devem ser avaliadas com `npm audit`; não executar `npm audit fix --force` sem revisar as mudanças.

## 9. Responsabilidades e registro

Para cada execução, registrar data/hora, executor, sistema operacional, versão do Node, commit, base de dados e link dos logs. Se houver grupo, registrar contribuições reais de cada integrante no GitHub.
