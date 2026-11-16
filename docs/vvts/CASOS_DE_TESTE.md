# Catálogo e especificação de casos de teste — BiblioWeb

Cada caso possui identificação, objetivo, pré-condição, entrada, procedimento, esperado, obtido e situação. **Não registrar aprovado sem executar.**

## Casos unitários (execução automatizada)

| ID | Objetivo / cenário | Pré-condição | Entrada / passos | Esperado | Obtido | Status |
|---|---|---|---|---|---|---|
| U01 | Bloquear acesso sem sessão | Middleware isolado | `session={}` → `requireAuth` | 401 | Pendente | Não executado |
| U02 | Bloquear sessão inválida | DAO mock retornando `null` | `userId=4` → `requireAuth` | 401 | Pendente | Não executado |
| U03 | Aceitar sessão válida | DAO mock retorna CLIENTE | `userId=4` → `requireAuth` | `req.user` e `next()` | Pendente | Não executado |
| U04 | Negar admin ao cliente | `req.user.role=CLIENTE` | `requireAdmin` | 403 | Pendente | Não executado |
| U05 | Liberar admin ao ADMIN | `req.user.role=ADMIN` | `requireAdmin` | `next()` | Pendente | Não executado |
| U06 | Validar título obrigatório | Controller com DAO mock | `title=" "` → criar livro | 400 | Pendente | Não executado |
| U07 | Quantidade negativa | Controller isolado | `totalCopies=-1` | 400 | Pendente | Não executado |
| U08 | Limite válido mínimo | DAO mock | `totalCopies=0` | 201, disponíveis 0 | Pendente | Não executado |
| U09 | Limite válido máximo | DAO mock | `totalCopies=9999` | 201, disponíveis 9999 | Pendente | Não executado |
| U10 | Limite inválido máximo | Controller isolado | `totalCopies=10000` | 400 | Pendente | Não executado |
| U11 | Quantidade decimal | Controller isolado | `totalCopies=1.5` | 400 | Pendente | Não executado |
| U12 | Impedir total menor que empréstimos | Mock: total 5, livres 2 | PATCH `totalCopies=2` | 409 | Pendente | Não executado |
| U13 | Recalcular livres após alteração | Mock: total 5, livres 2 | PATCH `totalCopies=4` | 200, livres 1 | Pendente | Não executado |
| U14 | Rejeitar ausência de livro | Controller isolado | POST sem `bookId` | 400 | Pendente | Não executado |
| U15 | Rejeitar ID fracionário | Controller isolado | POST `bookId=1.2` | 400 | Pendente | Não executado |
| U16 | Rejeitar ID de devolução inválido | Controller isolado | PATCH `/loans/abc/return` | 400 | Pendente | Não executado |
| U17 | Proibir emprestar sem estoque | Banco mock retorna update 0 | POST `bookId=10` | 409 | Pendente | Não executado |
| U18 | Impedir empréstimo duplicado | DAO mock indica ativo | POST `bookId=10` | 409 | Pendente | Não executado |
| U19 | Proibir devolução alheia | Empréstimo de outra pessoa | PATCH `/loans/40/return` | 403 | Pendente | Não executado |
| U20 | Proibir devolução repetida | Status `DEVOLVIDO` | PATCH `/loans/40/return` | 409 | Pendente | Não executado |

## Casos de integração (HTTP real com servidor e SQLite locais)

**Pré-condições comuns:** `npm start` ativo no localhost, `.env` local com admin, `DATABASE_URL` ausente, `tests/integration/api.test.js` executado. Os e-mails e livros de teste recebem identificadores únicos.

| ID | Objetivo / cenário | Dados e passos resumidos | Esperado | Obtido | Status |
|---|---|---|---|---|---|
| I01 | Health API | GET `/api/health` | 200, `ok=true` | Pendente | Não executado |
| I02 | Proteger catálogo | GET `/api/books` sem cookie | 401 | Pendente | Não executado |
| I03 | Nome inválido | POST registro com `name=A` | 400 | Pendente | Não executado |
| I04 | Senha curta | POST registro com 7 caracteres | 400 | Pendente | Não executado |
| I05 | Criar cliente | POST registro válido | 201 + cookie + CLIENTE | Pendente | Não executado |
| I06 | Duplicidade de e-mail | Repetir POST mesmo e-mail | 409 | Pendente | Não executado |
| I07 | Identificar cliente | GET `/auth/me` com cookie | 200 + e-mail | Pendente | Não executado |
| I08 | Senha errada | POST login incorreto | 401 | Pendente | Não executado |
| I09 | Bloquear ação ADMIN | POST `/books` como CLIENTE | 403 | Pendente | Não executado |
| I10 | Criar cliente B | POST cadastro válido | 201 | Pendente | Não executado |
| I11 | Login admin | POST login com `.env` local | 200 + ADMIN | Pendente | Não executado |
| I12 | Cadastrar livro | POST `/books`, 1 exemplar | 201, disponíveis 1 | Pendente | Não executado |
| I13 | Emprestar | Cliente A → POST `/loans` | 201 | Pendente | Não executado |
| I14 | Bloquear estoque esgotado | Cliente B → POST mesmo livro | 409 | Pendente | Não executado |
| I15 | Bloquear empréstimo duplicado | Cliente A → POST novamente | 409 | Pendente | Não executado |
| I16 | Bloquear devolução alheia | Cliente B → PATCH devolução de A | 403 | Pendente | Não executado |
| I17 | Devolver e repor estoque | Cliente A → PATCH; depois GET livro | 200; disponíveis 1 | Pendente | Não executado |
| I18 | Bloquear devolução repetida | Cliente A → PATCH novamente | 409 | Pendente | Não executado |
| I19 | Exclusão lógica | ADMIN DELETE; CLIENTE GET | 200; depois 404 | Pendente | Não executado |

## Casos manuais de validação da interface

| ID | Objetivo | Pré-condições | Passos | Resultado esperado | Resultado obtido | Status |
|---|---|---|---|---|---|---|
| M01 | Cadastro de cliente pela interface | Navegador sem sessão | Abrir aplicação; cadastrar cliente | Entrar como CLIENTE | Pendente | Não executado |
| M02 | Controle visual de acesso | Cliente logado | Inspecionar abas | Administração oculta | Pendente | Não executado |
| M03 | Empréstimo pela interface | Livro com estoque | Clicar Emprestar; consultar Empréstimos | Aparece empréstimo; saldo diminui | Pendente | Não executado |
| M04 | Devolução pela interface | Empréstimo ativo | Clicar Devolver | Status e saldo atualizados | Pendente | Não executado |
| M05 | Persistência pós-refresh | Livro cadastrado | F5 após cadastro | Livro permanece | Pendente | Não executado |
| M06 | Consulta da interface em mobile | Navegador responsivo | Inspecionar largura 390px | Sem bloqueio de interação principal | Pendente | Não executado |

### Como registrar

Para cada execução, atualizar `Resultado obtido` (por exemplo, `HTTP 403, mensagem "Acesso exclusivo do administrador"`) e `Status` (Aprovado, Reprovado ou Bloqueado), com referência à evidência, data, ambiente e commit. Os logs gerados pelo script são parte das evidências; **a aprovação deve decorrer da execução**, não da tabela prevista.
