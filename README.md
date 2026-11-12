# BiblioWeb — Projeto Semestral de Programação para Web Avançada

Sistema de gerenciamento de biblioteca com dois perfis autenticados. Desenvolvido com **Node.js, Express, HTML/CSS/JS, Sequelize ORM, sessões/cookies, banco relacional e API REST**.

## 1. Funcionalidades

**Cliente (CLIENTE):** cadastro, login, catálogo, busca, empréstimo de exemplar disponível, histórico pessoal, devolução do próprio livro.

**Administrador (ADMIN):** login restrito, consulta ao catálogo, cadastro/edição/desativação/reativação de livros, listagem de todos os empréstimos, devolução de empréstimos. Admin só é criado pela variável de ambiente `ADMIN_EMAIL`/`ADMIN_PASSWORD`; cadastrar-se pelo site nunca dá acesso administrativo.

**Regras de negócio:** exemplar indisponível não pode ser emprestado, usuário não pode ter dois empréstimos ativos do mesmo livro, cliente não pode alterar livros ou empréstimos alheios, retirada de livro é lógica (`active=false`) para preservar histórico e exemplares disponíveis são incrementados na devolução.

## 2. Tecnologia e arquitetura

- Node.js 20+ / Express 4 — servidor HTTP e API REST.
- HTML5, CSS3, JavaScript puro — frontend responsivo usando `fetch`.
- Sequelize 6 (ORM, camada DAO) — SQLite para desenvolver localmente, PostgreSQL quando `DATABASE_URL` existe.
- bcryptjs — hash de senha; express-session + connect-session-sequelize — sessão persistida no banco de dados com cookie HTTP-only.
- cors — configura explicitamente origens autorizadas para consumir a API a partir de porta separada.
- helmet — cabeçalhos de proteção HTTP.

### Diagrama simplificado (MVC + DAO)

```text
Navegador / public (front-end: View visual)
     | HTTP/JSON + cookie de sessão
     v
Express /api/routes
     | middleware requireAuth / requireAdmin
     v
Controllers  <---- respostas JSON (View/Response da API)
     |
     v
DAOs (UserDao, BookDao, LoanDao)
     |
     v
Models Sequelize (User, Book, Loan)
     |
     v
SQLite (local) ou PostgreSQL (nuvem)
```

### Modelo de dados (relacional)

- `User` **1:N** `Loan` (`userId`): nome, e-mail, hash da senha, perfil (`CLIENTE`/`ADMIN`).
- `Book` **1:N** `Loan` (`bookId`): título, autor, categoria, exemplares totais/disponíveis, ativo.
- `Loan`: cliente, livro, status (`EMPRESTADO` ou `DEVOLVIDO`), criação e devolução.
- `Sessions`: tabela do controle de sessão do `connect-session-sequelize`.

## 3. Estrutura de pastas

```text
BiblioWeb/
├── .env.example
├── .gitignore
├── package.json
├── public/
│   ├── index.html                # interface visual
│   ├── app.js                    # fetch/API e interações
│   └── styles.css                # layout responsivo
├── src/
│   ├── config/database.js       # conexão SQLite ou PostgreSQL
│   ├── models/index.js          # models/tabelas e relacionamentos
│   ├── dao/                     # camada de acesso ao banco
│   ├── controllers/             # regras e respostas JSON
│   ├── middlewares/auth.js      # autenticação e autorização
│   ├── routes/index.js          # endpoints REST
│   ├── services/seed.js         # admin e acervo inicial
│   └── server.js                # Express, CORS, cookies e deploy
├── scripts/frontend-server.js  # frontend na porta 5500 (opcional)
└── data/                       # SQLite local não versionado
```

## 4. Rodar no computador (Windows)

1. Instale **Node.js LTS** (20 ou superior) e extraia o projeto.
2. Abra a pasta `BiblioWeb` no VS Code ou no terminal.
3. Instale dependências: `npm install`
4. Copie `.env.example` para `.env` (no PowerShell: `Copy-Item .env.example .env`).
5. **Edite `.env`** e substitua `SESSION_SECRET` por uma chave longa e aleatória (>=32 caracteres); personalize `ADMIN_PASSWORD` com pelo menos 12 caracteres. Defina um `ADMIN_EMAIL` que você usará na demonstração.
6. Execute `npm start` (ou `npm run dev` para reiniciar automaticamente quando alterar código).
7. Acesse **http://localhost:3000/**, crie um cliente; para administrador use o e-mail/senha colocados no `.env`.
8. Teste a saúde da API em **http://localhost:3000/api/health**.
9. Em outro terminal, execute `npm run smoke` para testar automaticamente cadastro, sessão, permissões, empréstimo, devolução e CRUD do administrador. **Esse teste cria registros de demonstração no banco local.**

**Para mostrar CORS entre portas distintas:** com backend já rodando na 3000, abra outro terminal na mesma pasta e execute `npm run front`. Entre em **http://localhost:5500/**. O frontend passa a consumir a API na porta 3000 usando cookies e CORS. Em produção, o frontend é servido pelo mesmo Express, evitando problemas de cookies de terceiros.

**Observação:** A senha do administrador inicial é gerada na primeira inicialização. Alterar `ADMIN_PASSWORD` no `.env` depois não atualiza automaticamente uma conta já criada. Para redefinição de demo, recrie o banco de desenvolvimento (isso apaga os dados locais) ou implemente fluxo seguro de troca de senha.

## 5. Endpoints REST (requer JSON e cookie de sessão após login)

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | `/api/health` | Público | Verificar serviço |
| POST | `/api/auth/register` | Público | Criar usuário CLIENTE |
| POST | `/api/auth/login` | Público | Login e gerar sessão |
| GET | `/api/auth/me` | Autenticado | Identificar usuário atual |
| POST | `/api/auth/logout` | Autenticado | Encerrar sessão |
| GET | `/api/books?search=dom` | Autenticado | Listar/buscar catálogo |
| GET | `/api/books/:id` | Autenticado | Detalhes do livro |
| POST | `/api/books` | ADMIN | Cadastrar livro |
| PUT/PATCH | `/api/books/:id` | ADMIN | Alterar livro |
| DELETE | `/api/books/:id` | ADMIN | Desativar livro (exclusão lógica) |
| GET | `/api/loans` | Autenticado | Próprios empréstimos (ADMIN vê todos) |
| POST | `/api/loans` | Autenticado | Emprestar exemplar |
| PATCH | `/api/loans/:id/return` | Dono/ADMIN | Devolver exemplar |

**Exemplo — cadastrar cliente (POST /api/auth/register):**

```json
{"name":"Maria Souza","email":"maria@example.com","password":"SenhaForte123"}
```

Resposta `201 Created` (o cookie `biblioweb.sid` é enviado no cabeçalho `Set-Cookie`):

```json
{"user":{"id":2,"name":"Maria Souza","email":"maria@example.com","role":"CLIENTE"}}
```

**Exemplo — cadastrar livro como ADMIN (POST /api/books):**

```json
{"title":"Dom Casmurro","author":"Machado de Assis","category":"Literatura brasileira","totalCopies":3}
```

Resposta `201 Created` (campos relevantes):

```json
{"id":5,"title":"Dom Casmurro","author":"Machado de Assis","category":"Literatura brasileira","totalCopies":3,"availableCopies":3,"active":true}
```

**Exemplo — empréstimo (POST /api/loans):**

```json
{"bookId":5}
```

Resposta `201 Created` (campos relevantes):

```json
{"id":1,"userId":2,"bookId":5,"status":"EMPRESTADO","returnedAt":null}
```

**Erros REST (JSON):** `400 Bad Request` para validação; `401 Unauthorized` para não autenticado; `403 Forbidden` para permissão negada; `404 Not Found` para recurso ausente; `409 Conflict` para conflito de cadastro ou disponibilidade; `500` para falhas inesperadas. Exemplo `403`:

```json
{"error":"Acesso exclusivo do administrador."}
```

## 6. Deploy em nuvem (GitHub + Render + PostgreSQL)

> **Pendente de execução na sua conta:** este ZIP entrega o código e instruções, mas não cria automaticamente um repositório nem um link público. O deploy precisa ser feito e verificado na hospedagem.

1. Crie um repositório no GitHub e envie os arquivos **sem `.env`, nem `node_modules`, nem banco `.sqlite`**.
2. Provisione uma instância de **PostgreSQL** no Render ou em provedor compatível e copie a URL de conexão do banco (`DATABASE_URL`). Os planos, limites e disponibilidade variam: consulte o painel do provedor.
3. No Render, crie `New > Web Service` apontando para o repositório. Use ambiente **Node**, comando de instalação `npm install`, comando de inicialização `npm start`.
4. Configure variáveis: `NODE_ENV=production`, `SESSION_SECRET` longo e aleatório, `ADMIN_EMAIL`, `ADMIN_PASSWORD` com 12+ caracteres, `DATABASE_URL`. Se o provedor exigir SSL, defina `DATABASE_SSL=true` (a verificação do certificado permanece ativa; confirme a CA confiável do seu provedor). O Render define `PORT` automaticamente.
5. Se optar por frontend em domínio separado, inclua sua origem exata em `FRONTEND_ORIGIN` e revise a estratégia de cookies. **A opção recomendada nesta entrega é usar o frontend já integrado ao servidor Express** para evitar bloqueio de cookies entre domínios.
6. Aguarde a inicialização, depois abra a URL fornecida e teste `/api/health`, login do cliente e do administrador, CRUD e empréstimo.
7. Anexe os dois links na entrega: **Aplicação**: `https://SEU-SERVICO.onrender.com/`; **API**: `https://SEU-SERVICO.onrender.com/api/health` (substituir pela URL real). Isso disponibiliza frontend e backend no serviço remoto.

**Importante:** o banco SQLite do desenvolvimento não é adequado a hospedagens com filesystem efêmero, pois os dados podem ser perdidos a cada reinício. Use PostgreSQL persistente no deploy.

## 7. Demonstração em sala (até 20 minutos)

1. **2 min:** tema, objetivo e divisão de responsabilidades do grupo.
2. **3 min:** camadas MVC + DAO, models e PostgreSQL/SQLite.
3. **3 min:** HTTP, API REST, JSON, status code e configuração CORS.
4. **5 min:** cadastro/login cliente, catálogo, empréstimo, devolução.
5. **4 min:** login admin, cadastro/edição/desativação, autorização no backend; mostrar `403` se cliente tentar `POST /api/books`.
6. **3 min:** links do deploy/GitHub, sessão e cookies no navegador, conclusões/perguntas.

## 8. Checklist do enunciado

- [x] Código preparado com HTTP GET/POST/PUT/PATCH/DELETE e status adequados.
- [x] Cookie e sessão persistida em banco.
- [x] Model/View-Response/Controller separados no backend.
- [x] DAO + Sequelize ORM + banco de dados real.
- [x] API REST documentada e consumida via frontend.
- [x] CORS explicitamente configurado, com teste em portas 5500/3000.
- [x] Interface web responsiva, com cliente/admin e verificação de permissão backend.
- [ ] Publicar o projeto remotamente e verificar seu funcionamento em conta de hospedagem.
- [ ] Enviar código ao GitHub e compartilhar link.
- [ ] Testar a apresentação do grupo e definir contribuições individuais.

## 9. Segurança e notas

- Senhas armazenadas com bcrypt, nunca no banco em texto puro.
- Usuários cliente jamais podem enviar `role=ADMIN` no cadastro: backend fixa perfil CLIENTE.
- Sessões armazenadas no banco; cookie `httpOnly` e `secure` quando `NODE_ENV=production`.
- Uso de `sameSite=lax`, indicado para frontend e backend da mesma origem (padrão de deploy incluído).
- Em sistema real de grande porte: acrescentar prevenção CSRF robusta, rate limiting em login/cadastro, migrações versionadas e testes automatizados abrangentes. Em SSL, mantenha a verificação dos certificados e configure a autoridade certificadora de seu provedor quando necessário.

*Projeto acadêmico de demonstração. Remova senhas de exemplo, não divulgue credenciais reais e valide as funcionalidades antes da avaliação.*
