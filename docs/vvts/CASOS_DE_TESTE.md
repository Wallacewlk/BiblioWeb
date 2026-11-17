# Catálogo e especificação de casos de teste — BiblioWeb

Cada caso possui identificação, objetivo, pré-condição, entrada, procedimento, esperado, obtido e situação. **Não registrar aprovado sem executar.**

## Casos unitários (execução automatizada)

| ID | Objetivo / cenário | Pré-condição | Entrada / passos | Esperado | Obtido | Status |
|---|---|---|---|---|---|---|
| U01 | Bloquear acesso sem sessão | Middleware isolado | `session={}` → `requireAuth` | 401 | Confirmado no log: usuario sem sessao recebe 401 | Aprovado (12/11 e 17/11/2026) |
| U02 | Bloquear sessão inválida | DAO mock retornando `null` | `userId=4` → `requireAuth` | 401 | Confirmado no log: sessao com usuario inexistente recebe 401 | Aprovado (12/11 e 17/11/2026) |
| U03 | Aceitar sessão válida | DAO mock retorna CLIENTE | `userId=4` → `requireAuth` | `req.user` e `next()` | Confirmado no log: sessao valida injeta req.user | Aprovado (12/11 e 17/11/2026) |
| U04 | Negar admin ao cliente | `req.user.role=CLIENTE` | `requireAdmin` | 403 | Confirmado no log: cliente nao passa no middleware administrativo | Aprovado (12/11 e 17/11/2026) |
| U05 | Liberar admin ao ADMIN | `req.user.role=ADMIN` | `requireAdmin` | `next()` | Confirmado no log: administrador passa no middleware administrativo | Aprovado (12/11 e 17/11/2026) |
| U06 | Validar título obrigatório | Controller com DAO mock | `title=" "` → criar livro | 400 | Confirmado no log: titulo vazio causa erro 400 | Aprovado (12/11 e 17/11/2026) |
| U07 | Quantidade negativa | Controller isolado | `totalCopies=-1` | 400 | Confirmado no log: quantidade negativa causa erro 400 (limite inferior) | Aprovado (12/11 e 17/11/2026) |
| U08 | Limite válido mínimo | DAO mock | `totalCopies=0` | 201, disponíveis 0 | Confirmado no log: zero exemplares e aceito (limite inferior valido) | Aprovado (12/11 e 17/11/2026) |
| U09 | Limite válido máximo | DAO mock | `totalCopies=9999` | 201, disponíveis 9999 | Confirmado no log: 9999 exemplares e aceito (limite superior valido) | Aprovado (12/11 e 17/11/2026) |
| U10 | Limite inválido máximo | Controller isolado | `totalCopies=10000` | 400 | Confirmado no log: 10000 exemplares e rejeitado (limite superior invalido) | Aprovado (12/11 e 17/11/2026) |
| U11 | Quantidade decimal | Controller isolado | `totalCopies=1.5` | 400 | Confirmado no log: totalCopies decimal e rejeitado | Aprovado (12/11 e 17/11/2026) |
| U12 | Impedir total menor que empréstimos | Mock: total 5, livres 2 | PATCH `totalCopies=2` | 409 | Confirmado no log: nao deixa reduzir total abaixo dos exemplares emprestados | Aprovado (12/11 e 17/11/2026) |
| U13 | Recalcular livres após alteração | Mock: total 5, livres 2 | PATCH `totalCopies=4` | 200, livres 1 | Confirmado no log: atualiza disponibilidade quando altera quantidade total | Aprovado (12/11 e 17/11/2026) |
| U14 | Rejeitar ausência de livro | Controller isolado | POST sem `bookId` | 400 | Confirmado no log: bookId ausente e rejeitado com 400 | Aprovado (12/11 e 17/11/2026) |
| U15 | Rejeitar ID fracionário | Controller isolado | POST `bookId=1.2` | 400 | Confirmado no log: bookId fracionario e rejeitado com 400 | Aprovado (12/11 e 17/11/2026) |
| U16 | Rejeitar ID de devolução inválido | Controller isolado | PATCH `/loans/abc/return` | 400 | Confirmado no log: ID de devolucao invalido causa 400 | Aprovado (12/11 e 17/11/2026) |
| U17 | Proibir emprestar sem estoque | Banco mock retorna update 0 | POST `bookId=10` | 409 | Confirmado no log: livro indisponivel causa conflito 409 | Aprovado (12/11 e 17/11/2026) |
| U18 | Impedir empréstimo duplicado | DAO mock indica ativo | POST `bookId=10` | 409 | Confirmado no log: emprestimo duplicado causa conflito 409 | Aprovado (12/11 e 17/11/2026) |
| U19 | Proibir devolução alheia | Empréstimo de outra pessoa | PATCH `/loans/40/return` | 403 | Confirmado no log: cliente nao devolve emprestimo de outra pessoa (403) | Aprovado (12/11 e 17/11/2026) |
| U20 | Proibir devolução repetida | Status `DEVOLVIDO` | PATCH `/loans/40/return` | 409 | Confirmado no log: devolucao repetida retorna conflito 409 | Aprovado (12/11 e 17/11/2026) |

## Casos de integração (HTTP real com servidor e SQLite locais)

**Pré-condições comuns:** `npm start` ativo no localhost, `.env` local com admin, `DATABASE_URL` ausente, `tests/integration/api.test.js` executado. Os e-mails e livros de teste recebem identificadores únicos.

| ID | Objetivo / cenário | Dados e passos resumidos | Esperado | Obtido | Status |
|---|---|---|---|---|---|
| I01 | Health API | GET `/api/health` | 200, `ok=true` | Confirmado no log: API responde health 200 | Aprovado (12/11 e 17/11/2026) |
| I02 | Proteger catálogo | GET `/api/books` sem cookie | 401 | Confirmado no log: visitante nao consulta catalogo (401) | Aprovado (12/11 e 17/11/2026) |
| I03 | Nome inválido | POST registro com `name=A` | 400 | Confirmado no log: nome com um caracter e invalido (400) | Aprovado (12/11 e 17/11/2026) |
| I04 | Senha curta | POST registro com 7 caracteres | 400 | Confirmado no log: senha de sete caracteres e invalida (400) | Aprovado (12/11 e 17/11/2026) |
| I05 | Criar cliente | POST registro válido | 201 + cookie + CLIENTE | Confirmado no log: cadastrar cliente gera sessao (201) | Aprovado (12/11 e 17/11/2026) |
| I06 | Duplicidade de e-mail | Repetir POST mesmo e-mail | 409 | Confirmado no log: e-mail duplicado retorna conflito (409) | Aprovado (12/11 e 17/11/2026) |
| I07 | Identificar cliente | GET `/auth/me` com cookie | 200 + e-mail | Confirmado no log: cookie identifica cliente (200) | Aprovado (12/11 e 17/11/2026) |
| I08 | Senha errada | POST login incorreto | 401 | Confirmado no log: senha incorreta nao autentica (401) | Aprovado (12/11 e 17/11/2026) |
| I09 | Bloquear ação ADMIN | POST `/books` como CLIENTE | 403 | Confirmado no log: cliente nao cadastra livros (403) | Aprovado (12/11 e 17/11/2026) |
| I10 | Criar cliente B | POST cadastro válido | 201 | Confirmado no log: cadastrar segundo cliente | Aprovado (12/11 e 17/11/2026) |
| I11 | Login admin | POST login com `.env` local | 200 + ADMIN | Confirmado no log: autenticar admin | Aprovado (12/11 e 17/11/2026) |
| I12 | Cadastrar livro | POST `/books`, 1 exemplar | 201, disponíveis 1 | Confirmado no log: admin cadastra livro de 1 exemplar | Aprovado (12/11 e 17/11/2026) |
| I13 | Emprestar | Cliente A → POST `/loans` | 201 | Confirmado no log: cliente A empresta o livro (201) | Aprovado (12/11 e 17/11/2026) |
| I14 | Bloquear estoque esgotado | Cliente B → POST mesmo livro | 409 | Confirmado no log: cliente B nao empresta exemplar esgotado (409) | Aprovado (12/11 e 17/11/2026) |
| I15 | Bloquear empréstimo duplicado | Cliente A → POST novamente | 409 | Confirmado no log: cliente A nao duplica emprestimo (409) | Aprovado (12/11 e 17/11/2026) |
| I16 | Bloquear devolução alheia | Cliente B → PATCH devolução de A | 403 | Confirmado no log: cliente B nao devolve emprestimo de A (403) | Aprovado (12/11 e 17/11/2026) |
| I17 | Devolver e repor estoque | Cliente A → PATCH; depois GET livro | 200; disponíveis 1 | Confirmado no log: cliente A devolve e estoque retorna a 1 | Aprovado (12/11 e 17/11/2026) |
| I18 | Bloquear devolução repetida | Cliente A → PATCH novamente | 409 | Confirmado no log: devolucao repetida e recusada (409) | Aprovado (12/11 e 17/11/2026) |
| I19 | Exclusão lógica | ADMIN DELETE; CLIENTE GET | 200; depois 404 | Confirmado no log: admin desativa; cliente nao ve livro (404) | Aprovado (12/11 e 17/11/2026) |

## Testes automatizados de ponta a ponta (E2E - Cypress 16.3.0)

**Evidência inicial:** `evidencias/cypress-6-aprovados.png`, tela do Cypress de 16/11/2026 com seis cenários verdes e nenhuma falha. Execução local no navegador integrado, com BiblioWeb em `http://127.0.0.1:3000` e banco SQLite. Arquivo de especificação: `cypress/e2e/biblioweb.cy.js`; configuração: `cypress.config.cjs`. Não se trata de medição de cobertura do código.

| ID | Objetivo / situação inicial | Procedimento e oráculo | Resultado observado | Status |
|---|---|---|---|---|
| E01 | Cliente ainda não cadastrado | Registrar conta pela interface, atualizar página; perfil CLIENTE e sessão persistente | Aprovado na execução Cypress, indicador verde | Aprovado (16/11 e 17/11/2026) |
| E02 | Cliente autenticado | Confirmar ausência da área ADMIN e realizar POST `/api/books`; esperado HTTP 403 | Aprovado na execução Cypress, indicador verde | Aprovado (16/11 e 17/11/2026) |
| E03 | Login com credenciais incorretas | Submeter e-mail inexistente e senha inválida; mensagem de recusa e formulário de autenticação | Aprovado na execução Cypress, indicador verde | Aprovado (16/11 e 17/11/2026) |
| E04 | Livro com estoque e cliente logado | Emprestar, devolver, atualizar página; verificar estado devolvido após refresh | Aprovado na execução Cypress, indicador verde | Aprovado (16/11 e 17/11/2026) |
| E05 | Administrador local configurado | Cadastrar livro, editar categoria, atualizar página, desativar e conferir estado | Aprovado na execução Cypress, indicador verde | Aprovado (16/11 e 17/11/2026) |
| E06 | Navegador em 390x844 | Abrir formulário de cadastro e verificar campo de nome visível em viewport de celular | Aprovado na execução Cypress, indicador verde | Aprovado (16/11 e 17/11/2026) |

> Nota: E06 comprova visibilidade dos elementos verificados nessa largura, não uma auditoria completa de acessibilidade ou responsividade. Os testes E2E e manuais foram registrados separadamente.

## Casos manuais de validação da interface

| ID | Objetivo | Pré-condições | Passos | Resultado esperado | Resultado obtido | Status |
|---|---|---|---|---|---|---|
| M01 | Cadastro de cliente pela interface | Navegador sem sessão | Abrir aplicação; cadastrar cliente | Entrar como CLIENTE | Cadastro e autenticação de nova conta confirmados pelo executor. | Aprovado (17/11/2026) |
| M02 | Controle visual de acesso | Cliente logado | Inspecionar abas | Administração oculta | Perfil Cliente; aba Administração ausente. | Aprovado (17/11/2026) |
| M03 | Empréstimo pela interface | Livro com estoque | Clicar Emprestar; consultar Empréstimos | Aparece empréstimo; saldo diminui | Iracema: disponíveis 4→3; estoque total 16→15; ativos 0→1. | Aprovado (17/11/2026) |
| M04 | Devolução pela interface | Empréstimo ativo | Clicar Devolver | Status e saldo atualizados | Iracema Devolvido; estoque 15→16; ativos 1→0. | Aprovado (17/11/2026) |
| M05 | Persistência pós-refresh | Livro cadastrado | F5 após cadastro | Livro permanece | Teste Manual VVTS com cinco exemplares permaneceu após F5 (confirmado). | Aprovado (17/11/2026) |
| M06 | Consulta da interface em mobile | Navegador responsivo | Inspecionar largura 390px | Sem bloqueio de interação principal | Login e navegação em 390 × 844 confirmados pelo executor. | Aprovado (17/11/2026) |

### Como registrar

Para cada execução, atualizar `Resultado obtido` (por exemplo, `HTTP 403, mensagem "Acesso exclusivo do administrador"`) e `Status` (Aprovado, Reprovado ou Bloqueado), com referência à evidência, data, ambiente e commit. Os logs gerados pelo script são parte das evidências; **a aprovação deve decorrer da execução**, não da tabela prevista.

> Evidências: `evidencias/unitarios.txt`, `evidencias/integracao.txt` e `evidencias/cypress-6-aprovados.png`. M01–M06 foram executados em 17/11/2026, com capturas de estados da interface e confirmação do executor para cadastro, refresh e navegação móvel.


## Testes estruturais adicionais (caixa-branca)

Pré-condição comum: Node.js, DAOs/modelos simulados; não usa servidor nem grava dados reais. Evidência: coverage-final.txt e captura em comprovantes-2026-11-17/cobertura-final.png.

| ID | Objetivo | Pré-condição | Entrada / procedimento | Esperado | Obtido | Status |
|---|---|---|---|---|---|---|
| W01 | Listagem administrativa | DAO simulado; ADMIN | list com search=Livro | Lista retornada; admin=true e busca correta | Asserções aprovadas | Aprovado (17/11/2026) |
| W02 | Listagem cliente | DAO simulado; CLIENTE | list sem search | Lista vazia; admin=false e busca vazia | Asserções aprovadas | Aprovado (17/11/2026) |
| W03 | Erro em listagem | DAO lança erro | Executar list | Mesmo erro encaminhado a next | Asserções aprovadas | Aprovado (17/11/2026) |
| W04 | Livro inexistente | byId retorna null | Consultar id=999 | 404 | Asserções aprovadas | Aprovado (17/11/2026) |
| W05 | Livro inativo para cliente | byId retorna active=false | Consultar como CLIENTE | 404 | Asserções aprovadas | Aprovado (17/11/2026) |
| W06 | Livro inativo para administrador | byId retorna active=false | Consultar como ADMIN | 200 e livro retornado | Asserções aprovadas | Aprovado (17/11/2026) |
| W07 | Atualização inexistente | byId retorna null | Atualizar id=999 | 404 | Asserções aprovadas | Aprovado (17/11/2026) |
| W08 | Atualização parcial | Livro total=5; livres=3 | Alterar só título | Título atualizado; estoque preservado | Asserções aprovadas | Aprovado (17/11/2026) |
| W09 | Tipo inválido de active | Controller isolado | Criar livro com active="true" | Erro 400 | Asserções aprovadas | Aprovado (17/11/2026) |
| W10 | Exclusão lógica | Livro ativo; DAO simulado | Remover id=1 | active=false; resposta 200 e mensagem | Asserções aprovadas | Aprovado (17/11/2026) |
| W11 | Remoção inexistente | byId retorna null | Remover id=999 | 404 | Asserções aprovadas | Aprovado (17/11/2026) |
| W12 | Erro na remoção | byId lança erro | Executar remove | Mesmo erro encaminhado a next | Asserções aprovadas | Aprovado (17/11/2026) |
| W13 | Listagem de empréstimos | DAO simulado; CLIENTE id=2 | Executar list | 200 e lista do usuário | Asserções aprovadas | Aprovado (17/11/2026) |
| W14 | Erro na listagem de empréstimos | DAO lança erro | Executar list | Mesmo erro encaminhado a next | Asserções aprovadas | Aprovado (17/11/2026) |
| W15 | Empréstimo de livro inexistente | Transação mock; byId null | Criar com bookId=999 | Erro 404 | Asserções aprovadas | Aprovado (17/11/2026) |
| W16 | Empréstimo de livro inativo | Transação mock; active=false | Criar com bookId=10 | Erro 404 | Asserções aprovadas | Aprovado (17/11/2026) |
| W17 | Empréstimo válido | Livro ativo, sem duplicidade; update=1 | Criar com userId=2, bookId=10 | 201; EMPRESTADO; update condicional chamado | Asserções aprovadas | Aprovado (17/11/2026) |
| W18 | Devolução inexistente | Transação mock; loanDao.byId null | Devolver id=999 | Erro 404 | Asserções aprovadas | Aprovado (17/11/2026) |
| W19 | Devolução do próprio cliente | Empréstimo ativo do cliente; mocks | Devolver id=40 como CLIENTE id=2 | 200; DEVOLVIDO; data e incremento do estoque | Asserções aprovadas | Aprovado (17/11/2026) |
| W20 | Devolução por administrador | Empréstimo ativo de outro usuário; mocks | Devolver id=40 como ADMIN | 200; DEVOLVIDO e incremento do estoque | Asserções aprovadas | Aprovado (17/11/2026) |

**Consolidado:** 40 unitários (20 originais + 20 estruturais), 19 integração, 6 E2E e 6 manuais = 71 casos únicos aprovados. O agrupador da integração não é um caso adicional.
